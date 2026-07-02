# ElinksNet 8

ElinksNet 是基于 Next.js、React、Tailwind CSS、HeroUI 与 shadcn/ui 构建的多语言 IP 情报与网络诊断平台。

在线服务：[net.elinks.dev](https://net.elinks.dev)

语言：[English](README.md) · [简体中文](README_ZH.md) · [Français](README_FR.md) · [Türkçe](README_TR.md)

## 核心能力

- 聚合最多 26 个免 Key IP 数据源，并支持可选的认证增强来源。
- 提供 IP 质量评分、住宅/移动/数据中心类型、ASN、网络组织、位置、代理、VPN、Tor 和托管风险信号。
- 展示字段级来源贡献、数据一致率和所有来源的实时服务状态。
- 内置 IPv4/IPv6、WebRTC 暴露、深度 DNS 泄漏、测速、全球延迟、MTR、DNS、RDAP、WHOIS、MAC 与网站可达性检测。
- 前端和地名支持英文、简体中文、日文、泰文的本地化显示。
- 可生成包含时间、IP 信息和 SHA-256 报告校验指纹的分享图。
- ElinksAI 支持快速、专业与深度分析三种模式。
- 支持 PWA、手机端适配、Docker 和 Vercel 部署。

## Docker 部署

```bash
docker run -d \
  --name elinksnet \
  --restart unless-stopped \
  -p 18966:18966 \
  elinksteam/elinksnet:8.0.0
```

GitHub Container Registry：

```bash
docker run -d \
  --name elinksnet \
  --restart unless-stopped \
  -p 18966:18966 \
  ghcr.io/elinksteam/elinksnet:8.0.0
```

Docker Compose：

```bash
git clone https://github.com/ElinksTeam/ElinksNet.git
cd ElinksNet
docker compose up -d --build
```

## Node.js 部署

推荐使用 Node.js 24。

```bash
npm ci
npm run build
npm start -- -p 18966
```

## 环境变量

核心 IP 与网络工具无需 API Key。以下变量用于启用增强数据源和 ElinksAI。

| 变量 | 是否必须 | 说明 |
| --- | --- | --- |
| `GROQ_API_KEY` | 可选 | ElinksAI 服务端凭据，禁止暴露到浏览器。 |
| `ELINKS_AI_MODEL` | 可选 | 专业模式模型覆盖。 |
| `ELINKS_AI_FAST_MODEL` | 可选 | 快速模式模型覆盖。 |
| `ELINKS_AI_DEEP_MODEL` | 可选 | 深度分析模式模型覆盖。 |
| `IPINFO_API_TOKEN` | 可选 | IPinfo 认证来源。 |
| `IPAPIIS_API_KEY` | 可选 | IPAPI.is 增强来源。 |
| `IP2LOCATION_API_KEY` | 可选 | IP2Location 增强来源。 |
| `MAC_LOOKUP_API_KEY` | 可选 | 提高 MAC 查询配额。 |
| `ELINKSNET_API_ENDPOINT` | 可选 | 私有隐私检测服务地址。 |
| `ELINKSNET_API_KEY` | 可选 | 私有服务凭据。 |

## 免 Key API

同域接口启用频率限制：

```bash
curl https://net.elinks.dev/api/cli/ip
curl "https://net.elinks.dev/api/cli/ip?format=json"
curl https://net.elinks.dev/api/cli/geo
curl "https://net.elinks.dev/api/cli/geo?ip=8.8.8.8"
```

## 项目沿革与许可证

ElinksNet 8 已经是经过大规模重写的 Next.js 产品，界面、应用架构、多源融合、诊断系统、本地化和 AI 工作流均为独立实现。

但仓库仍保留源自 Jason Ng 的 MyIP 项目的代码与历史，因此在代码和法律意义上仍属于 MIT License 下的衍生作品。`LICENSE` 中的原作者版权声明必须继续保留；Elinks 新增与修改部分 Copyright (c) 2026 Elinks。
