# 🧰 ElinksNet - Boîte à outils IP et réseau

<div align="center">

<h1>ElinksNet</h1>
<p><strong>Boîte à outils IP et réseau</strong></p>

[![Mentioned in Awesome Self Hosted](https://awesome.re/mentioned-badge.svg)](https://github.com/awesome-selfhosted/awesome-selfhosted)

![GitHub Repo stars](https://img.shields.io/github/stars/ElinksTeam/MyIP)
![GitHub forks](https://img.shields.io/github/forks/ElinksTeam/MyIP)
![PWA](https://img.shields.io/badge/PWA-Supported-blue)

🇺🇸 [English](README.md) | 🇨🇳 [简体中文](README_ZH.md) | 🇫🇷 [Français](README_FR.md) | 🇹🇷 [Türkçe](README_TR.md)

Déployez votre propre instance ElinksNet.

</div>

## 👀 Principales fonctionnalités

* 🛜 **Afficher vos adresses IP** : Détecte et affiche votre adresse IP locale, provenant de plusieurs fournisseurs IPv4 et IPv6.
* 🔍 **Recherche d'informations sur l'adresse IP** : Fournit un outil pour interroger des informations sur n'importe quelle adresse IP.
* 🕵️ **Informations sur l'adresse IP** : Présente des informations détaillées pour toutes les adresses IP, y compris le pays, la région, l'ASN, la localisation géographique, et plus encore.
* 🚦 **Vérification de disponibilité** : Teste l'accessibilité de différents sites web, tels que Google, GitHub, YouTube, ChatGPT, et d'autres.
* 🚥 **Détection WebRTC** : Identifie l'adresse IP utilisée lors des connexions WebRTC.
* 🛑 **Test de fuite DNS** : Affiche les données de point de terminaison DNS pour évaluer le risque de fuites DNS lors de l'utilisation de VPN ou de proxies.
* 🚀 **Test de vitesse** : Testez la vitesse de votre réseau avec des réseaux de pointe.
* 🚏 **Test de règles** : Teste si les paramètres de règles fonctionnent correctement avec le logiciel de proxy.
* ⏱️ **Test de latence mondiale** : Effectue des tests de latence sur des serveurs situés dans différentes régions du monde.
* 📡 **Test MTR** : Effectue des tests MTR sur des serveurs situés dans différentes régions du monde.
* 🔦 **Résolveur DNS** : effectue la résolution DNS d'un nom de domaine à partir de plusieurs sources, obtient les résultats de la résolution en temps réel et peut être utilisé pour la détermination de la contamination.
* 🚧 **Test de Censorship**: Vérifier si un site est bloqué dans certains pays.
* 📓 **Recherche Whois** : Effectuer une recherche d'informations Whois pour les noms de domaine ou les adresses IP
* 📀 **Recherche MAC** : Requête d'informations d'une adresse physique
* 🖥️ **Empreinte digitale du navigateur**: Plusieurs façons de visualiser l'empreinte digitale de votre navigateur
* 📋 **Liste de contrôle de cybersécurité**：: Une liste de contrôle complète de la cybersécurité avec un total de 258 éléments

## 💪Également

* 🌗 **Mode sombre** : Bascule automatiquement entre les modes sombre et clair en fonction des paramètres du système, avec une option de basculement manuel.
* 📱 **Mode minimaliste** : Un mode optimisé pour les mobiles qui réduit la longueur de la page pour un accès rapide aux informations essentielles.
* 📲 **Prise en charge de PWA** : Peut être ajouté en tant qu'application de bureau sur votre téléphone ainsi qu'en tant qu'application Chrome sur votre ordinateur.
* ⌨️ **Raccourcis clavier** : Prend en charge les raccourcis clavier pour toutes les fonctions, appuyez sur `?` pour afficher la liste des raccourcis.
* 🌍 Basé sur les résultats des tests de disponibilité, il indique si l'accès Internet mondial est actuellement réalisable.
* 🇺🇸 🇨🇳 🇫🇷 🇹🇷 Prise en charge de l'anglais, du chinois, du français et du turc.

## 🚀 Déploiement rapide

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

### Construction locale

Utilisez cette option si les images Docker publiques ne sont pas encore publiées.

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
docker build -t elinksnet .
docker run -d -p 18966:18966 --name elinksnet --restart unless-stopped elinksnet
```

## 📕 Déploiement manuel avec Node

Assurez-vous d'avoir Node.js installé.

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
npm install && npm run build
npm start
```

Le programme s'exécutera sur le port 18966.

## 📚 Variables d'environnement

ElinksNet peut démarrer sans identifiants MaxMind, mais la géolocalisation IP complète, les informations ASN / organisation et les badges de pays nécessitent les bases MaxMind GeoLite2. Pour une meilleure expérience Docker, configurez les trois variables MaxMind ci-dessous.

### Bases de données MaxMind

ElinksNet s'appuie sur les bases **GeoLite2** gratuites de MaxMind (City + ASN) pour fournir une géolocalisation IP et des informations ASN complètes.

Les fichiers `.mmdb` ne sont **pas inclus dans ce dépôt** car la licence GeoLite2 de MaxMind interdit la redistribution. Vous devez les fournir vous-même. Deux options :

**Option A — Automatique (recommandée pour Docker)**

1. Créez un compte gratuit sur [maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup).
2. Générez une clé de licence depuis la page « Manage License Keys » de votre compte.
3. Définissez ces trois variables d'environnement :
   ```bash
   MAXMIND_ACCOUNT_ID="your-account-id"
   MAXMIND_LICENSE_KEY="your-license-key"
   MAXMIND_AUTO_UPDATE="true"
   ```
4. Démarrez le backend. Environ 60 secondes après le premier démarrage, l'updater téléchargera les deux bases, puis les rafraîchira automatiquement toutes les 24 heures.

**Option B — Manuelle**

Téléchargez `GeoLite2-City.mmdb` et `GeoLite2-ASN.mmdb` depuis votre compte MaxMind et placez-les dans `common/maxmind-db/` avant de démarrer le backend.

### Liste des variables d'environnement

| Nom de la variable | Requis | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `MAXMIND_ACCOUNT_ID` | Recommandé | `""` | ID de compte MaxMind, associé à `MAXMIND_LICENSE_KEY` pour télécharger les bases GeoLite2. |
| `MAXMIND_LICENSE_KEY` | Recommandé | `""` | Clé de licence MaxMind, associée à `MAXMIND_ACCOUNT_ID`. |
| `MAXMIND_AUTO_UPDATE` | Recommandé | `"false"` | Définissez sur `"true"` pour télécharger automatiquement les bases GeoLite2 après le démarrage et les rafraîchir toutes les 24 h. |
| `VITE_GOOGLE_ANALYTICS_ID` | Optionnel | `""` | Identifiant Google Analytics, utilisé pour l'analyse des utilisateurs |
| `BACKEND_PORT` | Optionnel | `"11966"` | Le port d'exécution de la partie backend du programme |
| `FRONTEND_PORT` | Optionnel | `"18966"` | Le port d'exécution de la partie frontend du programme |
| `SECURITY_RATE_LIMIT` | Optionnel | `"0"` | Contrôle le nombre de requêtes qu'une adresse IP peut faire au serveur backend toutes les 60 minutes |
| `SECURITY_DELAY_AFTER` | Optionnel | `"0"` | Contrôle le délai après des requêtes répétées depuis la même IP |
| `SECURITY_BLACKLIST_LOG_FILE_PATH` | Optionnel | `"logs/blacklist-ip.log"` | Enregistre les IP ayant déclenché les limites |
| `ALLOWED_DOMAINS` | Optionnel | `""` | Domaines autorisés, séparés par des virgules, pour éviter les abus de l'API backend |
| `GOOGLE_MAP_API_KEY` | Optionnel | `""` | Clé API Google Maps pour afficher l'emplacement de l'IP |
| `IPCHECKING_API_ENDPOINT` | Optionnel | `""` | Endpoint de l'API IPCheck.ing |
| `IPCHECKING_API_KEY` | Optionnel | `""` | Clé API IPCheck.ing |
| `IPINFO_API_TOKEN` | Optionnel | `""` | Jeton API IPInfo.io |
| `IPAPIIS_API_KEY` | Optionnel | `""` | Clé API IPAPI.is |
| `IP2LOCATION_API_KEY` | Optionnel | `""` | Clé API IP2Location.io |
| `CLOUDFLARE_API` | Optionnel | `""` | Clé API Cloudflare |
| `MAC_LOOKUP_API_KEY` | Optionnel | `""` | Clé API MAC Lookup |
| `VITE_CURL_IPV4_DOMAIN` | Optionnel | `""` | Domaine IPv4 pour l'API CURL |
| `VITE_CURL_IPV6_DOMAIN` | Optionnel | `""` | Domaine IPv6 pour l'API CURL |
| `VITE_CURL_IPV64_DOMAIN` | Optionnel | `""` | Domaine double pile pour l'API CURL |

Si l'une des variables d'environnement de la série CURL est manquante, l'API CURL ne sera pas activée.

## 👩🏻‍💻 Utilisation avancée

Si vous utilisez un proxy pour accéder à Internet, envisagez d'ajouter cette règle à votre configuration de proxy. Cette configuration vous permet de vérifier à la fois votre véritable adresse IP et l'adresse IP lorsque vous utilisez le proxy :

```ini
# Test d'adresse IP
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

ElinksNet est maintenu par ElinksTeam.

ElinksNet est basé sur MyIP de Jason Ng et reste sous licence MIT. L'avis de copyright original est conservé dans `LICENSE`, comme l'exige la licence MIT.

Modifications supplémentaires Copyright (c) 2026 ElinksTeam.
