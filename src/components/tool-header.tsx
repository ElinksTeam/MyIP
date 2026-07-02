"use client";

import { tools } from "@/lib/tools";
import { useLocale } from "@/components/locale-provider";

export function ToolHeader({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) return null;
  const Icon = tool.icon;
  return <header className="mb-8 flex items-start gap-4">
    <div className="rounded-2xl bg-primary/12 p-3 text-primary"><Icon className="size-6" /></div>
    <div><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Elinks network tool</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{tool.names[locale]}</h1><p className="mt-2 text-sm text-muted-foreground">{tool.descriptions[locale]}</p></div>
  </header>;
}
