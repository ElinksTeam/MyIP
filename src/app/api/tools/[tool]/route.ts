import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const RECORD_TYPES = new Set(["A", "AAAA", "CNAME", "MX", "NS", "TXT"]);
const RULE_HOST = /^ptest-[1-8]\.ipcheck\.ing$/;
const GLOBALPING = "https://api.globalping.io/v1/measurements";

function readableError(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["message", "detail", "description", "error"]) {
      if (typeof record[key] === "string" && record[key]) return record[key];
    }
    const issues = Array.isArray(record.issues) ? record.issues : Array.isArray(record.errors) ? record.errors : [];
    if (issues.length) {
      return issues.map((issue) => readableError(issue, "")).filter(Boolean).join("；") || fallback;
    }
  }
  return fallback;
}

function limited(request: NextRequest, key: string, limit = 20) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  return rateLimit(`${key}:${client}`, limit, 60_000).allowed;
}

async function jsonFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: { Accept: "application/json", "User-Agent": "ElinksNet/7.1", ...init.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const record = data as Record<string, unknown>;
    throw new Error(readableError(record.error ?? record.message ?? data, `上游服务返回 ${response.status}`));
  }
  return data;
}

async function serviceAvailable(url: string) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_500),
      headers: { Accept: "application/json", "User-Agent": "ElinksNet/7.1" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

function validTarget(value: string) {
  return isIP(value) > 0 || DOMAIN.test(value);
}

async function dnsLookup(hostname: string, type: string) {
  if (!DOMAIN.test(hostname) || !RECORD_TYPES.has(type)) throw new Error("域名或记录类型无效");
  const providers = [
    ["Google", "https://dns.google/resolve"],
    ["Cloudflare", "https://cloudflare-dns.com/dns-query"],
    ["AdGuard", "https://dns.adguard-dns.com/resolve"],
    ["AliDNS", "https://dns.alidns.com/resolve"],
  ];
  const results = await Promise.allSettled(providers.map(async ([provider, base]) => {
    const data = await jsonFetch(`${base}?name=${encodeURIComponent(hostname)}&type=${type}`, {
      headers: { Accept: "application/dns-json" },
    }) as { Status?: number; Answer?: Array<{ name: string; type: number; TTL: number; data: string }> };
    return { provider, status: data.Status ?? -1, answers: data.Answer || [] };
  }));
  return results.map((result, index) => result.status === "fulfilled"
    ? result.value
    : { provider: providers[index][0], status: -1, answers: [], error: "查询失败" });
}

async function rdapLookup(query: string) {
  const value = query.trim();
  let type = "domain";
  let target = value.toLowerCase();
  if (isIP(value)) type = "ip";
  else if (/^AS\d+$/i.test(value)) { type = "autnum"; target = value.slice(2); }
  else if (/^\d{1,10}$/.test(value)) type = "autnum";
  else if (!DOMAIN.test(value)) throw new Error("请输入有效域名、IP 或 ASN");
  const data = await jsonFetch(`https://rdap.org/${type}/${encodeURIComponent(target)}`, {
    headers: { Accept: "application/rdap+json, application/json" },
  });
  return { query: target, type, source: `https://rdap.org/${type}/${target}`, data };
}

async function macLookup(mac: string) {
  const normalized = mac.replace(/[:-]/g, "").toUpperCase();
  if (!/^[0-9A-F]{12}$/.test(normalized)) throw new Error("请输入完整的 12 位 MAC 地址");
  const token = process.env.MAC_LOOKUP_API_KEY;
  const data = await jsonFetch(`https://api.maclookup.app/v2/macs/${normalized}${token ? `?apiKey=${encodeURIComponent(token)}` : ""}`) as Record<string, unknown>;
  const first = Number.parseInt(normalized.slice(0, 2), 16);
  return { ...data, normalized: normalized.match(/.{2}/g)?.join(":"), isMulticast: Boolean(first & 1), isLocal: Boolean(first & 2) };
}

async function traceLookup(hostname: string) {
  if (!RULE_HOST.test(hostname)) throw new Error("规则测试地址无效");
  const response = await fetch(`https://${hostname}/cdn-cgi/trace`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`线路返回 ${response.status}`);
  const entries = Object.fromEntries((await response.text()).trim().split("\n").map((line) => line.split("=", 2)));
  return { host: hostname, ip: entries.ip || null, country: entries.loc || null, colo: entries.colo || null };
}

async function invisibilityLookup(id: string) {
  if (!/^[a-zA-Z0-9]{28}$/.test(id)) throw new Error("用户 ID 格式无效");
  const endpoint = process.env.ELINKSNET_API_ENDPOINT || process.env.IPCHECKING_API_ENDPOINT;
  const key = process.env.ELINKSNET_API_KEY || process.env.IPCHECKING_API_KEY;
  if (!endpoint || !key) throw new Error("隐身检测服务尚未配置");
  return jsonFetch(`${endpoint.replace(/\/$/, "")}/getpdresult/${id}?apikey=${encodeURIComponent(key)}`);
}

export async function GET(request: NextRequest, context: { params: Promise<{ tool: string }> }) {
  const { tool } = await context.params;
  if (!limited(request, `tool:${tool}`)) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  const search = request.nextUrl.searchParams;
  try {
    if (tool === "dns") return NextResponse.json({ data: await dnsLookup(search.get("hostname") || "", (search.get("type") || "A").toUpperCase()) });
    if (tool === "rdap" || tool === "whois") return NextResponse.json({ data: await rdapLookup(search.get("query") || "") });
    if (tool === "mac") return NextResponse.json({ data: await macLookup(search.get("mac") || "") });
    if (tool === "trace") return NextResponse.json({ data: await traceLookup(search.get("host") || "") });
    if (tool === "invisibility") return NextResponse.json({ data: await invisibilityLookup(search.get("id") || "") });
    if (tool === "globalping") {
      const id = search.get("id") || "";
      if (!/^[a-zA-Z0-9_-]{4,80}$/.test(id)) throw new Error("测量 ID 无效");
      return NextResponse.json({ data: await jsonFetch(`${GLOBALPING}/${encodeURIComponent(id)}`) });
    }
    if (tool === "status") {
      const [ipwhois, ipapi, freeipapi, countryis, ipapicom] = await Promise.all([
        serviceAvailable("https://ipwho.is/8.8.8.8"),
        serviceAvailable("https://ipapi.co/8.8.8.8/json/"),
        serviceAvailable("https://free.freeipapi.com/api/json/8.8.8.8"),
        serviceAvailable("https://api.country.is/8.8.8.8?fields=location,asn"),
        serviceAvailable("http://ip-api.com/json/8.8.8.8?fields=status"),
      ]);
      return NextResponse.json({ data: {
        core: true,
        ai: Boolean(process.env.GROQ_API_KEY),
        ipwhois,
        ipapi,
        freeipapi,
        countryis,
        ipapicom,
        ipapiis: Boolean(process.env.IPAPIIS_API_KEY),
        ipinfo: Boolean(process.env.IPINFO_API_TOKEN),
        ip2location: Boolean(process.env.IP2LOCATION_API_KEY),
        mac: true,
        invisibility: Boolean(process.env.ELINKSNET_API_ENDPOINT || process.env.IPCHECKING_API_ENDPOINT),
      } });
    }
    return NextResponse.json({ error: "未知工具" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "工具服务不可用" }, { status: 502 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ tool: string }> }) {
  const { tool } = await context.params;
  if (tool !== "globalping") return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  if (!limited(request, "globalping", 8)) return NextResponse.json({ error: "测量请求过于频繁" }, { status: 429 });
  try {
    const body = await request.json() as {
      target?: string; type?: string; locations?: Array<{ country: string; limit?: number }>;
      measurementOptions?: Record<string, unknown>;
    };
    if (!body.target || !validTarget(body.target) || !["ping", "mtr", "http"].includes(body.type || "")) throw new Error("测量参数无效");
    const countries = (body.locations || []).slice(0, 20).filter((item) => /^[A-Z]{2}$/.test(item.country));
    if (!countries.length) throw new Error("测量地区无效");
    const payload = {
      limit: countries.length,
      locations: countries.map(({ country }) => ({ country })),
      target: body.target,
      type: body.type,
      measurementOptions: body.measurementOptions || {},
    };
    return NextResponse.json({ data: await jsonFetch(GLOBALPING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "无法创建全球测量" }, { status: 502 });
  }
}
