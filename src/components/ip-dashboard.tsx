"use client";

import { Button, Chip } from "@heroui/react";
import { Bot, CheckCircle2, Copy, Globe2, LocateFixed, RefreshCw, Search, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkDiagnostics } from "@/components/network-diagnostics";
import { useLocale } from "@/components/locale-provider";
import { LocationGlobe } from "@/components/location-globe";

type IpData = {
  ip: string; city: string | null; region: string | null; district: string | null; country: string | null;
  countryCode: string | null; postalCode: string | null; timezone: string | null; latitude: number | null;
  longitude: number | null; asn: string | null; organization: string | null; isp: string | null;
  proxy: boolean; hosting: boolean; vpn: boolean; tor: boolean; confidence: number;
};
type Lookup = { data: IpData; sources: Array<Record<string, unknown>>; meta: { providers: number } };

export function IpDashboard() {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [question, setQuestion] = useState("请分析这个 IP 的代理风险、网络质量与安全注意事项");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [deviceIps, setDeviceIps] = useState<{ ipv4: string | null; ipv6: string | null; checking: boolean }>({ ipv4: null, ipv6: null, checking: true });
  const portalReady = useSyncExternalStore(() => () => undefined, () => true, () => false);

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
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => void lookup(), 0);
    Promise.all([
      fetch("https://api.ipify.org?format=json", { cache: "no-store", signal: controller.signal }).then((response) => response.json()).then((payload) => String(payload.ip || "")).catch(() => ""),
      fetch("https://api6.ipify.org?format=json", { cache: "no-store", signal: controller.signal }).then((response) => response.json()).then((payload) => String(payload.ip || "")).catch(() => ""),
    ]).then(([ipv4, ipv6]) => {
      if (active) setDeviceIps({
        ipv4: ipv4.includes(".") ? ipv4 : null,
        ipv6: ipv6.includes(":") ? ipv6 : null,
        checking: false,
      });
    });
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
    // Initial visitor-IP discovery only; later lookups are user initiated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function askAi() {
    if (!result) return;
    setAiLoading(true); setAnswer("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, diagnostics: result, language: locale }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setAnswer(payload.answer);
    } catch (cause) { setAnswer(cause instanceof Error ? cause.message : "AI 分析失败"); }
    finally { setAiLoading(false); }
  }

  const data = result?.data;
  const fields = data ? [
    [t("dashboard.country"), [data.country, data.countryCode].filter(Boolean).join(" · ")],
    [t("dashboard.city"), [data.region, data.city, data.district].filter(Boolean).join(" · ")],
    [t("dashboard.postal"), data.postalCode], [t("dashboard.timezone"), data.timezone],
    [t("dashboard.org"), data.organization || data.isp], ["ASN", data.asn],
    [t("dashboard.coordinates"), data.latitude !== null ? `${data.latitude}, ${data.longitude}` : null],
  ] : [];

  return (
    <>
      <section className="section-reveal mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 font-mono text-xs uppercase tracking-[.2em] text-primary">{t("dashboard.eyebrow")}</p><h1 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{t("dashboard.title")}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{t("dashboard.description")}</p></div>
        <Chip color="success" variant="soft"><span className="flex items-center gap-1.5"><CheckCircle2 className="status-pulse size-3.5" /> {t("dashboard.serviceOnline")}</span></Chip>
      </section>

      <Card className="section-reveal mb-6 [--reveal-delay:70ms]">
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><Input className="pl-10 font-mono" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void lookup(query)} placeholder={t("dashboard.placeholder")} /></div>
          <Button variant="primary" onPress={() => void lookup(query)} isDisabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />{t("dashboard.detect")}</Button>
        </CardContent>
      </Card>

      {error && <Card className="mb-6 bg-red-500/5"><CardContent className="flex items-center gap-3 text-sm text-red-400"><ShieldAlert className="size-5" />{error}</CardContent></Card>}

      <div className="section-reveal grid gap-6 [--reveal-delay:140ms] xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>{t("dashboard.fused")}</CardTitle><CardDescription>{loading ? t("dashboard.loading") : t("dashboard.sources", { count: result?.meta.providers || 0 })}</CardDescription></div>
            {data && <Chip variant="soft" color={data.proxy || data.vpn || data.tor ? "danger" : "success"}>{data.proxy || data.vpn || data.tor ? t("dashboard.proxy") : t("dashboard.noProxy")}</Chip>}
          </CardHeader>
          <CardContent>
            {loading ? <LoadingState /> : data && (
              <>
                <div className="mb-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Globe2 className="size-4" /> {t("dashboard.current")}</div>
                    <div className="flex items-center gap-2"><p className={`metric-value min-w-0 whitespace-nowrap font-mono font-semibold tracking-[-.035em] ${data.ip.includes(":") ? "text-[11px] sm:text-[17px] lg:text-lg" : "text-2xl sm:text-3xl"}`}>{data.ip}</p><button aria-label={`${t("common.copy")} IP`} className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => navigator.clipboard.writeText(data.ip)}><Copy className="size-4" /></button></div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <AddressStatus label={t("dashboard.deviceIpv4")} value={deviceIps.checking ? t("common.checking") : deviceIps.ipv4 || t("dashboard.noIpv4")} available={Boolean(deviceIps.ipv4)} checking={deviceIps.checking} />
                      <AddressStatus label={t("dashboard.deviceIpv6")} value={deviceIps.checking ? t("common.checking") : deviceIps.ipv6 || t("dashboard.noIpv6")} available={Boolean(deviceIps.ipv6)} checking={deviceIps.checking} />
                    </div>
                  </div>
                  <div className="flex shrink-0 justify-center">
                    {data.latitude !== null && data.longitude !== null && <LocationGlobe latitude={data.latitude} longitude={data.longitude} label={[data.city, data.country].filter(Boolean).join(", ")} />}
                  </div>
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
            <CardHeader><CardTitle>{t("dashboard.risk")}</CardTitle><CardDescription>{t("dashboard.riskDesc")}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <RiskRow label={t("dashboard.proxyVpn")} active={Boolean(data?.proxy || data?.vpn)} activeText={t("dashboard.attention")} safeText={t("dashboard.notFound")} />
              <RiskRow label={t("dashboard.tor")} active={Boolean(data?.tor)} activeText={t("dashboard.attention")} safeText={t("dashboard.notFound")} />
              <RiskRow label={t("dashboard.hosting")} active={Boolean(data?.hosting)} activeText={t("dashboard.attention")} safeText={t("dashboard.notFound")} />
              <div className="pt-2"><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">{t("dashboard.confidence")}</span><span className="metric-value">{data?.confidence || 0}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="progress-live h-full rounded-full bg-primary" style={{ width: `${data?.confidence || 0}%` }} /></div></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4"><div className="rounded-xl bg-primary/12 p-3 text-primary"><LocateFixed className="size-5" /></div><div><p className="text-sm font-medium">{t("dashboard.privacy")}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{t("dashboard.privacyDesc")}</p></div></CardContent>
          </Card>
        </div>
      </div>
      <NetworkDiagnostics report={result} />

      {portalReady && createPortal(<><div className="fixed bottom-5 right-4 z-[60] sm:bottom-6 sm:right-6">
        <button className="ai-fab group relative grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105" title={t("dashboard.aiHint")} aria-label={t("dashboard.aiHint")} onClick={() => setAiOpen(true)}><Bot className="size-5" /><span className="absolute right-0 top-0 size-3 rounded-full bg-emerald-400 ring-2 ring-background" /><span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-lg bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xl ring-1 ring-border group-hover:block">{t("dashboard.aiHint")}</span></button>
      </div>
      {aiOpen && <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/45 p-3 backdrop-blur-sm sm:p-6" onClick={() => setAiOpen(false)}>
        <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Bot className="size-5 text-primary" />{t("dashboard.aiTitle")}</CardTitle><CardDescription>{t("dashboard.aiDesc")}</CardDescription></div><button aria-label="Close" onClick={() => setAiOpen(false)}><X className="size-5" /></button></CardHeader>
          <CardContent className="space-y-4"><textarea className="min-h-24 w-full resize-none rounded-xl bg-muted/60 p-3 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-primary/60" value={question} onChange={(e) => setQuestion(e.target.value)} />{answer && <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm leading-6">{answer}</div>}<Button className="w-full" variant="primary" onPress={() => void askAi()} isDisabled={aiLoading || !result}>{aiLoading ? t("dashboard.aiRunning") : t("dashboard.aiAction")}</Button></CardContent>
        </Card>
      </div>}</>, document.body)}
    </>
  );
}

function LoadingState() {
  return <div className="loading-scan space-y-5 rounded-xl"><Skeleton className="h-9 w-2/3" /><div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></div>;
}
function RiskRow({ label, active, activeText, safeText }: { label: string; active: boolean; activeText: string; safeText: string }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={`flex items-center gap-1.5 text-xs ${active ? "text-amber-400" : "text-emerald-400"}`}>{active ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}{active ? activeText : safeText}</span></div>;
}
function AddressStatus({ label, value, available, checking }: { label: string; value: string; available: boolean; checking: boolean }) {
  return <div className="min-w-0 rounded-xl bg-muted/35 px-3 py-2.5"><div className="mb-1 flex items-center gap-2"><span className={`size-1.5 rounded-full ${checking ? "animate-pulse bg-amber-400" : available ? "bg-emerald-400" : "bg-muted-foreground/50"}`} /><span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="truncate font-mono text-xs" title={value}>{value}</p></div>;
}
