# ElinksNet 8

ElinksNet est une plateforme multilingue de renseignement IP et de diagnostic réseau développée avec Next.js, React, Tailwind CSS, HeroUI et shadcn/ui.

Service : [net.elinks.dev](https://net.elinks.dev)

## Fonctions principales

- Jusqu'à 26 sources IP sans clé, complétées par des sources authentifiées facultatives.
- Score de qualité IP et classification résidentielle, mobile, centre de données, proxy, VPN ou Tor.
- Transparence des sources, contribution par champ et état en temps réel.
- Tests IPv4/IPv6, WebRTC, fuite DNS approfondie, débit, latence mondiale, MTR, DNS, RDAP, WHOIS, MAC et accessibilité.
- Interface et noms géographiques localisés en anglais, chinois simplifié, japonais et thaï.
- Rapports partageables avec horodatage et empreinte SHA-256.
- ElinksAI avec modes Rapide, Professionnel et Analyse approfondie.

## Docker

```bash
docker run -d --name elinksnet --restart unless-stopped \
  -p 18966:18966 elinksteam/elinksnet:8.0.0
```

## Variables facultatives

`GROQ_API_KEY`, `ELINKS_AI_MODEL`, `ELINKS_AI_FAST_MODEL`, `ELINKS_AI_DEEP_MODEL`, `IPINFO_API_TOKEN`, `IPAPIIS_API_KEY`, `IP2LOCATION_API_KEY` et `MAC_LOOKUP_API_KEY`.

## Origine et licence

ElinksNet 8 a été largement réécrit sous Next.js, mais ce dépôt conserve du code et l'historique issus du projet MyIP de Jason Ng. Il reste donc une œuvre dérivée sous licence MIT. L'avis de droit d'auteur d'origine est conservé dans `LICENSE`.
