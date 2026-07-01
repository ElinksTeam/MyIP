import { Activity, BookOpen, Braces, Container, Database, EyeOff, Fingerprint, Globe2, Network, Radar, Route, Search, ShieldCheck } from "lucide-react";

export const tools = [
  { slug: "ping", name: "全球延迟", description: "从全球节点测量网络往返时延", icon: Activity },
  { slug: "mtr", name: "MTR 路由", description: "定位跨境链路的丢包与绕行", icon: Route },
  { slug: "dns", name: "DNS 解析", description: "查询 A、AAAA、MX 与 TXT 记录", icon: Network },
  { slug: "rdap", name: "RDAP 查询", description: "检索 IP 与域名注册信息", icon: Database },
  { slug: "whois", name: "WHOIS", description: "查看网络资源注册资料", icon: Search },
  { slug: "censorship", name: "可达性检测", description: "对比多地区网站访问状态", icon: Radar },
  { slug: "browser", name: "浏览器指纹", description: "检查浏览器暴露的环境信息", icon: Fingerprint },
  { slug: "rules", name: "代理规则", description: "验证代理分流规则是否生效", icon: Braces },
  { slug: "security", name: "安全清单", description: "逐项完成网络安全检查", icon: ShieldCheck },
  { slug: "invisibility", name: "隐身检测", description: "读取 Elinks 隐私与设备暴露报告", icon: EyeOff },
  { slug: "cli", name: "CLI 文档", description: "在命令行调用 ElinksNet API", icon: BookOpen },
  { slug: "docker", name: "Docker 部署", description: "通过容器私有化部署服务", icon: Container },
  { slug: "status", name: "服务状态", description: "查看数据源和平台可用性", icon: Globe2 },
] as const;
