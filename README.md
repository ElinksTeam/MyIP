# 🧰 ElinksNet - IP & Network Toolbox

<div align="center">

<h1>ElinksNet</h1>
<p><strong>IP & Network Toolbox</strong></p>

[![Mentioned in Awesome Self Hosted](https://awesome.re/mentioned-badge.svg)](https://github.com/awesome-selfhosted/awesome-selfhosted)

![GitHub Repo stars](https://img.shields.io/github/stars/ElinksTeam/ElinksNet)
![GitHub forks](https://img.shields.io/github/forks/ElinksTeam/ElinksNet)
![PWA](https://img.shields.io/badge/PWA-Supported-blue)

🇺🇸 [English](README.md) | 🇨🇳 [简体中文](README_ZH.md) | 🇫🇷 [Français](README_FR.md) | 🇹🇷 [Türkçe](README_TR.md)

Deploy your own ElinksNet instance.

</div>

## 👀 Main Features

* 🛜 **View Your IPs**: Detects and displays your local IPs, sourcing from multiple IPv4 and IPv6 providers.
* 🔍 **Search IP Information**: Provides a tool for querying information about any IP address. 
* 🕵️ **IP Information**: Presents detailed information for all IP addresses, including country, region, ASN, geographic location, and more.
* 🚦 **Availability Check**: Tests the accessibility of various websites, such as Google, GitHub, YouTube, ChatGPT, and others.
* 🚥 **WebRTC Detection**: Identifies the IP address used during WebRTC connections.
* 🛑 **DNS Leak Test**: Shows DNS endpoint data to evaluate the risk of DNS leaks when using VPNs or proxies.
* 🚀 **Speed Test**：Test your network speed with edge networks.
* 🚏 **Proxy Rule Testing**: Test the rule settings of proxy software to ensure their correctness.
* ⏱️ **Global Latency Test**: Performe lantency tests on servers located in different regions around the world.
* 📡 **MTR Test**: Perform MTR tests on servers located in different regions around the world.
* 🔦 **DNS Resolver**: Performs DNS resolution of a domain name from multiple sources and obtains real-time resolution results that can be used for contamination determination.
* 🚧 **Censorship Check**: Check if a website is blocked in some countries.
* 📓 **Whois Search**: Perform whois information search for domain names or IP addresses
* 📀 **MAC Lookup**: Query information of a physical address
* 🖥️ **Browser Fingerprints**：Multiple ways to caculate your browser fingerprint
* 📋 **Cybersecurity Checklist**：A comprehensive cybersecurity checklist with a total of 258 items

## 💪 Also

* 🌗 **Dark Mode**: Automatically toggles between dark and daylight modes based on system settings, with an option for manual switching.
* 📱 **Minimalist Mode**: A mobile-optimized mode that shortens page length for quick access to essential information..
* 📲 **PWA Supported**：Can be added as a desktop app on your phone as well as a Chrome app on your computer.
* ⌨️ **Keyboard Shortcuts**: Supports keyboard shortcuts for all functions, press `?` to view the shortcut list.
* 🌍 Based on availability test results, it indicates whether global internet access is currently feasible.
* 🇺🇸 🇨🇳 🇫🇷 🇹🇷 English, Chinese, French, and Turkish support.

## 🚀 Quick Deploy

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
git clone https://github.com/ElinksTeam/ElinksNet.git
cd ElinksNet
docker compose up -d
```

### Build locally

Use this option if the public Docker images have not been published yet.

```bash
git clone https://github.com/ElinksTeam/ElinksNet.git
cd ElinksNet
docker build -t elinksnet .
docker run -d -p 18966:18966 --name elinksnet --restart unless-stopped elinksnet
```

## 📕 Manual Node Deployment

Make sure you have Node.js installed.

Clone the code:

```bash
git clone https://github.com/ElinksTeam/ElinksNet.git
cd ElinksNet
```

Install and build:

```bash
npm install && npm run build
```

Run:

```bash
npm start
```

The program will run on port 18966.

## 📚 Environment Variables

ElinksNet can start without MaxMind credentials, but full IP geolocation, ASN / organization lookup, and country badges require the MaxMind GeoLite2 databases. For the best Docker experience, configure the three MaxMind variables below.

### MaxMind Databases

ElinksNet relies on the free **GeoLite2** databases from MaxMind (City + ASN) for complete IP geolocation and ASN information.

The `.mmdb` files are **not checked into this repository** because MaxMind's GeoLite2 license does not allow redistribution. You need to provide them yourself. There are two paths:

**Option A — Automatic (recommended for Docker)**

1. Create a free account at [maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup).
2. Generate a license key from your account's "Manage License Keys" page.
3. Set these three environment variables:
   ```bash
   MAXMIND_ACCOUNT_ID="your-account-id"
   MAXMIND_LICENSE_KEY="your-license-key"
   MAXMIND_AUTO_UPDATE="true"
   ```
4. Start the backend. Within about 60 seconds of the first startup, the updater will download both databases. They are then refreshed every 24 hours automatically.

**Option B — Manual**

Download `GeoLite2-City.mmdb` and `GeoLite2-ASN.mmdb` from your MaxMind account and drop them into `common/maxmind-db/` before starting the backend.

### Environment variables list

| Variable Name | Required | Default Value | Description |
| --- | --- | --- | --- |
| `MAXMIND_ACCOUNT_ID` | Recommended | `""` | MaxMind account ID, paired with `MAXMIND_LICENSE_KEY` to download GeoLite2 databases. |
| `MAXMIND_LICENSE_KEY` | Recommended | `""` | MaxMind license key, paired with `MAXMIND_ACCOUNT_ID`. |
| `MAXMIND_AUTO_UPDATE` | Recommended | `"false"` | Set to `"true"` to auto-download GeoLite2 databases after startup and refresh every 24h. |
| `VITE_GOOGLE_ANALYTICS_ID` | Optional | `""` | Google Analytics ID, used to track user behavior |
| `BACKEND_PORT` | Optional | `"11966"` | The running port of the backend part of the program |
| `FRONTEND_PORT` | Optional | `"18966"` | The running port of the frontend part of the program |
| `SECURITY_RATE_LIMIT` | Optional | `"0"` | Controls the number of requests an IP can make to the backend server every 60 minutes (set to 0 for no limit) |
| `SECURITY_DELAY_AFTER` | Optional | `"0"` | Controls request delay behavior after repeated requests from the same IP |
| `SECURITY_BLACKLIST_LOG_FILE_PATH` | Optional | `"logs/blacklist-ip.log"` | Records IPs that triggered rate limits |
| `ALLOWED_DOMAINS` | Optional | `""` | Allowed domains for access, separated by commas, used to prevent misuse of the backend API |
Maps use OpenStreetMap and do not require an API key.
| `ELINKSNET_API_ENDPOINT` | Optional | `""` | Private ElinksNet API endpoint |
| `ELINKSNET_API_KEY` | Optional | `""` | Private ElinksNet API key |
| `IPINFO_API_TOKEN` | Optional | `""` | API Token for IPInfo.io |
| `IPAPIIS_API_KEY` | Optional | `""` | API Key for IPAPI.is |
| `IP2LOCATION_API_KEY` | Optional | `""` | API Key for IP2Location.io |
| `CLOUDFLARE_API` | Optional | `""` | API Key for Cloudflare |
| `MAC_LOOKUP_API_KEY` | Optional | `""` | API Key for MAC Lookup |
| `GROQ_API_KEY` | Optional | `""` | Server-side Groq key for Elinks AI safety advice |
| `ELINKS_AI_MODEL` | Optional | `"llama-3.3-70b-versatile"` | Groq model used by Elinks AI |
## Public CLI API

The deployment exposes a same-origin, keyless CLI API. Requests are limited to
60 per minute per client IP.

```bash
curl https://your-domain.example/api/cli/ip
curl "https://your-domain.example/api/cli/ip?format=json"
curl https://your-domain.example/api/cli/geo
curl "https://your-domain.example/api/cli/geo?ip=8.8.8.8"
```

## 👩🏻‍💻 Advanced Usage

If you're using a proxy for internet access, consider adding this rule to your proxy configuration (modify it according to your client). This setup lets you check both your real IP and the IP when using the proxy:

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

## Attribution

ElinksNet is maintained by Elinks.

ElinksNet is based on MyIP by Jason Ng and remains licensed under the MIT License. The original copyright notice is preserved in `LICENSE` as required by the MIT License.

Additional modifications Copyright (c) 2026 Elinks.
