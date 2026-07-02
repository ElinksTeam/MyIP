import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RecordValue = Record<string, unknown>;
type SourceCategory = "geolocation" | "network" | "security" | "registry";
type SourceDefinition = {
  name: string;
  category: SourceCategory;
  url: (ip: string) => string | null;
  format?: "json" | "ip2c" | "lines";
};

const text = (value: unknown) => (value === undefined || value === null || value === "" ? null : String(value));
const numeric = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const flag = (value: unknown) => value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
const isLocalAddress = (value: string) =>
  value === "127.0.0.1" || value === "::1" || value.startsWith("::ffff:127.") ||
  value.startsWith("10.") || value.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(value);

const sources: SourceDefinition[] = [
  { name: "IPWho.is", category: "geolocation", url: (ip) => `https://ipwho.is/${ip}` },
  { name: "ipapi.co", category: "geolocation", url: (ip) => `https://ipapi.co/${ip}/json/` },
  { name: "FreeIPAPI", category: "geolocation", url: (ip) => `https://free.freeipapi.com/api/json/${ip}` },
  { name: "Country.is", category: "geolocation", url: (ip) => `https://api.country.is/${ip}?fields=city,continent,subdivision,postal,location,asn` },
  { name: "IP-API.com", category: "security", url: (ip) => `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,district,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query` },
  { name: "GeoJS", category: "geolocation", url: (ip) => `https://get.geojs.io/v1/ip/geo/${ip}.json` },
  { name: "IPQuery", category: "security", url: (ip) => `https://api.ipquery.io/${ip}` },
  { name: "IP.Guide", category: "network", url: (ip) => `https://ip.guide/${ip}` },
  { name: "IP.SB", category: "network", url: (ip) => `https://api.ip.sb/geoip/${ip}` },
  { name: "IPLocation.net", category: "geolocation", url: (ip) => `https://api.iplocation.net/?ip=${ip}` },
  { name: "IPWhois.app", category: "geolocation", url: (ip) => `https://ipwhois.app/json/${ip}` },
  { name: "ReallyFreeGeoIP", category: "geolocation", url: (ip) => `https://reallyfreegeoip.org/json/${ip}` },
  { name: "IPinfo Public", category: "network", url: (ip) => `https://ipinfo.io/${ip}/json` },
  { name: "IPBase", category: "geolocation", url: (ip) => `https://api.ipbase.com/v1/json/${ip}` },
  { name: "FreeGeoIP", category: "geolocation", url: (ip) => `https://freegeoip.app/json/${ip}` },
  { name: "IP2Location Public", category: "geolocation", url: (ip) => `https://api.ip2location.io/?ip=${ip}` },
  { name: "SeeIP", category: "geolocation", url: (ip) => `https://api.seeip.org/geoip/${ip}` },
  { name: "TechnikNews", category: "geolocation", url: (ip) => `https://api.techniknews.net/ipgeo/${ip}` },
  { name: "GeolocationDB", category: "geolocation", url: (ip) => `https://geolocation-db.com/json/${ip}` },
  { name: "IP2C", category: "geolocation", format: "ip2c", url: (ip) => `https://ip2c.org/${ip}` },
  { name: "HackerTarget", category: "geolocation", format: "lines", url: (ip) => `https://api.hackertarget.com/geoip/?q=${ip}` },
  { name: "ARIN RDAP", category: "registry", url: (ip) => `https://rdap.arin.net/registry/ip/${ip}` },
  { name: "RIPE Stat", category: "registry", url: (ip) => `https://stat.ripe.net/data/prefix-overview/data.json?resource=${ip}` },
  { name: "Robtex", category: "network", url: (ip) => `https://freeapi.robtex.com/ipquery/${ip}` },
  { name: "Shodan InternetDB", category: "security", url: (ip) => `https://internetdb.shodan.io/${ip}` },
  { name: "IPAPI.is", category: "security", url: (ip) => process.env.IPAPIIS_API_KEY ? `https://api.ipapi.is/?q=${ip}&key=${process.env.IPAPIIS_API_KEY.split(",")[0].trim()}` : `https://api.ipapi.is/?q=${ip}` },
  { name: "IPinfo Authenticated", category: "network", url: (ip) => process.env.IPINFO_API_TOKEN ? `https://api.ipinfo.io/lite/${ip}?token=${process.env.IPINFO_API_TOKEN.split(",")[0].trim()}` : null },
  { name: "IP2Location Authenticated", category: "geolocation", url: (ip) => process.env.IP2LOCATION_API_KEY ? `https://api.ip2location.io/?key=${process.env.IP2LOCATION_API_KEY.split(",")[0].trim()}&ip=${ip}` : null },
];

