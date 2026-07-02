"use client";

import { Button, Chip } from "@heroui/react";
import { BarChart3, CheckCircle2, ImageDown, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

type Source = {
  source?: string;
  category?: string;
  fields?: string[];
  city?: string | null;
  region?: string | null;
  country?: string | null;
  asn?: string | null;
  organization?: string | null;
  proxy?: boolean;
  hosting?: boolean;
};
type Report = {
  data: { ip: string; city?: string | null; region?: string | null; country?: string | null; organization?: string | null; confidence?: number };
  sources: Source[];
  meta: { providers: number; attempted?: number; failed?: number; agreement?: number; categories?: Record<string, number> };
};

const categoryKeys: Record<string, string> = {
  geolocation: "sources.geolocation",
  network: "sources.network",
  security: "sources.security",
  registry: "sources.registry",
};

export function SourceTransparency({ report }: { report: Report }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function createShareImage() {
    setSharing(true);
    try {
      const generatedAt = new Date();
      const visibleReport = {
        generatedAt: generatedAt.toISOString(),
        ip: report.data.ip,
        location: [report.data.city, report.data.region, report.data.country].filter(Boolean).join(" · "),
        providers: report.meta.providers,
        confidence: report.data.confidence || 0,
      };
      const canonical = JSON.stringify(visibleReport);
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      const fingerprint = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      const reference = `ELX-${fingerprint.toUpperCase()}`;
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 630;
      const context = canvas.getContext("2d");
      if (!context) return;
      const gradient = context.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, "#04131f"); gradient.addColorStop(0.55, "#071b2b"); gradient.addColorStop(1, "#063144");
      context.fillStyle = gradient; context.fillRect(0, 0, 1200, 630);
      context.strokeStyle = "rgba(34,211,238,.13)"; context.lineWidth = 1;
      for (let x = 40; x < 1200; x += 80) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 630); context.stroke(); }
      for (let y = 40; y < 630; y += 80) { context.beginPath(); context.moveTo(0, y); context.lineTo(1200, y); context.stroke(); }
      context.fillStyle = "#22d3ee"; context.font = "600 25px Arial"; context.fillText("ELINKS NETWORK INTELLIGENCE", 72, 78);
      context.fillStyle = "#f8fafc"; context.font = "700 54px Arial"; context.fillText(t("share.title"), 72, 155);
      context.fillStyle = "#94a3b8"; context.font = "24px Arial"; context.fillText(t("share.generated"), 72, 205);
      context.fillStyle = "#f8fafc"; context.font = "600 42px monospace";
      const ip = report.data.ip.length > 32 ? `${report.data.ip.slice(0, 30)}…` : report.data.ip;
      context.fillText(ip, 72, 285);
      context.fillStyle = "#cbd5e1"; context.font = "26px Arial";
      context.fillText([report.data.city, report.data.region, report.data.country].filter(Boolean).join(" · ") || "—", 72, 338);
      context.fillStyle = "#94a3b8"; context.font = "22px Arial";
      context.fillText(`${report.meta.providers} ${t("share.sources")}  ·  ${report.data.confidence || 0}% ${t("share.confidence")}`, 72, 390);
      context.fillStyle = "rgba(34,211,238,.12)"; context.fillRect(72, 438, 1056, 112);
      context.fillStyle = "#67e8f9"; context.font = "600 18px monospace"; context.fillText(t("share.fingerprint"), 96, 475);
      context.fillStyle = "#f8fafc"; context.font = "700 16px monospace"; context.fillText(reference, 96, 515);
      context.fillStyle = "#64748b"; context.font = "18px Arial";
      context.fillText(`${visibleReport.generatedAt}  ·  net.elinks.dev`, 72, 595);
      const link = document.createElement("a");
      link.download = `elinks-ip-report-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setSharing(false);
    }
  }

  return <>
    <div className="flex flex-wrap justify-end gap-2">
      <Button size="sm" variant="tertiary" onPress={() => setOpen(true)}><BarChart3 className="size-4" />{t("sources.compare")}</Button>
      <Button size="sm" variant="tertiary" onPress={createShareImage} isDisabled={sharing}><ImageDown className="size-4" />{t("share.image")}</Button>
    </div>
    {open && createPortal(<div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setOpen(false)}>
      <Card className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <CardHeader className="shrink-0 flex-row items-start justify-between border-b border-white/[.06]"><div><CardTitle>{t("sources.title")}</CardTitle><CardDescription>{t("sources.description")}</CardDescription></div><button className="rounded-lg p-2 text-muted-foreground hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close"><X className="size-5" /></button></CardHeader>
        <CardContent className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain">
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Summary value={report.meta.providers} label={t("sources.responded")} />
            <Summary value={report.meta.attempted || report.meta.providers} label={t("sources.attempted")} />
            <Summary value={`${report.meta.agreement || 0}%`} label={t("sources.agreement")} />
            <Summary value={report.meta.failed || 0} label={t("sources.failed")} />
          </div>
          <div className="space-y-2">{report.sources.map((source) => <div key={source.source} className="grid gap-3 rounded-xl bg-muted/35 p-4 sm:grid-cols-[minmax(150px,.75fr)_120px_1.5fr] sm:items-center">
            <div><p className="text-sm font-medium">{source.source}</p><p className="mt-1 text-xs text-muted-foreground">{[source.city, source.region, source.country].filter(Boolean).join(" · ") || source.organization || "—"}</p></div>
            <Chip size="sm" variant="soft">{t(categoryKeys[source.category || "network"] || "sources.network")}</Chip>
            <div className="flex flex-wrap gap-1.5">{(source.fields || []).slice(0, 8).map((field) => <span key={field} className="rounded-md bg-background/55 px-2 py-1 font-mono text-[10px] text-muted-foreground">{field}</span>)}</div>
          </div>)}</div>
          <div className="mt-5 flex gap-3 rounded-xl bg-emerald-500/8 p-4 text-sm text-emerald-300"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p>{t("sources.transparency")}</p></div>
        </CardContent>
      </Card>
    </div>, document.body)}
  </>;
}

function Summary({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-xl bg-muted/35 p-3"><div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" /><p className="font-mono text-xl font-semibold">{value}</p></div><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
