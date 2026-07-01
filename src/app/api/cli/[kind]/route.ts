import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ kind: string }> }) {
  const { kind } = await context.params;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  if (kind === "ip") {
    if (request.nextUrl.searchParams.get("format") === "json") return NextResponse.json({ ip: forwarded });
    return new NextResponse(forwarded, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (kind === "geo") {
    const target = request.nextUrl.searchParams.get("ip") || forwarded;
    const origin = new URL(request.url).origin;
    const response = await fetch(`${origin}/api/lookup?ip=${encodeURIComponent(target)}`, {
      headers: { "x-forwarded-for": forwarded },
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  }
  return NextResponse.json({ error: "Unknown CLI endpoint" }, { status: 404 });
}