function parseLines(value: string) {
  return Object.fromEntries(value.split(/\r?\n/).map((line) => line.split(/:\s+/, 2)).filter((parts) => parts.length === 2));
}

async function fetchSource(definition: SourceDefinition, ip: string) {
  const url = definition.url(encodeURIComponent(ip));
  if (!url) throw new Error("not configured");
  const response = await fetch(url, {
    signal: AbortSignal.timeout(6_500),
    headers: { Accept: "application/json, text/plain;q=0.8", "User-Agent": "ElinksNet/7.2" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  const body = await response.text();
  let raw: RecordValue;
  if (definition.format === "ip2c") {
    const [status, countryCode, countryCode3, country] = body.split(";");
    if (status !== "1") throw new Error("no result");
    raw = { country_code: countryCode, country_code3: countryCode3, country_name: country };
  } else if (definition.format === "lines") {
    raw = parseLines(body);
  } else {
    raw = JSON.parse(body) as RecordValue;
  }
  if (raw.error || raw.errorCode || raw.success === false || raw.status === "fail") throw new Error("provider rejected query");
  return raw;
}

function normalize(ip: string, definition: SourceDefinition, raw: RecordValue) {
  const location = (raw.location as RecordValue) || {};
  const asn = (raw.asn as RecordValue) || {};
  const connection = (raw.connection as RecordValue) || {};
  const security = (raw.security as RecordValue) || {};
  const ispObject = (raw.isp as RecordValue) || {};
  const network = (raw.network as RecordValue) || {};
  const autonomousSystem = (network.autonomous_system as RecordValue) || {};
  const ripe = (raw.data as RecordValue) || {};
  const coordinates = typeof raw.loc === "string" ? raw.loc.split(",") : [];
  const normalized = {
    source: definition.name,
    category: definition.category,
    ip: text(raw.ip ?? raw.ipAddress ?? raw.IPv4) || ip,
    city: text(raw.city ?? raw.cityName ?? raw.City ?? location.city),
    region: text(raw.region ?? raw.regionName ?? raw.State ?? raw.subdivision ?? location.state),
    district: text(raw.district ?? location.district),
    country: text(raw.country_name ?? raw.countryName ?? raw.Country ?? (String(raw.country || "").length > 2 ? raw.country : null) ?? location.country_name ?? location.country),
    countryCode: text(raw.country_code ?? raw.countryCode ?? raw.country_code2 ?? location.country_code ?? (String(raw.country || "").length === 2 ? raw.country : null)),
    postalCode: text(raw.postal ?? raw.zip ?? raw.zipCode ?? location.zip),
    timezone: text(
      (typeof raw.timezone === "object" && raw.timezone ? (raw.timezone as RecordValue).id : raw.timezone) ??
      (typeof location.timezone === "object" && location.timezone ? (location.timezone as RecordValue).id : location.timezone) ??
      location.time_zone ?? (Array.isArray(raw.timeZones) ? raw.timeZones[0] : raw.timeZones),
    ),
    latitude: numeric(raw.latitude ?? raw.lat ?? raw.Latitude ?? location.latitude ?? coordinates[0]),
    longitude: numeric(raw.longitude ?? raw.lon ?? raw.Longitude ?? location.longitude ?? coordinates[1]),
    asn: text(
      raw.asn && typeof raw.asn !== "object" ? raw.asn :
      asn.asn ?? asn.number ?? connection.asn ?? ispObject.asn ?? raw.as ?? raw.as_number ??
      autonomousSystem.asn ?? (Array.isArray(ripe.asns) ? ripe.asns[0] : null),
    ),
    organization: text(
      raw.org ?? raw.organization ?? raw.asnOrganization ?? raw.asname ?? raw.as_name ?? raw.hostname ??
      asn.org ?? asn.organization ?? connection.org ?? connection.isp ?? ispObject.org ?? ispObject.isp ??
      autonomousSystem.organization ?? ripe.holder,
    ),
    isp: text(typeof raw.isp === "string" ? raw.isp : connection.isp ?? ispObject.isp),
    proxy: flag(raw.is_proxy ?? raw.isProxy ?? raw.proxy ?? security.proxy ?? security.is_proxy),
    hosting: flag(raw.is_datacenter ?? raw.hosting ?? security.hosting ?? security.is_datacenter),
    vpn: flag(raw.is_vpn ?? security.vpn),
    tor: flag(raw.is_tor ?? security.tor),
    sourceType: text(
      raw.type ?? raw.usage_type ?? raw.usageType ?? security.type ??
      connection.type ?? (raw.company && typeof raw.company === "object" ? (raw.company as RecordValue).type : null),
    ),
    details: definition.category === "registry"
      ? { handle: raw.handle, name: raw.name, prefix: ripe.prefix, holder: ripe.holder }
      : definition.name === "Shodan InternetDB"
        ? { ports: raw.ports, hostnames: raw.hostnames, vulnerabilities: raw.vulns }
        : undefined,
  };
  const fields = Object.entries(normalized)
    .filter(([key, value]) => !["source", "category", "details"].includes(key) && value !== null && value !== false && value !== "")
    .map(([key]) => key);
  return { ...normalized, fields };
}

export async function GET(request: NextRequest) {
  let ip = request.nextUrl.searchParams.get("ip")?.trim() || "";
  if (!ip) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    if (isIP(forwarded) && !isLocalAddress(forwarded)) ip = forwarded;
    else {
      try {
        const response = await fetch("https://api64.ipify.org?format=json", { cache: "no-store", signal: AbortSignal.timeout(6_000) });
        ip = text(((await response.json()) as RecordValue).ip) || "";
      } catch {
        return NextResponse.json({ error: "Unable to determine the current public IP." }, { status: 502 });
      }
    }
  }
  if (!isIP(ip)) return NextResponse.json({ error: "Please enter a valid IPv4 or IPv6 address." }, { status: 400 });

  const client = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`lookup:${client}`, 30).allowed) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });

  const available = sources.filter((definition) => Boolean(definition.url(encodeURIComponent(ip))));
  const settled = await Promise.allSettled(available.map(async (definition) =>
    normalize(ip, definition, await fetchSource(definition, ip)),
  ));
  const successful = settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (!successful.length) return NextResponse.json({ error: "IP intelligence sources are temporarily unavailable." }, { status: 502 });

  const pick = <K extends keyof (typeof successful)[number]>(key: K) =>
    successful.find((item) => item[key] !== null && item[key] !== "")?.[key] ?? null;
  const locationVotes = successful.filter((item) => item.countryCode).map((item) => item.countryCode);
  const majorityCountry = locationVotes.sort((a, b) =>
    locationVotes.filter((value) => value === b).length - locationVotes.filter((value) => value === a).length,
  )[0] || pick("countryCode");
  const agreement = locationVotes.length
    ? Math.round(locationVotes.filter((value) => value === majorityCountry).length / locationVotes.length * 100)
    : 0;
  const proxy = successful.some((item) => item.proxy);
  const vpn = successful.some((item) => item.vpn);
  const tor = successful.some((item) => item.tor);
  const hosting = successful.some((item) => item.hosting);
  const typeText = successful.map((item) => String(item.sourceType || "")).join(" ").toLowerCase();
  const organizationText = successful.map((item) => `${item.organization || ""} ${item.isp || ""}`).join(" ").toLowerCase();
  const networkType = tor ? "tor" : hosting || /hosting|datacenter|data center|cdn|cloud/.test(typeText)
    ? "datacenter" : vpn ? "vpn" : proxy ? "proxy"
    : /mobile|cellular|wireless/.test(`${typeText} ${organizationText}`) ? "mobile" : "residential";
  const riskPenalty = (tor ? 38 : 0) + (vpn ? 20 : 0) + (proxy ? 18 : 0) + (hosting ? 16 : 0);
  const qualityScore = Math.max(0, Math.min(100, 96 - riskPenalty + Math.round((agreement - 80) / 5)));
  const qualityGrade = qualityScore >= 85 ? "excellent" : qualityScore >= 70 ? "good" : qualityScore >= 50 ? "review" : "high-risk";

  return NextResponse.json({
    data: {
      ip,
      city: pick("city"), region: pick("region"), district: pick("district"),
      country: pick("country"), countryCode: majorityCountry, postalCode: pick("postalCode"),
      timezone: pick("timezone"), latitude: pick("latitude"), longitude: pick("longitude"),
      asn: pick("asn"), organization: pick("organization"), isp: pick("isp"),
      proxy, hosting, vpn, tor, networkType, qualityScore, qualityGrade,
      confidence: Math.min(99, Math.round((agreement * 0.7) + (Math.min(successful.length, 20) / 20 * 29))),
    },
    sources: successful,
    meta: {
      providers: successful.length,
      attempted: available.length,
      failed: available.length - successful.length,
      agreement,
      categories: Object.fromEntries(["geolocation", "network", "security", "registry"].map((category) => [
        category, successful.filter((source) => source.category === category).length,
      ])),
    },
  });
}
