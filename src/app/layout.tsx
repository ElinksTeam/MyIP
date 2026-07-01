import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://net.elinks.dev"),
  title: { default: "ElinksNet · 网络智能工作台", template: "%s · ElinksNet" },
  description: "面向跨境网络运维的 IP 情报、安全诊断与连接质量平台。",
  icons: { icon: "/favicon.svg", apple: "/logos/elinks-apple-touch.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#111827", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`dark ${geist.variable} ${mono.variable}`} data-theme="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
