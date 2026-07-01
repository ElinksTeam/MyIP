import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, Terminal } from "lucide-react";
import Link from "next/link";
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
  const Icon = tool.icon;

  return (
    <div>
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-4" />返回总览</Link>
      <header className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl bg-primary/12 p-3 text-primary"><Icon className="size-6" /></div>
        <div><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Elinks network tool</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{tool.name}</h1><p className="mt-2 text-sm text-muted-foreground">{tool.description}</p></div>
      </header>
      {slug === "cli" ? <CliDocs /> : slug === "status" ? <Status /> : slug === "docker" ? <DockerDocs /> : <ToolWorkspace name={tool.name} />}
    </div>
  );
}

function ToolWorkspace({ name }: { name: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card><CardHeader><CardTitle>{name} 工作区</CardTitle><CardDescription>React 版本的业务适配正在接入新的同域 Route Handler。</CardDescription></CardHeader><CardContent><div className="flex min-h-72 items-center justify-center rounded-xl bg-muted/35 p-8 text-center"><div><Terminal className="mx-auto mb-4 size-8 text-primary" /><p className="font-medium">界面框架已迁移</p><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">该工具会在下一迁移批次连接原有检测逻辑。目前可从首页使用完整的融合 IP 检测和 AI 分析。</p></div></div></CardContent></Card>
      <Card><CardHeader><CardTitle>运行说明</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>请求通过 ElinksNet 同域 API 发出。</p><p>所有接口均启用超时和请求频率限制。</p><p>敏感密钥只保存在服务端环境变量中。</p></CardContent></Card>
    </div>
  );
}

function CliDocs() {
  const command = "curl 'https://net.elinks.dev/api/lookup?ip=8.8.8.8'";
  return <Card><CardHeader><CardTitle>免 Key API</CardTitle><CardDescription>每个客户端每分钟最多 30 次请求，响应为 JSON。</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-black/35 p-4"><code className="overflow-x-auto whitespace-nowrap font-mono text-sm text-emerald-300">{command}</code><Copy className="size-4 shrink-0 text-muted-foreground" /></div><div className="mt-6 grid gap-4 sm:grid-cols-3">{["无需 API Key", "同域安全代理", "多源融合结果"].map((item) => <div key={item} className="rounded-xl bg-muted/40 p-4 text-sm"><CheckCircle2 className="mb-3 size-5 text-emerald-400" />{item}</div>)}</div></CardContent></Card>;
}

function Status() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{["Elinks API", "IPWho.is", "IP-API.com", "IPAPI.is", "IPinfo", "IP2Location"].map((name) => <Card key={name}><CardContent className="flex items-center justify-between"><div><p className="text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">实时数据源</p></div><span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="size-2 rounded-full bg-emerald-400" />在线</span></CardContent></Card>)}</div>;
}

function DockerDocs() {
  return <Card><CardHeader><CardTitle>Docker 一键部署</CardTitle><CardDescription>Next.js 服务可直接构建为 Node.js 容器。</CardDescription></CardHeader><CardContent><pre className="overflow-x-auto rounded-xl bg-black/35 p-4 font-mono text-sm text-emerald-300">docker compose up -d --build</pre><p className="mt-4 text-sm leading-6 text-muted-foreground">在部署环境中配置 GROQ_API_KEY、IPINFO_API_TOKEN、IPAPIIS_API_KEY 和 IP2LOCATION_API_KEY，即可启用全部私有数据源。</p></CardContent></Card>;
}
