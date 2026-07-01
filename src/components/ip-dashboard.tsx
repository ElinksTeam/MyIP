"use client";

import { Button, Chip } from "@heroui/react";
import { Bot, CheckCircle2, Copy, Globe2, LocateFixed, RefreshCw, Search, ShieldAlert, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkDiagnostics } from "@/components/network-diagnostics";

type IpData = {
  ip: string; city: string | null; region: string | null; district: string | null; country: string | null;
  countryCode: string | null; postalCode: string | null; timezone: string | null; latitude: number | null;
  longitude: number | null; asn: string | null; organization: string | null; isp: string | null;
  proxy: boolean; hosting: boolean; vpn: boolean; tor: boolean; confidence: number;
};
type Lookup = { data: IpData; sources: Array<Record<string, unknown>>; meta: { providers: number } };

export function IpDashboard() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [question, setQuestion] = useState("请分析这个 IP 的代理风险、网络质量与安全注意事项");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function lookup(ip?: string) {
    setLoading(true); setError("");
    try {
      const target = ip || query;
      const response = await fetch(target ? `/api/lookup?ip=${encodeURIComponent(target)}` : "/api/lookup");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload);
      setQuery(payload.data.ip);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "检测失败，请稍后重试");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void lookup(), 0);
    return () => window.clearTimeout(timer);
    // Initial visitor-IP discovery only; later lookups are user initiated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function askAi() {
    if (!result) return;
    setAiLoading(true); setAnswer("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, diagnostics: result }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setAnswer(payload.answer);
    } catch (cause) { setAnswer(cause instanceof Error ? cause.message : "AI 分析失败"); }
    finally { setAiLoading(false); }
  }

  const data = result?.data;
  const fields = data ? [
    ["国家 / 地区", [data.country, data.countryCode].filter(Boolean).join(" · ")],
    ["城市", [data.region, data.city, data.district].filter(Boolean).join(" · ")],
    ["邮政编码", data.postalCode], ["时区", data.timezone],
    ["网络组织", data.organization || data.isp], ["ASN", data.asn],
    ["经纬度", data.latitude !== null ? `${data.latitude}, ${data.longitude}` : null],
  ] : [];

  return (
    <>
      <section className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 font-mono text-xs uppercase tracking-[.2em] text-primary">Unified IP intelligence</p><h1 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">网络情报工作台</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">融合多个实时数据源，统一展示地址、网络归属和代理风险。</p></div>
        <Chip color="success" variant="soft"><span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> 服务在线</span></Chip>
      </section>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><Input className="pl-10 font-mono" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void lookup(query)} placeholder="输入 IPv4 或 IPv6 地址" /></div>
          <Button variant="primary" onPress={() => void lookup(query)} isDisabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />检测 IP</Button>
        </CardContent>
      </Card>

      {error && <Card className="mb-6 bg-red-500/5"><CardContent className="flex items-center gap-3 text-sm text-red-400"><ShieldAlert className="size-5" />{error}</CardContent></Card>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>融合 IP 情报</CardTitle><CardDescription>{loading ? "正在连接全球数据源" : `${result?.meta.providers || 0} 个来源已完成交叉验证`}</CardDescription></div>
            {data && <Chip variant="soft" color={data.proxy || data.vpn || data.tor ? "danger" : "success"}>{data.proxy || data.vpn || data.tor ? "检测到代理" : "未发现代理"}</Chip>}
          </CardHeader>
          <CardContent>
            {loading ? <LoadingState /> : data && (
              <>
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div><div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Globe2 className="size-4" /> 当前检测地址</div><p className="break-all font-mono text-2xl font-semibold sm:text-3xl">{data.ip}</p></div>
                  <button aria-label="复制 IP" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => navigator.clipboard.writeText(data.ip)}><Copy className="size-4" /></button>
                </div>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  {fields.map(([label, value]) => <div key={label} className="flex min-h-16 items-center justify-between gap-4 border-t border-white/[.06] py-3"><span className="text-xs text-muted-foreground">{label}</span><span className="text-right text-sm font-medium">{value || "—"}</span></div>)}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader><CardTitle>风险概览</CardTitle><CardDescription>基于全部可用来源综合判断</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <RiskRow label="代理 / VPN" active={Boolean(data?.proxy || data?.vpn)} />
              <RiskRow label="Tor 出口" active={Boolean(data?.tor)} />
              <RiskRow label="数据中心" active={Boolean(data?.hosting)} />
              <div className="pt-2"><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">数据置信度</span><span>{data?.confidence || 0}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data?.confidence || 0}%` }} /></div></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4"><div className="rounded-xl bg-primary/12 p-3 text-primary"><LocateFixed className="size-5" /></div><div><p className="text-sm font-medium">数据最小化</p><p className="mt-1 text-xs leading-5 text-muted-foreground">检测结果只用于当前分析，不在浏览器中长期保存。</p></div></CardContent>
          </Card>
        </div>
      </div>
      <NetworkDiagnostics report={result} />

      <Button className="fixed bottom-6 right-6 z-30 shadow-xl" variant="primary" onPress={() => setAiOpen(true)}><Sparkles className="size-4" /> Elinks AI</Button>
      {aiOpen && <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/45 p-3 backdrop-blur-sm sm:p-6" onClick={() => setAiOpen(false)}>
        <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Bot className="size-5 text-primary" />Elinks AI 分析</CardTitle><CardDescription>检测数据会随问题发送给 Groq 模型进行分析</CardDescription></div><button aria-label="关闭" onClick={() => setAiOpen(false)}><X className="size-5" /></button></CardHeader>
          <CardContent className="space-y-4"><textarea className="min-h-24 w-full resize-none rounded-xl bg-muted/60 p-3 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-primary/60" value={question} onChange={(e) => setQuestion(e.target.value)} />{answer && <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm leading-6">{answer}</div>}<Button className="w-full" variant="primary" onPress={() => void askAi()} isDisabled={aiLoading || !result}>{aiLoading ? "正在分析…" : "发送检测数据并分析"}</Button></CardContent>
        </Card>
      </div>}
    </>
  );
}

function LoadingState() {
  return <div className="space-y-5"><Skeleton className="h-9 w-2/3" /><div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></div>;
}
function RiskRow({ label, active }: { label: string; active: boolean }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={`flex items-center gap-1.5 text-xs ${active ? "text-amber-400" : "text-emerald-400"}`}>{active ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}{active ? "需要注意" : "未发现"}</span></div>;
}
