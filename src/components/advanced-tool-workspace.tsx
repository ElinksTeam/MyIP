"use client";

import { Button, Chip } from "@heroui/react";
import {
  CheckCircle2, LoaderCircle, Play, RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Json = Record<string, unknown>;
const LOCATIONS = ["HK", "TW", "CN", "JP", "SG", "IN", "RU", "US", "CA", "AU", "GB", "DE", "BR", "ZA", "KR", "FR"].map((country) => ({ country }));
const CENSORSHIP_LOCATIONS = ["CN", "RU", "TR", "SA", "JP", "US", "CA", "IT", "FI", "AU", "FR", "DE"].map((country) => ({ country, limit: ["CN", "RU", "TR", "SA"].includes(country) ? 2 : 1 }));

async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `请求失败：${response.status}`);
  return payload.data as T;
}

export function AdvancedToolWorkspace({ slug, name }: { slug: string; name: string }) {
  if (slug === "ping" || slug === "mtr" || slug === "censorship") return <GlobalMeasurement mode={slug} />;
  if (slug === "dns") return <DnsTool />;
  if (slug === "rdap" || slug === "whois") return <RegistryTool mode={slug} />;
  if (slug === "mac") return <MacTool />;
  if (slug === "browser") return <BrowserTool />;
  if (slug === "rules") return <RuleTool />;
  if (slug === "security") return <SecurityTool />;
  if (slug === "invisibility") return <InvisibilityTool />;
  return <Card><CardContent><p>{name} 已接入。</p></CardContent></Card>;
}

function ToolForm({ value, onChange, onRun, loading, placeholder, action = "开始检测", children }: {
  value: string; onChange: (value: string) => void; onRun: () => void; loading: boolean; placeholder: string; action?: string; children?: React.ReactNode;
}) {
  return <Card className="mb-6"><CardContent className="space-y-4">
    {children}
    <div className="flex flex-col gap-3 sm:flex-row"><Input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onRun()} placeholder={placeholder} className="font-mono" /><Button variant="primary" onPress={onRun} isDisabled={loading || !value.trim()}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}{loading ? "检测中…" : action}</Button></div>
  </CardContent></Card>;
}

function Message({ error }: { error: string }) {
  return error ? <div className="mb-6 rounded-xl bg-red-500/8 p-4 text-sm text-red-400 ring-1 ring-red-500/15">{error}</div> : null;
}

