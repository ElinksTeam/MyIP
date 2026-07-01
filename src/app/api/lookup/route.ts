import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type RecordValue = Record<string, unknown>;

const text = (value: unknown) => (value === undefined || value === null || value === "" ? null : String(value));
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const isLocalAddress = (value: string) =>
  value === "127.0.0.1" ||
  value === "::1" ||
  value.startsWith("::ffff:127.") ||
  value.startsWith("10.") ||
  value.startsWith("192.168.") ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(value);

function normalize(ip: string, source: string, raw: RecordValue) {
  const location = (raw.location as RecordValue) || {};
  const asn = (raw.asn as RecordValue) || {};
  const connection = (raw.connection as RecordValue) || {};
  const security = (raw.security as RecordValue) || {};
  return {
    source,
    ip: text(raw.ip) || ip,
    city: text(raw.city ?? location.city),
    region: text(raw.region ?? raw.regionName ?? location.state),
    district: text(raw.district),
    country: text(raw.country_name ?? raw.countryName ?? location.country ?? raw.country),
    countryCode: text(raw.country_code ?? raw.countryCode ?? location.country_code),
    postalCode: text(raw.postal ?? raw.zip ?? location.zip),
    timezone: text(
      (typeof raw.timezone === "object" && raw.timezone ? (raw.timezone as RecordValue).id : raw.timezone) ??
      (typeof location.timezone === "object" && location.timezone ? (location.timezone as RecordValue).id : location.timezone),
    ),
    latitude: number(raw.latitude ?? raw.lat ?? location.latitude),
    longitude: number(raw.longitude ?? raw.lon ?? location.longitude),
    asn: text(raw.asn && typeof raw.asn !== "object" ? raw.asn : asn.asn ?? connection.asn),
    organization: text(raw.org ?? raw.organization ?? asn.org ?? connection.org ?? connection.isp),
    isp: text(raw.isp ?? connection.isp),
    proxy: Boolean(raw.is_proxy ?? raw.proxy ?? security.proxy ?? raw.is_vpn ?? raw.is_tor),
    hosting: Boolean(raw.is_datacenter ?? raw.hosting ?? security.hosting),
    vpn: Boolean(raw.is_vpn ?? security.vpn),
    tor: Boolean(raw.is_tor ?? security.tor),
    raw,
  };
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(7_000),
    headers: { "User-Agent": "ElinksNet/7.0" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  return (await response.json()) as RecordValue;
}

export async function GET(request: NextRequest) {
  let ip = request.nextUrl.searchParams.get("ip")?.trim() || "";
  if (!ip) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    if (isIP(forwarded) && !isLocalAddress(forwarded)) {
      ip = forwarded;
    } else {
      try {
        const discovery = await fetchJson("https://api64.ipify.org?format=json");
        ip = text(discovery.ip) || "";
      } catch {
        return NextResponse.json({ error: "暂时无法识别当前公网 IP，请手动输入地址" }, { status: 502 });
      }
    }
  }
  if (!isIP(ip)) return NextResponse.json({ error: "请输入有效的 IPv4 或 IPv6 地址" }, { status: 400 });

  const client = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const quota = rateLimit(`lookup:${client}`, 30);
  if (!quota.allowed) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

  const providers: Array<[string, string | null]> = [
    ["IPWho.is", `https://ipwho.is/${encodeURIComponent(ip)}`],
    ["IP-API.com", `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,district,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`],
    ["IPAPI.is", process.env.IPAPIIS_API_KEY ? `https://api.ipapi.is/?q=${encodeURIComponent(ip)}&key=${process.env.IPAPIIS_API_KEY.split(",")[0].trim()}` : null],
    ["IPinfo", process.env.IPINFO_API_TOKEN ? `https://api.ipinfo.io/lite/${encodeURIComponent(ip)}?token=${process.env.IPINFO_API_TOKEN.split(",")[0].trim()}` : null],
    ["IP2Location", process.env.IP2LOCATION_API_KEY ? `https://api.ip2location.io/?key=${process.env.IP2LOCATION_API_KEY.split(",")[0].trim()}&ip=${encodeURIComponent(ip)}` : null],
  ];

  const settled = await Promise.allSettled(
    providers.filter((item): item is [string, string] => Boolean(item[1])).map(async ([source, url]) => normalize(ip, source, await fetchJson(url))),
  );
  const sources = settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  if (!sources.length) return NextResponse.json({ error: "暂时无法获取该 IP 的情报数据" }, { status: 502 });

  const pick = <K extends keyof (typeof sources)[number]>(key: K) => sources.find((item) => item[key] !== null && item[key] !== "")?.[key] ?? null;
  const fused = {
    ip,
    city: pick("city"),
    region: pick("region"),
    district: pick("district"),
    country: pick("country"),
    countryCode: pick("countryCode"),
    postalCode: pick("postalCode"),
    timezone: pick("timezone"),
    latitude: pick("latitude"),
    longitude: pick("longitude"),
    asn: pick("asn"),
    organization: pick("organization"),
    isp: pick("isp"),
    proxy: sources.some((item) => item.proxy),
    hosting: sources.some((item) => item.hosting),
    vpn: sources.some((item) => item.vpn),
    tor: sources.some((item) => item.tor),
    confidence: Math.min(99, 62 + sources.length * 7),
  };

  return NextResponse.json({
    data: fused,
    sources: sources.map((source) =>
      Object.fromEntries(Object.entries(source).filter(([key]) => key !== "raw")),
    ),
    meta: { providers: sources.length },
  });
}
