import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center p-6 text-center"><div><p className="font-mono text-sm text-primary">404</p><h1 className="mt-2 text-3xl font-semibold">页面不存在</h1><Link href="/" className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">返回 ElinksNet 总览</Link></div></main>;
}
