import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const localeMap: Record<string, string> = { en: "en", zh: "zh-CN", ja: "ja", th: "th" };

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));
  const locale = localeMap[request.nextUrl.searchParams.get("locale") || "en"] || "en";
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }
  const client = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`localize:${client}`, 40).allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${encodeURIComponent(locale)}`,
      { cache: "no-store", signal: AbortSignal.timeout(7_000) },
    );
    if (!response.ok) throw new Error();
    const data = await response.json();
    return NextResponse.json({
      country: data.countryName || null,
      region: data.principalSubdivision || null,
      city: data.city || data.locality || null,
      district: data.locality && data.locality !== data.city ? data.locality : null,
      postalCode: data.postcode || null,
    });
  } catch {
    return NextResponse.json({ error: "Location localization is unavailable." }, { status: 502 });
  }
}