function GlobalMeasurement({ mode }: { mode: "ping" | "mtr" | "censorship" }) {
  const [target, setTarget] = useState(mode === "censorship" ? "example.com" : "8.8.8.8");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [measurement, setMeasurement] = useState<Json | null>(null);
  const run = async () => {
    setLoading(true); setError(""); setMeasurement(null);
    try {
      const hostname = target.replace(/^https?:\/\//, "").split("/")[0];
      const type = mode === "censorship" ? "http" : mode;
      const options = mode === "ping" ? { packets: 8 } : mode === "mtr"
        ? { port: 80, protocol: "ICMP" }
        : { request: { host: hostname, path: "/", method: "HEAD" }, port: 443, protocol: "HTTPS" };
      const created = await api<{ id: string }>("/api/tools/globalping", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: hostname, type, locations: mode === "censorship" ? CENSORSHIP_LOCATIONS : LOCATIONS, measurementOptions: options }),
      });
      for (let attempt = 0; attempt < 7; attempt += 1) {
        if (attempt) await new Promise((resolve) => window.setTimeout(resolve, mode === "censorship" ? 2500 : 1200));
        const latest = await api<Json>(`/api/tools/globalping?id=${encodeURIComponent(created.id)}`);
        setMeasurement(latest);
        if (latest.status !== "in-progress") break;
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "全球测量失败"); }
    finally { setLoading(false); }
  };
  const results = Array.isArray(measurement?.results) ? measurement.results as Json[] : [];
  return <>
    <ToolForm value={target} onChange={setTarget} onRun={run} loading={loading} placeholder={mode === "censorship" ? "输入需要检测的域名" : "输入 IP 或域名"}>
      <p className="text-sm text-muted-foreground">{mode === "ping" ? "从全球 16 个地区测量延迟与丢包。" : mode === "mtr" ? "从全球探针分析路由路径和链路质量。" : "从高风险与对照地区检查网站 HTTPS 可达性。"}</p>
    </ToolForm>
    <Message error={error} />
    {measurement && <div className="mb-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">测量状态</span><Chip variant="soft" color={measurement.status === "finished" ? "success" : "warning"}>{String(measurement.status)}</Chip></div>}
    <div className="grid gap-4 md:grid-cols-2">
      {results.map((entry, index) => {
        const probe = entry.probe as Json || {}; const result = entry.result as Json || {}; const stats = result.stats as Json || {};
        return <Card key={`${String(probe.country)}-${index}`}><CardContent>
          <div className="mb-4 flex items-center justify-between"><div><p className="font-medium">{String(probe.city || probe.country || "Global probe")}</p><p className="text-xs text-muted-foreground">{String(probe.network || "")} {probe.asn ? `· AS${String(probe.asn)}` : ""}</p></div><Chip size="sm" variant="soft" color={result.status === "finished" ? "success" : result.status === "failed" ? "danger" : "warning"}>{String(result.status)}</Chip></div>
          {mode === "ping" && <div className="grid grid-cols-3 gap-3 text-center"><Metric label="平均" value={`${String(stats.avg ?? "—")} ms`} /><Metric label="最低" value={`${String(stats.min ?? "—")} ms`} /><Metric label="丢包" value={`${String(stats.loss ?? "—")}%`} /></div>}
          {mode === "mtr" && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-3 font-mono text-xs leading-5">{String(result.rawOutput || "暂无路由输出")}</pre>}
          {mode === "censorship" && <p className="text-sm text-muted-foreground">{result.status === "finished" ? "目标在该地区可访问" : "该地区访问失败或仍在检测"}</p>}
        </CardContent></Card>;
      })}
    </div>
    {!loading && measurement && !results.length && <Empty text="测量完成，但没有探针返回有效结果。" />}
  </>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/40 p-3"><p className="font-mono text-sm font-semibold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></div>;
}

