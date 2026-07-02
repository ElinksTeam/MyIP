import { notFound } from "next/navigation";
import { CheckCircle2, Copy } from "lucide-react";
import { AdvancedToolWorkspace, ServiceStatusPanel } from "@/components/advanced-tool-workspace";
import { ToolHeader } from "@/components/tool-header";
import { LocalizedBackLink } from "@/components/localized-back-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tools } from "@/lib/tools";

export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  return { title: tool?.name || "工具" };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) notFound();
  return (
    <div>
      <LocalizedBackLink />
      <ToolHeader slug={slug} />
      {slug === "cli" ? <CliDocs /> : slug === "status" ? <ServiceStatusPanel /> : slug === "docker" ? <DockerDocs /> : <AdvancedToolWorkspace slug={slug} name={tool.name} />}
    </div>
  );
}

function CliDocs() {
  const commands = [
    ["获取当前公网 IP", "curl https://net.elinks.dev/api/cli/ip"],
    ["JSON 格式公网 IP", "curl 'https://net.elinks.dev/api/cli/ip?format=json'"],
    ["当前地址融合情报", "curl https://net.elinks.dev/api/cli/geo"],
    ["指定 IP 融合情报", "curl 'https://net.elinks.dev/api/cli/geo?ip=8.8.8.8'"],
  ];
  return <Card><CardHeader><CardTitle>免 Key API</CardTitle><CardDescription>同域接口启用频率限制，返回文本或 JSON。</CardDescription></CardHeader><CardContent className="space-y-3">{commands.map(([label, command]) => <div key={command} className="rounded-xl bg-black/35 p-4"><p className="mb-2 text-xs text-muted-foreground">{label}</p><div className="flex items-center justify-between gap-4 overflow-hidden"><code className="overflow-x-auto whitespace-nowrap font-mono text-sm text-emerald-300">{command}</code><Copy className="size-4 shrink-0 text-muted-foreground" /></div></div>)}<div className="mt-6 grid gap-4 sm:grid-cols-3">{["无需 API Key", "同域安全代理", "多源融合结果"].map((item) => <div key={item} className="rounded-xl bg-muted/40 p-4 text-sm"><CheckCircle2 className="mb-3 size-5 text-emerald-400" />{item}</div>)}</div></CardContent></Card>;
}

function DockerDocs() {
  return <Card><CardHeader><CardTitle>Docker 一键部署</CardTitle><CardDescription>Next.js 服务可直接构建为 Node.js 容器。</CardDescription></CardHeader><CardContent><pre className="overflow-x-auto rounded-xl bg-black/35 p-4 font-mono text-sm text-emerald-300">docker compose up -d --build</pre><p className="mt-4 text-sm leading-6 text-muted-foreground">在部署环境中配置 GROQ_API_KEY、IPINFO_API_TOKEN、IPAPIIS_API_KEY 和 IP2LOCATION_API_KEY，即可启用全部私有数据源。</p></CardContent></Card>;
}
