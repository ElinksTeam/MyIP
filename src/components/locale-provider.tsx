"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Locale, localeNames, messages } from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("zh");
  const apply = (next: Locale) => {
    updateLocale(next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : next;
    localStorage.setItem("elinks-locale", next);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("elinks-locale") as Locale | null;
      const browser = navigator.language.toLowerCase();
      const detected: Locale = browser.startsWith("ja") ? "ja" : browser.startsWith("th") ? "th" : browser.startsWith("en") ? "en" : "zh";
      apply(saved && saved in localeNames ? saved : detected);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const t = (key: string, values: Record<string, string | number> = {}) => {
    let text = messages[locale][key] || messages.zh[key] || key;
    for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  };
  return <LocaleContext.Provider value={{ locale, setLocale: apply, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