function DnsTool() {
  const [hostname, setHostname] = useState("example.com"); const [type, setType] = useState("A");
  const [data, setData] = useState<Array<{ provider: string; status: number; answers: Array<Json>; error?: string }>>([]);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async () => { setLoading(true); setError(""); try { setData(await api(`/api/tools/dns?hostname=${encodeURIComponent(hostname)}&type=${type}`)); } catch (cause) { setError(cause instanceof Error ? cause.message : "DNS 查询失败"); } finally { setLoading(false); } };
  return <><ToolForm value={hostname} onChange={setHostname} onRun={run} loading={loading} placeholder="example.com">
    <div className="flex flex-wrap gap-2">{["A", "AAAA", "CNAME", "MX", "NS", "TXT"].map((item) => <button key={item} onClick={() => setType(item)} className={`rounded-lg px-3 py-1.5 font-mono text-xs ${type === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{item}</button>)}</div>
  </ToolForm><Message error={error} /><div className="grid gap-4 md:grid-cols-2">{data.map((provider) => <Card key={provider.provider}><CardHeader><CardTitle>{provider.provider}</CardTitle><CardDescription>DNS-over-HTTPS · {type}</CardDescription></CardHeader><CardContent className="space-y-2">{provider.answers.length ? provider.answers.map((answer, index) => <div key={index} className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-xs">{String(answer.data)} <span className="text-muted-foreground">TTL {String(answer.TTL)}</span></div>) : <p className="text-sm text-muted-foreground">{provider.error || "无记录"}</p>}</CardContent></Card>)}</div></>;
}

function RegistryTool({ mode }: { mode: "rdap" | "whois" }) {
  const [query, setQuery] = useState("example.com"); const [data, setData] = useState<Json | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async () => { setLoading(true); setError(""); try { setData(await api(`/api/tools/${mode}?query=${encodeURIComponent(query)}`)); } catch (cause) { setError(cause instanceof Error ? cause.message : "查询失败"); } finally { setLoading(false); } };
  const rdap = data?.data as Json | undefined;
  const events = Array.isArray(rdap?.events) ? rdap.events as Json[] : [];
  return <><ToolForm value={query} onChange={setQuery} onRun={run} loading={loading} placeholder="域名、IP 或 AS13335" action="查询注册信息" /><Message error={error} />{data && <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]"><Card><CardHeader><CardTitle>{String(rdap?.name || rdap?.handle || data.query)}</CardTitle><CardDescription>{String(data.type).toUpperCase()} · RDAP Registry</CardDescription></CardHeader><CardContent className="space-y-3"><Info label="状态" value={Array.isArray(rdap?.status) ? rdap.status.join(", ") : rdap?.status} /><Info label="起始地址" value={rdap?.startAddress} /><Info label="结束地址" value={rdap?.endAddress} /><Info label="端口 43" value={rdap?.port43} />{events.map((event, index) => <Info key={index} label={String(event.eventAction || "事件")} value={event.eventDate} />)}</CardContent></Card><Card><CardHeader><CardTitle>原始注册数据</CardTitle></CardHeader><CardContent><pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 font-mono text-xs leading-5">{JSON.stringify(rdap, null, 2)}</pre></CardContent></Card></div>}</>;
}

function MacTool() {
  const [mac, setMac] = useState("00:1A:2B:3C:4D:5E"); const [data, setData] = useState<Json | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async () => { setLoading(true); setError(""); try { setData(await api(`/api/tools/mac?mac=${encodeURIComponent(mac)}`)); } catch (cause) { setError(cause instanceof Error ? cause.message : "MAC 查询失败"); } finally { setLoading(false); } };
  return <><ToolForm value={mac} onChange={setMac} onRun={run} loading={loading} placeholder="AA:BB:CC:DD:EE:FF" action="查询厂商" /><Message error={error} />{data && <Card><CardHeader><CardTitle>{String(data.company || "未知厂商")}</CardTitle><CardDescription>{String(data.normalized || mac)}</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Info label="国家" value={data.country} /><Info label="注册地址" value={data.address} /><Info label="地址块" value={data.blockType} /><Info label="更新时间" value={data.updated} /><Info label="分配类型" value={data.isLocal ? "本地管理地址" : "全球唯一地址"} /><Info label="传输类型" value={data.isMulticast ? "组播" : "单播"} /></CardContent></Card>}</>;
}

function BrowserTool() {
  const [info, setInfo] = useState<Json>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const screenInfo = window.screen;
      setInfo({
        userAgent: navigator.userAgent, language: navigator.language, languages: navigator.languages.join(", "),
        platform: navigator.platform, cookies: navigator.cookieEnabled, online: navigator.onLine,
        cpuCores: navigator.hardwareConcurrency, memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
        screen: `${screenInfo.width} × ${screenInfo.height} @ ${window.devicePixelRatio}x`,
        viewport: `${window.innerWidth} × ${window.innerHeight}`, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        colorDepth: screenInfo.colorDepth, touchPoints: navigator.maxTouchPoints,
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <div className="grid gap-4 md:grid-cols-2">{Object.entries(info).map(([key, value]) => <Card key={key}><CardContent><p className="text-xs uppercase tracking-wider text-muted-foreground">{key}</p><p className="mt-2 break-words font-mono text-sm">{String(value ?? "N/A")}</p></CardContent></Card>)}</div>;
}

function RuleTool() {
  type RuleResult = { host: string; ip?: string; country?: string; colo?: string; error?: string };
  const [loading, setLoading] = useState(false); const [results, setResults] = useState<RuleResult[]>([]);
  const run = async () => { setLoading(true); setResults([]); const output: RuleResult[] = []; for (let i = 1; i <= 8; i += 1) { const host = `ptest-${i}.ipcheck.ing`; try { output.push(await api<RuleResult>(`/api/tools/trace?host=${host}`)); } catch (cause) { output.push({ host, error: cause instanceof Error ? cause.message : "失败" }); } setResults([...output]); } setLoading(false); };
  return <><Card className="mb-6"><CardContent className="flex items-center justify-between gap-4"><div><p className="font-medium">代理规则矩阵</p><p className="mt-1 text-sm text-muted-foreground">依次连接 8 条测试线路，比较出口 IP 与地区。</p></div><Button variant="primary" onPress={run} isDisabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}检测全部</Button></CardContent></Card><div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 8 }, (_, index) => results[index] || { host: `ptest-${index + 1}.ipcheck.ing` }).map((item) => <Card key={item.host}><CardContent><div className="flex items-center justify-between"><p className="font-mono text-sm">{item.host}</p><Chip size="sm" variant="soft" color={item.ip ? "success" : item.error ? "danger" : "default"}>{item.ip ? "在线" : item.error ? "失败" : "等待"}</Chip></div><p className="mt-4 font-mono text-lg">{item.ip || "—"}</p><p className="mt-1 text-xs text-muted-foreground">{[item.country, item.colo].filter(Boolean).join(" · ") || item.error || "尚未检测"}</p></CardContent></Card>)}</div></>;
}

const CHECKS = ["公网 IP 与代理状态已确认", "DNS 未发现泄漏", "WebRTC 未暴露额外地址", "浏览器与系统已更新", "重要账户启用多因素认证", "未在公共网络传输敏感数据", "代理规则与出口地区符合预期", "AI 风险建议已阅读"];
function SecurityTool() {
  const [done, setDone] = useState<boolean[]>(() => Array(CHECKS.length).fill(false));
  const toggle = (index: number) => setDone((current) => current.map((value, i) => i === index ? !value : value));
  const count = done.filter(Boolean).length;
  return <div className="grid gap-6 lg:grid-cols-[1fr_300px]"><Card><CardHeader><CardTitle>网络安全检查清单</CardTitle><CardDescription>按当前网络环境逐项核对。</CardDescription></CardHeader><CardContent className="space-y-3">{CHECKS.map((item, index) => <button key={item} onClick={() => toggle(index)} className="flex w-full items-center gap-3 rounded-xl bg-muted/35 p-4 text-left transition hover:bg-muted/60"><span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${done[index] ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>{done[index] && <CheckCircle2 className="size-4" />}</span><span className={done[index] ? "text-muted-foreground line-through" : ""}>{item}</span></button>)}</CardContent></Card><Card><CardHeader><CardTitle>完成度</CardTitle></CardHeader><CardContent><p className="font-mono text-4xl font-semibold">{count}/{CHECKS.length}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${count / CHECKS.length * 100}%` }} /></div><p className="mt-4 text-sm text-muted-foreground">{count === CHECKS.length ? "本次检查已全部完成。" : `还有 ${CHECKS.length - count} 项需要确认。`}</p></CardContent></Card></div>;
}

function InvisibilityTool() {
  const [id, setId] = useState(""); const [data, setData] = useState<Json | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async () => { setLoading(true); setError(""); try { setData(await api(`/api/tools/invisibility?id=${encodeURIComponent(id)}`)); } catch (cause) { setError(cause instanceof Error ? cause.message : "隐身检测失败"); } finally { setLoading(false); } };
  return <><ToolForm value={id} onChange={setId} onRun={run} loading={loading} placeholder="输入 28 位 Elinks 用户 ID" action="获取隐身检测报告" /><Message error={error} />{data && <Card><CardHeader><CardTitle>隐身检测结果</CardTitle></CardHeader><CardContent><pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 font-mono text-xs">{JSON.stringify(data, null, 2)}</pre></CardContent></Card>}</>;
}

export function ServiceStatusPanel() {
  const [status, setStatus] = useState<Json | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  useEffect(() => { const started = performance.now(); api<Json>("/api/tools/status").then((data) => { setLatency(Math.round(performance.now() - started)); setStatus(data); }).catch(() => setStatus({ core: false })); }, []);
  const labels: Record<string, string> = { core: "Elinks Core API", ai: "Groq AI", ipapiis: "IPAPI.is", ipinfo: "IPinfo", ip2location: "IP2Location", mac: "MAC Lookup", invisibility: "隐身检测" };
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(labels).map(([key, label]) => <Card key={key}><CardContent className="flex items-center justify-between"><div><p className="text-sm font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{key === "core" && latency !== null ? `${latency} ms` : "服务配置状态"}</p></div>{status ? <Chip size="sm" variant="soft" color={status[key] ? "success" : "warning"}>{status[key] ? "在线" : "未配置"}</Chip> : <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}</CardContent></Card>)}</div>;
}

function Info({ label, value }: { label: string; value: unknown }) {
  return <div className="flex items-start justify-between gap-4 border-b border-white/[.06] pb-3 text-sm last:border-0"><span className="shrink-0 text-muted-foreground">{label}</span><span className="break-all text-right font-mono">{value === undefined || value === null || value === "" ? "—" : String(value)}</span></div>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-xl bg-muted/30 p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
