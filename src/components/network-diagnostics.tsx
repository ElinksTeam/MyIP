"use client";

import { Button, Chip } from "@heroui/react";
import { Activity, Download, Gauge, LoaderCircle, Network, Radio, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Check = { name: string; note: string; status: "idle" | "running" | "ok" | "fail"; latency?: number };
const initialChecks: Check[] = [
  { name: "Cloudflare Edge", note: "全球边缘网络连接", status: "idle" },
  { name: "Google DNS", note: "DNS-over-HTTPS", status: "idle" },
  { name: "IPv4 出口", note: "IPv4 公网连通性", status: "idle" },
  { name: "IPv6 出口", note: "IPv6 公网连通性", status: "idle" },
];

export function NetworkDiagnostics({ report }: { report?: unknown }) {
  const [checks, setChecks] = useState(initialChecks);
  const [running, setRunning] = useState(false);
  const [webrtc, setWebrtc] = useState<string[]>([]);
  const [dns, setDns] = useState<{ ip?: string; country?: string; org?: string } | null>(null);
  const [speed, setSpeed] = useState<{ latency: number; download: number } | null>(null);

  async function runConnectivity() {
    setRunning(true);
    const endpoints = [
      "https://speed.cloudflare.com/cdn-cgi/trace",
      "https://dns.google/resolve?name=example.com&type=A",
      "https://api.ipify.org?format=json",
      "https://api6.ipify.org?format=json",
    ];
    setChecks(initialChecks.map((item) => ({ ...item, status: "running" })));
    const results = await Promise.all(endpoints.map(async (url, index) => {
      const started = performance.now();
      try {
        const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
        if (!response.ok) throw new Error();
        await response.text();
        return { ...initialChecks[index], status: "ok" as const, latency: Math.round(performance.now() - started) };
      } catch { return { ...initialChecks[index], status: "fail" as const }; }
    }));
    setChecks(results); setRunning(false);
  }

  async function runWebRtc() {
    setWebrtc([]);
    const found = new Set<string>();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] });
    pc.createDataChannel("elinks");
    pc.onicecandidate = (event) => {
      const candidate = event.candidate?.candidate || "";
      const matches = candidate.match(/(?:\d{1,3}\.){3}\d{1,3}|(?:[a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4}/gi) || [];
      matches.forEach((ip) => found.add(ip));
      setWebrtc([...found]);
      if (!event.candidate) pc.close();
    };
    await pc.setLocalDescription(await pc.createOffer());
    window.setTimeout(() => pc.close(), 6_000);
  }

  async function runDnsLeak() {
    setDns(null);
    try {
      const id = crypto.randomUUID().replace(/-/g, "");
      const response = await fetch(`https://${id}.edns.ip-api.com/json`, { signal: AbortSignal.timeout(8_000) });
      const data = await response.json();
      setDns({ ip: data.dns?.ip, country: data.dns?.geo, org: data.dns?.isp || data.dns?.org });
    } catch { setDns({}); }
  }

  async function runSpeed() {
    setSpeed(null);
    try {
      const pingStart = performance.now();
      await fetch("https://speed.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
      const latency = Math.round(performance.now() - pingStart);
      const started = performance.now();
      const response = await fetch(`https://speed.cloudflare.com/__down?bytes=5000000&t=${Date.now()}`, { cache: "no-store" });
      const bytes = (await response.arrayBuffer()).byteLength;
      const seconds = (performance.now() - started) / 1000;
      setSpeed({ latency, download: Math.round((bytes * 8 / seconds / 1_000_000) * 10) / 10 });
    } catch { setSpeed({ latency: 0, download: 0 }); }
  }

  function exportReport() {
    const payload = { generatedAt: new Date().toISOString(), ipIntelligence: report, connectivity: checks, webrtc, dns, speed };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `elinks-network-report-${Date.now()}.json`; link.click(); URL.revokeObjectURL(url);
  }

  return <section className="mt-8">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Live diagnostics</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">连接与隐私检测</h2></div><Button variant="tertiary" onPress={exportReport}><Download className="size-4" />导出检测报告</Button></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Activity className="size-4 text-primary" />连接能力</CardTitle><CardDescription>检查 IPv4、IPv6、DNS 和边缘网络。</CardDescription></div><Button isIconOnly variant="tertiary" aria-label="运行连接检测" onPress={runConnectivity} isDisabled={running}>{running ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}</Button></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{checks.map((check) => <div key={check.name} className="rounded-xl bg-muted/35 p-3"><div className="flex items-center justify-between"><p className="text-sm font-medium">{check.name}</p><Chip size="sm" variant="soft" color={check.status === "ok" ? "success" : check.status === "fail" ? "danger" : "default"}>{check.status === "ok" ? `${check.latency} ms` : check.status === "fail" ? "失败" : check.status === "running" ? "检测中" : "待检测"}</Chip></div><p className="mt-1 text-xs text-muted-foreground">{check.note}</p></div>)}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Radio className="size-4 text-primary" />WebRTC 暴露</CardTitle><CardDescription>检查浏览器实时通信候选地址。</CardDescription></div><Button variant="tertiary" onPress={runWebRtc}>检测</Button></CardHeader><CardContent>{webrtc.length ? <div className="space-y-2">{webrtc.map((ip) => <p key={ip} className="rounded-lg bg-muted/40 p-3 font-mono text-sm">{ip}</p>)}</div> : <p className="text-sm text-muted-foreground">尚未检测或未发现额外地址。</p>}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Network className="size-4 text-primary" />DNS 泄漏</CardTitle><CardDescription>识别浏览器实际使用的递归 DNS。</CardDescription></div><Button variant="tertiary" onPress={runDnsLeak}>检测</Button></CardHeader><CardContent>{dns ? dns.ip ? <div className="grid gap-2 sm:grid-cols-2"><Diag label="DNS 地址" value={dns.ip} /><Diag label="地区" value={dns.country || "未知"} /><Diag label="运营商" value={dns.org || "未知"} /></div> : <p className="text-sm text-amber-400">DNS 端点未返回可识别结果。</p> : <p className="text-sm text-muted-foreground">点击检测以分析 DNS 出口。</p>}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Gauge className="size-4 text-primary" />快速测速</CardTitle><CardDescription>使用 Cloudflare 5 MB 样本估算下载速度。</CardDescription></div><Button variant="tertiary" onPress={runSpeed}>开始</Button></CardHeader><CardContent>{speed ? <div className="grid grid-cols-2 gap-3"><Metric label="下载" value={speed.download ? `${speed.download} Mbps` : "失败"} /><Metric label="延迟" value={speed.latency ? `${speed.latency} ms` : "失败"} /></div> : <p className="text-sm text-muted-foreground">测速会产生约 5 MB 流量。</p>}</CardContent></Card>
    </div>
  </section>;
}

function Diag({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/35 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-all font-mono text-sm">{value}</p></div>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/40 p-4 text-center"><p className="font-mono text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
