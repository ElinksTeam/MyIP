"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export function LocalizedBackLink() {
  const { t } = useLocale();
  return <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-4" />{t("common.back")}</Link>;
}
