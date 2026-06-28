# 🧰 ElinksNet - IP 与网络工具箱

<div align="center">

<h1>ElinksNet</h1>
<p><strong>IP 与网络工具箱</strong></p>

[![Mentioned in Awesome Self Hosted](https://awesome.re/mentioned-badge.svg)](https://github.com/awesome-selfhosted/awesome-selfhosted)

![GitHub Repo stars](https://img.shields.io/github/stars/ElinksTeam/MyIP)
![GitHub forks](https://img.shields.io/github/forks/ElinksTeam/MyIP)
![PWA](https://img.shields.io/badge/PWA-Supported-blue)

🇺🇸 [English](README.md) | 🇨🇳 [简体中文](README_ZH.md) | 🇫🇷 [Français](README_FR.md) | 🇹🇷 [Türkçe](README_TR.md)

你可以自行部署 ElinksNet 实例。

</div>

## 👀 主要功能

* 🛜 **看自己的 IP**：从多个 IPv4 和 IPv6 来源检测显示本机的 IP
* 🔍 **查任意 IP 信息**：可以通过小工具查询任意 IP 的信息
* 🕵️ **看 IP 信息**：显示所有 IP 的相关信息，包括国家、地区、ASN、地理位置等
* 🚦 **可用性检测**：检测一些网站的可用性：Google, Github, Youtube, 网易, 百度等
* 🚥 **WebRTC 检测**：查看使用 WebRTC 连接时使用的 IP
* 🛑 **DNS 泄露检测**：查看 DNS 出口信息，以便查看在 VPN/代理的情况下，是否存在 DNS 泄露隐私的风险
* 🚀 **网速测试**：利用边缘网络进行网速测试
* 🚏 **代理规则测试**：配合代理软件的规则设置，测试规则设置是否正常
* ⏱️ **全球延迟测试**：从分布在全球的多个服务器进行延迟测试，了解你与全球网络的连接速度
* 📡 **MTR 测试**：从分布在全球的多个服务器进行 MTR 测试，了解你与全球的连接路径
* 🔦 **DNS 解析器**：从多个渠道对域名进行 DNS 解析，获取实时的解析结果，可用于污染判断
* 🚧 **封锁测试**：检查特定的网站在部分国家是否被封锁
* 📓 **Whois 查询**：对域名或 IP 进行 whois 信息查询
* 📀 **MAC 地址查询**：查询物理地址的归属信息
* 🖥️ **浏览器指纹**：多种方式查看浏览器指纹
* 📋 **网络安全检查清单**：一共有 258 项的，全面的网络安全检查清单

## 💪 同时还支持

* 🌗 **暗黑模式**：根据系统设置自动切换暗黑/白天模式，也可以手动切换
* 📱 **简约模式**：为移动版提供的专门模式，缩短页面长度，快速查看最重要的信息
* 📲 **支持 PWA**：可以添加为手机应用以及电脑里的桌面应用，方便使用
* ⌨️ **支持快捷键**：可以随时输入 `?` 查看快捷键菜单
* 🌍 根据可用性检测结果，返回目前是否可以访问全世界网络的提示
* 🇺🇸 🇨🇳 🇫🇷 🇹🇷 支持中文、英文、法文、土耳其文

## 🚀 快速部署

### Docker Hub

```bash
docker run -d \
  --name elinksnet \
  --restart unless-stopped \
  -p 18966:18966 \
  elinksteam/elinksnet:latest
```

### GitHub Container Registry

```bash
docker run -d \
  --name elinksnet \
  --restart unless-stopped \
  -p 18966:18966 \
  ghcr.io/elinksteam/elinksnet:latest
```

### Docker Compose

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
docker compose up -d
```

### 本地构建

如果公开 Docker 镜像还没有发布，可以使用本地构建方式。

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
docker build -t elinksnet .
docker run -d -p 18966:18966 --name elinksnet --restart unless-stopped elinksnet
```

## 📕 Node 手动部署

确保你系统里已经有 Node.js 环境。

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
npm install && npm run build
npm start
```

程序会运行在 18966 端口。

## 📚 环境变量

ElinksNet 不配置 MaxMind 也可以启动，但完整的 IP 地理位置、ASN / 组织归属查询和国家/地区标识推荐配置 MaxMind GeoLite2 数据库。Docker 部署想获得完整体验，建议配置下面三个 MaxMind 变量。

### MaxMind 数据库

ElinksNet 依赖 MaxMind 提供的免费 **GeoLite2** 数据库（City + ASN）来提供完整的 IP 地理位置与 ASN 信息。

由于 MaxMind GeoLite2 协议不允许再分发，`.mmdb` 文件**没有被包含在本仓库里**，你需要自己准备。有两种做法：

**方案 A —— 自动下载（推荐 Docker 部署）**

1. 去 [maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup) 注册一个免费账号。
2. 在账号的 "Manage License Keys" 页面生成一个 License Key。
3. 配置这三个环境变量：
   ```bash
   MAXMIND_ACCOUNT_ID="your-account-id"
   MAXMIND_LICENSE_KEY="your-license-key"
   MAXMIND_AUTO_UPDATE="true"
   ```
4. 启动后端。首次启动后约 60 秒内，程序会自动下载两个数据库，之后每 24 小时自动检查更新。

**方案 B —— 手动放置**

从你的 MaxMind 账号下载 `GeoLite2-City.mmdb` 和 `GeoLite2-ASN.mmdb`，在启动后端前手动放入 `common/maxmind-db/` 目录。

### 环境变量一览

| 变量名 | 是否必须 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `MAXMIND_ACCOUNT_ID` | 推荐 | `""` | MaxMind 账号 ID，和 `MAXMIND_LICENSE_KEY` 一起用于下载 GeoLite2 数据库。 |
| `MAXMIND_LICENSE_KEY` | 推荐 | `""` | MaxMind License Key，和 `MAXMIND_ACCOUNT_ID` 配合使用。 |
| `MAXMIND_AUTO_UPDATE` | 推荐 | `"false"` | 设置为 `"true"` 时，程序会自动下载 GeoLite2 数据库，并每 24 小时刷新一次。 |
| `VITE_GOOGLE_ANALYTICS_ID` | 可选 | `""` | Google Analytics 的 ID，用于统计访问量 |
| `BACKEND_PORT` | 可选 | `"11966"` | 程序后端部分的运行端口 |
| `FRONTEND_PORT` | 可选 | `"18966"` | 程序前端部分的运行端口 |
| `SECURITY_RATE_LIMIT` | 可选 | `"0"` | 控制每 60 分钟一个 IP 可以对后端服务器请求的次数（设置为 0 则为不限制） |
| `SECURITY_DELAY_AFTER` | 可选 | `"0"` | 控制同一 IP 重复请求后的延迟行为 |
| `SECURITY_BLACKLIST_LOG_FILE_PATH` | 可选 | `"logs/blacklist-ip.log"` | 记录触发速率限制的 IP |
| `ALLOWED_DOMAINS` | 可选 | `""` | 允许访问的域名，用逗号分隔，用于防止后端 API 被滥用 |
| `GOOGLE_MAP_API_KEY` | 可选 | `""` | Google 地图 API Key，用于展示 IP 所在地地图 |
| `ELINKSNET_API_ENDPOINT` | 可选 | `""` | ElinksNet 私有 API 端点 |
| `ELINKSNET_API_KEY` | 可选 | `""` | ElinksNet 私有 API 密钥 |
| `IPINFO_API_TOKEN` | 可选 | `""` | IPInfo.io API Token |
| `IPAPIIS_API_KEY` | 可选 | `""` | IPAPI.is API Key |
| `IP2LOCATION_API_KEY` | 可选 | `""` | IP2Location.io API Key |
| `CLOUDFLARE_API` | 可选 | `""` | Cloudflare API Key |
| `MAC_LOOKUP_API_KEY` | 可选 | `""` | MAC Lookup API Key |
| `VITE_CURL_IPV4_DOMAIN` | 可选 | `""` | 为 CURL API 提供 IPv4 域名 |
| `VITE_CURL_IPV6_DOMAIN` | 可选 | `""` | 为 CURL API 提供 IPv6 域名 |
| `VITE_CURL_IPV64_DOMAIN` | 可选 | `""` | 为 CURL API 提供双栈域名 |

如果 CURL 系列环境变量任意一个缺失，则不会启用 CURL API。

## 👩🏻‍💻 高级用法

如果你在通过代理上网，可以考虑在你的代理配置里增加下面的规则（请根据你使用的客户端进行修改），这样可以同时查询真实 IP 和代理后的 IP：

```ini
# IP Testing
IP-CIDR,1.0.0.2/32,Proxy,no-resolve
IP-CIDR6,2606:4700:4700::1111/128,Proxy,no-resolve
DOMAIN,4.ipcheck.ing,DIRECT
DOMAIN,6.ipcheck.ing,DIRECT
# Rule Testing
DOMAIN,ptest-1.ipcheck.ing,Proxy1
DOMAIN,ptest-2.ipcheck.ing,Proxy2
DOMAIN,ptest-3.ipcheck.ing,Proxy3
DOMAIN,ptest-4.ipcheck.ing,Proxy4
DOMAIN,ptest-5.ipcheck.ing,Proxy5
DOMAIN,ptest-6.ipcheck.ing,Proxy6
DOMAIN,ptest-7.ipcheck.ing,Proxy7
DOMAIN,ptest-8.ipcheck.ing,Proxy8
```

## 归属说明

ElinksNet 由 Elinks 维护。

ElinksNet 基于 Jason Ng 的 MyIP，并继续遵循 MIT License。根据 MIT License 要求，原始版权声明已保留在 `LICENSE` 文件中。

二次修改部分 Copyright (c) 2026 Elinks。
