"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { Github, LayoutDashboard, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  const nav = (
    <>
      <Link href="/" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", pathname === "/" ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
        <LayoutDashboard className="size-4" /> 总览
      </Link>
      <div className="mb-2 mt-6 px-3 text-[11px] font-medium uppercase tracking-[.18em] text-muted-foreground">Network tools</div>
      {tools.map((tool) => (
        <Link key={tool.slug} href={`/tools/${tool.slug}`} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", pathname === `/tools/${tool.slug}` ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <tool.icon className="size-4" /> {tool.name}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-white/[.06] bg-background/85 p-4 backdrop-blur-xl lg:block">
        <Brand />
        <nav className="mt-8">{nav}</nav>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="h-full w-[286px] overflow-y-auto bg-background p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><Brand /><button aria-label="关闭菜单" onClick={() => setMobileOpen(false)}><X /></button></div>
            <nav className="mt-8">{nav}</nav>
          </aside>
        </div>
      )}
      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-white/[.06] bg-background/75 px-4 backdrop-blur-xl sm:px-6">
          <button className="mr-3 rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="打开菜单" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Elinks Network Intelligence</p>
            <p className="text-xs text-muted-foreground">Global edge · Operational</p>
          </div>
          <div className="flex items-center gap-2">
            <Button isIconOnly variant="tertiary" aria-label="切换主题" onPress={toggleTheme}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button isIconOnly variant="tertiary" aria-label="GitHub" onPress={() => window.open("https://github.com", "_blank")}><Github className="size-4" /></Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2">
      <Image src="/logos/elinksnet-logo.svg" alt="ElinksNet" width={34} height={34} priority />
      <span className="text-lg font-semibold tracking-tight">Elinks<span className="text-muted-foreground">Net</span></span>
    </Link>
  );
}
