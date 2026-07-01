import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`ai:${client}`, 8, 60_000).allowed) {
    return NextResponse.json({ error: "AI 分析请求过于频繁，请稍后再试" }, { status: 429 });
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Elinks AI 尚未配置 GROQ_API_KEY" }, { status: 503 });
  }

  const body = (await request.json()) as { question?: string; diagnostics?: unknown };
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.ELINKS_AI_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.25,
      max_completion_tokens: 900,
      messages: [
        { role: "system", content: "你是 ElinksNet 网络安全分析助手。根据检测数据给出简洁、可执行的中文建议。不要声称绝对安全；不要输出用户密钥。" },
        { role: "user", content: `问题：${body.question || "分析当前网络安全与代理风险"}\n检测数据：${JSON.stringify(body.diagnostics || {})}` },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return NextResponse.json({ error: "AI 上游服务暂时不可用" }, { status: 502 });
  const data = await response.json();
  return NextResponse.json({ answer: data.choices?.[0]?.message?.content || "暂时没有生成分析结果。" });
}
