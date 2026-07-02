# ElinksNet 8

ElinksNet is a multilingual IP intelligence and network diagnostics workspace built with Next.js, React, Tailwind CSS, HeroUI, and shadcn/ui.

Live service: [net.elinks.dev](https://net.elinks.dev)

Languages: [English](README.md) · [简体中文](README_ZH.md) · [Français](README_FR.md) · [Türkçe](README_TR.md)

## Highlights

- Aggregates up to 26 keyless IP intelligence sources plus optional authenticated sources.
- Reports IP quality, residential/mobile/datacenter classification, ASN, organization, location, proxy, VPN, Tor, and hosting signals.
- Shows field-level source transparency, provider agreement, and live service availability.
- Includes IPv4/IPv6 connectivity, WebRTC exposure, deep DNS leak, speed, global latency, MTR, DNS, RDAP, WHOIS, MAC, and reachability tools.
- Localizes interface copy and geographic names in English, Simplified Chinese, Japanese, and Thai.
- Generates shareable IP report images with timestamp and SHA-256 report fingerprint.
- Provides ElinksAI network analysis with Fast, Professional, and Deep Analysis modes.
- Supports PWA installation, responsive mobile layouts, Docker, and Vercel.

## Docker

```bash
docker run -d \
  --name elinksnet \
  --restart unless-stopped \
  -p 18966:18966 \
  elinksteam/elinksnet:8.0.0
```

GitHub Container Registry:

```bash
docker run -d \
  --name elinksnet \
  --restart unless-stopped \
  -p 18966:18966 \
  ghcr.io/elinksteam/elinksnet:8.0.0
```

Docker Compose:

```bash
git clone https://github.com/ElinksTeam/ElinksNet.git
cd ElinksNet
docker compose up -d --build
```

## Node.js

Node.js 24 is recommended.

```bash
npm ci
npm run build
npm start -- -p 18966
```

## Environment variables

All core IP and network tools work without API keys. Optional variables enable enhanced providers and ElinksAI.

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Optional | Server-side credential for ElinksAI. Never expose it to the browser. |
| `ELINKS_AI_MODEL` | Optional | Professional-mode model override. |
| `ELINKS_AI_FAST_MODEL` | Optional | Fast-mode model override. |
| `ELINKS_AI_DEEP_MODEL` | Optional | Deep-analysis model override. |
| `IPINFO_API_TOKEN` | Optional | Authenticated IPinfo source. |
| `IPAPIIS_API_KEY` | Optional | Enhanced IPAPI.is source. |
| `IP2LOCATION_API_KEY` | Optional | Enhanced IP2Location source. |
| `MAC_LOOKUP_API_KEY` | Optional | Higher MAC lookup quota. |
| `ELINKSNET_API_ENDPOINT` | Optional | Private privacy-detection endpoint. |
| `ELINKSNET_API_KEY` | Optional | Credential for the private endpoint. |

## Public API

Same-origin endpoints are keyless and rate limited:

```bash
curl https://net.elinks.dev/api/cli/ip
curl "https://net.elinks.dev/api/cli/ip?format=json"
curl https://net.elinks.dev/api/cli/geo
curl "https://net.elinks.dev/api/cli/geo?ip=8.8.8.8"
```

## Project lineage and license

ElinksNet 8 is now a substantially rewritten Next.js product with an independent interface, application architecture, data-fusion layer, diagnostics, localization, and AI workflow. The repository nevertheless retains code and history derived from Jason Ng's MyIP project. It therefore remains a derivative work under the MIT License.

The original copyright notice must remain in `LICENSE`. New ElinksNet modifications are Copyright (c) 2026 Elinks.
