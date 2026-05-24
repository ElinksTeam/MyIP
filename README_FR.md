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

## 📕 Comment utiliser

### Déploiement dans un environnement Node

Assurez-vous d'avoir Node.js installé.

Clonez le code :

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
```

Installer & Construire :

```bash
npm install && npm run build
```

Exécuter:

```bash
npm start
```

Le programme s'exécutera sur le port 18966.

### Docker

```bash
docker run -d -p 18966:18966 --name elinksnet --restart always elinksteam/elinksnet:latest
```

## 📚 Variables d'environnement

Les variables marquées **Oui** ci-dessous doivent être définies pour que le backend fonctionne correctement. Les identifiants MaxMind sont particulièrement importants — lisez les notes de configuration ci-dessous avant de remplir le tableau.

### Bases de données MaxMind (requis)

ElinksNet s'appuie sur les bases **GeoLite2** gratuites de MaxMind (City + ASN) pour la géolocalisation IP, la recherche ASN / organisation, et les badges de code pays qui apparaissent partout dans l'application (cartes IP, candidats ICE WebRTC, etc.). Une configuration MaxMind fonctionnelle est nécessaire pour que le backend offre une expérience complète.

Les fichiers `.mmdb` ne sont **pas inclus dans ce dépôt** car la licence GeoLite2 de MaxMind interdit la redistribution. Vous devez les fournir vous-même. Deux options :

**Option A — Automatique (recommandée, obligatoire pour Docker)**

1. Créez un compte gratuit sur [maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup).
2. Générez une clé de licence depuis la page « Manage License Keys » de votre compte.
3. Définissez ces trois variables d'environnement :
   ```bash
   MAXMIND_ACCOUNT_ID="your-account-id"
   MAXMIND_LICENSE_KEY="your-license-key"
   MAXMIND_AUTO_UPDATE="true"
   ```
4. Démarrez le backend. Environ 60 secondes après le premier démarrage, l'updater téléchargera les deux bases, puis les rafraîchira automatiquement toutes les 24 heures.

> ⚠️ **Les déploiements Docker doivent utiliser l'option A.** Un conteneur neuf est livré avec un répertoire `common/maxmind-db/` vide — sans les trois variables ci-dessus, le backend démarre mais la source IP basée sur MaxMind et les badges de pays WebRTC ne fonctionneront pas, et vous verrez `MaxMind API will return 503...` dans les journaux à chaque démarrage.

**Option B — Manuelle (environnements isolés ou non-Docker)**

Téléchargez `GeoLite2-City.mmdb` et `GeoLite2-ASN.mmdb` depuis votre compte MaxMind et placez-les dans `common/maxmind-db/` avant de démarrer le backend. Dans ce cas, `MAXMIND_AUTO_UPDATE` peut rester à `"false"`, mais vous devrez rafraîchir les fichiers manuellement à chaque nouvelle version publiée par MaxMind.

### Liste des variables d'environnement

| Nom de la variable | Requis | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `MAXMIND_ACCOUNT_ID` | **Oui** | `""` | ID de compte MaxMind, associé à `MAXMIND_LICENSE_KEY` pour télécharger les bases GeoLite2. Voir la section MaxMind ci-dessus. |
| `MAXMIND_LICENSE_KEY` | **Oui** | `""` | Clé de licence MaxMind, associée à `MAXMIND_ACCOUNT_ID`. Voir la section MaxMind ci-dessus. |
| `MAXMIND_AUTO_UPDATE` | **Oui** | `"false"` | Définissez sur `"true"` pour télécharger automatiquement les bases GeoLite2 environ 60 s après le démarrage et les rafraîchir toutes les 24 h. **Obligatoire pour Docker.** Peut rester à `"false"` uniquement si vous avez pré-déposé les fichiers `.mmdb` manuellement. |
| `VITE_GOOGLE_ANALYTICS_ID` | **Oui** | `""` | Identifiant Google Analytics, utilisé pour l'analyse des utilisateurs |
| `BACKEND_PORT` | Non | `"11966"` | Le port d'exécution de la partie backend du programme |
| `FRONTEND_PORT` | Non | `"18966"` | Le port d'exécution de la partie frontend du programme |
| `SECURITY_RATE_LIMIT` | Non | `"0"` | Contrôle le nombre de requêtes qu'une adresse IP peut faire au serveur backend toutes les 60 minutes (réglé sur 0 pour aucune limite) |
| `SECURITY_DELAY_AFTER` | Non | `"0"` | Contrôle les premières X requêtes d'une adresse IP toutes les 20 minutes qui ne sont pas soumises à des limites de vitesse, et après X requêtes, le délai augmentera |
| `SECURITY_BLACKLIST_LOG_FILE_PATH` | Non | `"logs/blacklist-ip.log"` | Paramètre de chemin. Enregistre la liste des adresses IP qui ont déclenché la limite après que `SECURITY_RATE_LIMIT` soit activé |
| `ALLOWED_DOMAINS` | Non | `""` | Domaines autorisés pour l'accès, séparés par des virgules, utilisés pour empêcher une utilisation abusive de l'API backend |
| `GOOGLE_MAP_API_KEY` | Non | `""` | Clé API pour Google Maps, utilisée pour afficher l'emplacement de l'adresse IP sur une carte |
| `IPCHECKING_API_ENDPOINT` | Non | `""` | endpoint de l'API pour IPCheck.ing database, utilisée pour obtenir des informations de géolocalisation précises sur l'adresse IP |
| `IPCHECKING_API_KEY` | Non | `""` | Clé API pour IPCheck.ing, utilisée pour obtenir des informations de géolocalisation précises sur l'adresse IP |
| `IPINFO_API_TOKEN` | Non | `""` | Jeton API pour IPInfo.io, utilisé pour obtenir des informations de géolocalisation sur l'adresse IP via IPInfo.io |
| `IPAPIIS_API_KEY` | Non | `""` | Clé API pour IPAPI.is, utilisée pour obtenir des informations de géolocalisation sur l'adresse IP via IPAPI.is |
| `IP2LOCATION_API_KEY` | Non | `""` | Clé API pour IP2Location.io, utilisée pour obtenir des informations de géolocalisation sur l'adresse IP via IP2Location.io |
| `CLOUDFLARE_API` | Non | `""` | Clé API pour Cloudflare, utilisée pour obtenir des informations sur le système AS via Cloudflare |
| `MAC_LOOKUP_API_KEY` | Non | `""` | Clé API pour MAC Lookup, utilisée pour obtenir des informations sur l'adresse MAC via MAC Lookup |
| `VITE_CURL_IPV4_DOMAIN` | Non | `""` | Fournit aux utilisateurs le domaine IPv4 pour l'API CURL |
| `VITE_CURL_IPV6_DOMAIN` | Non | `""` | Fournit aux utilisateurs le domaine IPv6 pour l'API CURL |
| `VITE_CURL_IPV64_DOMAIN` | Non | `""` | Fournit aux utilisateurs le domaine à pile double pour l'API CURL |

Il est à noter que si l'une quelconque des variables d'environnement de la série CURL est manquante, l'API CURL ne sera pas activée.

### Utilisation des variables d'environnement dans un environnement Node

Créez les variables d'environnement :

```bash
cp .env.example .env
```

Modifiez le fichier `.env`, et par exemple, ajoutez ce qui suit :

```bash
BACKEND_PORT=11966
FRONTEND_PORT=18966
MAXMIND_ACCOUNT_ID="YOUR_ACCOUNT_ID"
MAXMIND_LICENSE_KEY="YOUR_LICENSE_KEY"
MAXMIND_AUTO_UPDATE="true"
GOOGLE_MAP_API_KEY="YOUR_KEY_HERE"
ALLOWED_DOMAINS="example.com"
```

Ensuite, redémarrez le service backend.

### Utilisation des variables d'environnement dans Docker

Vous pouvez ajouter des variables d'environnement lors de l'exécution de Docker, par exemple :

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

## 👩🏻‍💻 Utilisation avancée

Si vous utilisez un proxy pour accéder à Internet, envisagez d'ajouter cette règle à votre configuration de proxy (modifiez-la en fonction de votre client). Cette configuration vous permet de vérifier à la fois votre véritable adresse IP et l'adresse IP lorsque vous utilisez le proxy :

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
