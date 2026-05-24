# 🧰 ElinksNet - IP & Network Toolbox

<div align="center">

![ElinksNet Banner](https://raw.githubusercontent.com/ElinksTeam/ElinksNet/main/public/github/gh_banner.png)

[![Mentioned in Awesome Self Hosted](https://awesome.re/mentioned-badge.svg)](https://github.com/awesome-selfhosted/awesome-selfhosted)

![GitHub Repo stars](https://img.shields.io/github/stars/ElinksTeam/ElinksNet)
![GitHub forks](https://img.shields.io/github/forks/ElinksTeam/ElinksNet)
![Docker Pulls](https://img.shields.io/docker/pulls/elinksteam/elinksnet)

![PWA](https://img.shields.io/badge/PWA-Supported-blue)

![CodeQL](https://github.com/ElinksTeam/ElinksNet/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)
![Docker Build and Push](https://github.com/ElinksTeam/ElinksNet/actions/workflows/docker-image.yml/badge.svg?branch=main)

🇺🇸 [English](README.md) | 🇨🇳 [简体中文](README_ZH.md) | 🇫🇷 [Français](README_FR.md)

Deploy your own ElinksNet instance.

[![Deploy with Docker](https://raw.githubusercontent.com/ElinksTeam/ElinksNet/main/public/github/Docker.svg)](https://hub.docker.com/r/elinksteam/elinksnet)

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
* 🇺🇸 🇨🇳 🇫🇷 English, Chinese, and French support.

## 📕 How to Use

### Deploying in a Node Environment

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

### Using Docker

Click the 'Deploy to Docker' button at the top to complete the deployment. Or, use the following shell:

```bash
docker run -d -p 18966:18966 --name elinksnet --restart always elinksteam/elinksnet:latest
```

## 📚 Environment Variable

Variables marked **Yes** below must be set for the backend to function correctly. The MaxMind credentials in particular are required — read the setup notes in the next subsection before filling in the table.

### MaxMind Databases (Required)

ElinksNet relies on the free **GeoLite2** databases from MaxMind (City + ASN) for IP geolocation, ASN / organization lookup, and the country-code badges that appear throughout the app (IP cards, WebRTC ICE candidates, and more). A working MaxMind setup is required for the backend to serve a complete experience.

The `.mmdb` files are **not checked into this repository** because MaxMind's GeoLite2 license does not allow redistribution. You need to provide them yourself. There are two paths:

**Option A — Automatic (recommended, required for Docker)**

1. Create a free account at [maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup).
2. Generate a license key from your account's "Manage License Keys" page.
3. Set these three environment variables:
   ```bash
   MAXMIND_ACCOUNT_ID="your-account-id"
   MAXMIND_LICENSE_KEY="your-license-key"
   MAXMIND_AUTO_UPDATE="true"
   ```
4. Start the backend. Within about 60 seconds of the first startup, the updater will download both databases. They are then refreshed every 24 hours automatically.

> ⚠️ **Docker deployers must use Option A.** A fresh container ships with an empty `common/maxmind-db/` directory — without the three variables above the backend starts, but the MaxMind-powered IP source and WebRTC country badges will not work, and you'll see `MaxMind API will return 503...` in the logs on every boot.

**Option B — Manual (for air-gapped or non-Docker setups)**

Download `GeoLite2-City.mmdb` and `GeoLite2-ASN.mmdb` from your MaxMind account and drop them into `common/maxmind-db/` before starting the backend. With this approach `MAXMIND_AUTO_UPDATE` can stay `"false"`, but you'll need to refresh the files manually as MaxMind publishes new versions.

### Environment variables list

| Variable Name | Required | Default Value | Description |
| --- | --- | --- | --- |
| `MAXMIND_ACCOUNT_ID` | **Yes** | `""` | MaxMind account ID, paired with `MAXMIND_LICENSE_KEY` to download GeoLite2 databases. See the MaxMind section above. |
| `MAXMIND_LICENSE_KEY` | **Yes** | `""` | MaxMind license key, paired with `MAXMIND_ACCOUNT_ID`. See the MaxMind section above. |
| `MAXMIND_AUTO_UPDATE` | **Yes** | `"false"` | Set to `"true"` to auto-download GeoLite2 databases ~60s after startup and refresh every 24h. **Required for Docker.** Can stay `"false"` only if you've pre-seeded the `.mmdb` files manually. |
| `VITE_GOOGLE_ANALYTICS_ID` | **Yes** | `""` | Google Analytics ID, used to track user behavior |
| `BACKEND_PORT` | No | `"11966"` | The running port of the backend part of the program |
| `FRONTEND_PORT` | No | `"18966"` | The running port of the frontend part of the program |
| `SECURITY_RATE_LIMIT` | No | `"0"` | Controls the number of requests an IP can make to the backend server every 60 minutes (set to 0 for no limit) |
| `SECURITY_DELAY_AFTER` | No | `"0"` | Controls the first X requests from an IP every 20 minutes that are not subject to speed limits, and after X requests, the delay will increase |
| `SECURITY_BLACKLIST_LOG_FILE_PATH` | No | `"logs/blacklist-ip.log"` | Path setting. Records the list of IPs that triggered the limit after SECURITY_RATE_LIMIT is enabled |
| `ALLOWED_DOMAINS` | No | `""` | Allowed domains for access, separated by commas, used to prevent misuse of the backend API |
| `GOOGLE_MAP_API_KEY` | No | `""` | API Key for Google Maps, used to display the location of the IP on a map |
| `IPCHECKING_API_ENDPOINT` | No | `""` | API endpoint for IPCheck.ing database, used to obtain accurate IP geolocation information |
| `IPCHECKING_API_KEY` | No | `""` | API Key for IPCheck.ing database, used to obtain accurate IP geolocation information |
| `IPINFO_API_TOKEN` | No | `""` | API Token for IPInfo.io, used to obtain IP geolocation information through IPInfo.io |
| `IPAPIIS_API_KEY` | No | `""` | API Key for IPAPI.is, used to obtain IP geolocation information through IPAPI.is |
| `IP2LOCATION_API_KEY` | No | `""` | API Key for IP2Location.io, used to obtain IP geolocation information through IP2Location.io |
| `CLOUDFLARE_API` | No | `""` | API Key for Cloudflare, used to obtain AS system information through Cloudflare |
| `MAC_LOOKUP_API_KEY` | No | `""` | API Key for MAC Lookup, used to obtain MAC address information |
| `VITE_CURL_IPV4_DOMAIN` | No | `""` | Provides the IPv4 domain for the CURL API to users |
| `VITE_CURL_IPV6_DOMAIN` | No | `""` | Provides the IPv6 domain for the CURL API to users |
| `VITE_CURL_IPV64_DOMAIN` | No | `""` | Provides the dual-stack domain for the CURL API to users |

Note that if any of the CURL series environment variables are missing, the CURL API will not be enabled.

### Using Environment Variables in a Node Environment

Create environment variables:

```bash
cp .env.example .env
```

Modify `.env`, and for example, add the following:

```bash
BACKEND_PORT=11966
FRONTEND_PORT=18966
MAXMIND_ACCOUNT_ID="YOUR_ACCOUNT_ID"
MAXMIND_LICENSE_KEY="YOUR_LICENSE_KEY"
MAXMIND_AUTO_UPDATE="true"
GOOGLE_MAP_API_KEY="YOUR_KEY_HERE"
ALLOWED_DOMAINS="example.com"
```

Then restart the backend service.

### Using Environment Variables in Docker

You can add environment variables when running Docker, for example:

```bash
docker run -d -p 18966:18966 \
  -e MAXMIND_ACCOUNT_ID="YOUR_ACCOUNT_ID" \
  -e MAXMIND_LICENSE_KEY="YOUR_LICENSE_KEY" \
  -e MAXMIND_AUTO_UPDATE="true" \
  -e GOOGLE_MAP_API_KEY="YOUR_KEY_HERE" \
  -e ALLOWED_DOMAINS="example.com" \
  --name elinksnet \
  elinksteam/elinksnet:latest

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

ElinksNet is maintained by ElinksTeam.

ElinksNet is based on MyIP by Jason Ng and remains licensed under the MIT License. The original copyright notice is preserved in `LICENSE` as required by the MIT License.

Additional modifications Copyright (c) 2026 ElinksTeam.
