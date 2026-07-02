"use client";

import { Button, Chip } from "@heroui/react";
import { Activity, Download, Gauge, LoaderCircle, Network, Radio, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

type Check = { name: string; note: string; status: "idle" | "running" | "ok" | "fail"; latency?: number };
const initialChecks: Check[] = [
  { name: "diag.edgeName", note: "diag.edgeNote", status: "idle" },
  { name: "diag.googleName", note: "diag.googleNote", status: "idle" },
  { name: "diag.ipv4Name", note: "diag.ipv4Note", status: "idle" },
  { name: "diag.ipv6Name", note: "diag.ipv6Note", status: "idle" },
];

export function NetworkDiagnostics({ report }: { report?: unknown }) {
  const { t } = useLocale();
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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">{t("diag.eyebrow")}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{t("diag.title")}</h2></div><Button variant="tertiary" onPress={exportReport}><Download className="size-4" />{t("diag.export")}</Button></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Activity className="size-4 text-primary" />{t("diag.connectivity")}</CardTitle><CardDescription>{t("diag.connectivityDesc")}</CardDescription></div><Button isIconOnly variant="tertiary" aria-label={t("diag.connectivity")} onPress={runConnectivity} isDisabled={running}>{running ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}</Button></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{checks.map((check) => <div key={check.name} className="rounded-xl bg-muted/35 p-3 transition-colors hover:bg-muted/55"><div className="flex items-center justify-between"><p className="text-sm font-medium">{t(check.name)}</p><Chip className={check.status === "running" ? "status-pulse" : ""} size="sm" variant="soft" color={check.status === "ok" ? "success" : check.status === "fail" ? "danger" : "default"}>{check.status === "ok" ? `${check.latency} ms` : check.status === "fail" ? t("common.failed") : check.status === "running" ? t("common.running") : t("common.waiting")}</Chip></div><p className="mt-1 text-xs text-muted-foreground">{t(check.note)}</p></div>)}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Radio className="size-4 text-primary" />{t("diag.webrtc")}</CardTitle><CardDescription>{t("diag.webrtcDesc")}</CardDescription></div><Button variant="tertiary" onPress={runWebRtc}>{t("diag.detect")}</Button></CardHeader><CardContent>{webrtc.length ? <div className="space-y-2">{webrtc.map((ip) => <p key={ip} className="rounded-lg bg-muted/40 p-3 font-mono text-sm">{ip}</p>)}</div> : <p className="text-sm text-muted-foreground">{t("diag.notRun")}</p>}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Network className="size-4 text-primary" />{t("diag.dnsLeak")}</CardTitle><CardDescription>{t("diag.dnsLeakDesc")}</CardDescription></div><Button variant="tertiary" onPress={runDnsLeak}>{t("diag.detect")}</Button></CardHeader><CardContent>{dns ? dns.ip ? <div className="grid gap-2 sm:grid-cols-2"><Diag label="DNS" value={dns.ip} /><Diag label="Region" value={dns.country || "—"} /><Diag label="ISP" value={dns.org || "—"} /></div> : <p className="text-sm text-amber-400">{t("common.failed")}</p> : <p className="text-sm text-muted-foreground">{t("diag.dnsPrompt")}</p>}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Gauge className="size-4 text-primary" />{t("diag.speed")}</CardTitle><CardDescription>{t("diag.speedDesc")}</CardDescription></div><Button variant="tertiary" onPress={runSpeed}>{t("diag.start")}</Button></CardHeader><CardContent>{speed ? <div className="grid grid-cols-2 gap-3"><Metric label="Download" value={speed.download ? `${speed.download} Mbps` : t("common.failed")} /><Metric label="Latency" value={speed.latency ? `${speed.latency} ms` : t("common.failed")} /></div> : <p className="text-sm text-muted-foreground">{t("diag.speedNote")}</p>}</CardContent></Card>
    </div>
  </section>;
}

function Diag({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/35 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-all font-mono text-sm">{value}</p></div>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/40 p-4 text-center"><p className="font-mono text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
