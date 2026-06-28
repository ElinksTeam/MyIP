# ElinksNet - IP ve Ağ Araç Kutusu

<div align="center">

<h1>ElinksNet</h1>
<p><strong>IP ve Ağ Araç Kutusu</strong></p>

![GitHub Repo stars](https://img.shields.io/github/stars/ElinksTeam/MyIP)
![GitHub forks](https://img.shields.io/github/forks/ElinksTeam/MyIP)
![PWA](https://img.shields.io/badge/PWA-Supported-blue)

English: [README.md](README.md) | 中文: [README_ZH.md](README_ZH.md) | Français: [README_FR.md](README_FR.md) | Türkçe: [README_TR.md](README_TR.md)

ElinksNet kendi kendine barındırılabilen açık kaynaklı bir IP ve ağ araç kutusudur.

</div>

## Özellikler

- IP adreslerinizi görüntüleme
- IP bilgisi ve coğrafi konum sorgulama
- DNS sızıntı testi
- WebRTC bağlantı testi
- Web sitesi erişilebilirlik kontrolü
- Hız testi
- Gecikme ve MTR testi
- DNS kayıt sorgulama
- Whois sorgulama
- MAC adresi sorgulama
- Tarayıcı parmak izi araçları
- Siber güvenlik kontrol listesi

## Hızlı Dağıtım

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

### Yerel Derleme

Genel Docker imajları henüz yayınlanmadıysa bu yöntemi kullanabilirsiniz.

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
docker build -t elinksnet .
docker run -d -p 18966:18966 --name elinksnet --restart unless-stopped elinksnet
```

## Node ile Manuel Kurulum

Node.js kurulu olduğundan emin olun.

```bash
git clone https://github.com/ElinksTeam/MyIP.git
cd MyIP
npm install && npm run build
npm start
```

Varsayılan port: `18966`.

## Ortam Değişkenleri

ElinksNet, MaxMind bilgileri olmadan başlatılabilir. Ancak tam IP coğrafi konumu, ASN / organizasyon bilgisi ve ülke rozetleri için MaxMind GeoLite2 veritabanları önerilir. Docker ile en iyi deneyim için aşağıdaki üç MaxMind değişkenini yapılandırın.

### MaxMind Veritabanları

ElinksNet, tam IP coğrafi konumu ve ASN bilgileri için MaxMind'in ücretsiz **GeoLite2** veritabanlarını (City + ASN) kullanır.

`.mmdb` dosyaları MaxMind GeoLite2 lisansı nedeniyle bu depoda dağıtılmaz. Dosyaları kendiniz sağlamalısınız. İki seçenek vardır:

**Seçenek A — Otomatik (Docker için önerilir)**

1. [maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup) adresinden ücretsiz bir hesap oluşturun.
2. Hesabınızın "Manage License Keys" sayfasından bir lisans anahtarı oluşturun.
3. Bu üç ortam değişkenini ayarlayın:
   ```bash
   MAXMIND_ACCOUNT_ID="your-account-id"
   MAXMIND_LICENSE_KEY="your-license-key"
   MAXMIND_AUTO_UPDATE="true"
   ```
4. Backend'i başlatın. İlk başlatmadan yaklaşık 60 saniye sonra updater iki veritabanını indirir ve ardından her 24 saatte bir yeniler.

**Seçenek B — Manuel**

MaxMind hesabınızdan `GeoLite2-City.mmdb` ve `GeoLite2-ASN.mmdb` dosyalarını indirin ve backend'i başlatmadan önce `common/maxmind-db/` dizinine yerleştirin.

### Ortam değişkenleri listesi

| Değişken | Gerekli | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `MAXMIND_ACCOUNT_ID` | Önerilir | `""` | GeoLite2 veritabanlarını indirmek için `MAXMIND_LICENSE_KEY` ile birlikte kullanılan MaxMind hesap ID'si. |
| `MAXMIND_LICENSE_KEY` | Önerilir | `""` | `MAXMIND_ACCOUNT_ID` ile birlikte kullanılan MaxMind lisans anahtarı. |
| `MAXMIND_AUTO_UPDATE` | Önerilir | `"false"` | Başlatmadan sonra GeoLite2 veritabanlarını otomatik indirmek ve her 24 saatte bir yenilemek için `"true"` yapın. |
| `VITE_GOOGLE_ANALYTICS_ID` | İsteğe bağlı | `""` | Google Analytics ID'si |
| `BACKEND_PORT` | İsteğe bağlı | `"11966"` | Backend çalışma portu |
| `FRONTEND_PORT` | İsteğe bağlı | `"18966"` | Frontend çalışma portu |
| `SECURITY_RATE_LIMIT` | İsteğe bağlı | `"0"` | Aynı IP'nin backend'e yapabileceği istek sayısını sınırlar |
| `SECURITY_DELAY_AFTER` | İsteğe bağlı | `"0"` | Aynı IP'den tekrarlanan isteklerden sonra gecikme davranışını kontrol eder |
| `SECURITY_BLACKLIST_LOG_FILE_PATH` | İsteğe bağlı | `"logs/blacklist-ip.log"` | Hız sınırını tetikleyen IP'leri kaydeder |
| `ALLOWED_DOMAINS` | İsteğe bağlı | `""` | Backend API kötüye kullanımını önlemek için izin verilen alan adları |
| `GOOGLE_MAP_API_KEY` | İsteğe bağlı | `""` | IP konumunu haritada göstermek için Google Maps API Key |
| `ELINKSNET_API_ENDPOINT` | İsteğe bağlı | `""` | Özel ElinksNet API uç noktası |
| `ELINKSNET_API_KEY` | İsteğe bağlı | `""` | Özel ElinksNet API anahtarı |
| `IPINFO_API_TOKEN` | İsteğe bağlı | `""` | IPInfo.io API Token |
| `IPAPIIS_API_KEY` | İsteğe bağlı | `""` | IPAPI.is API Key |
| `IP2LOCATION_API_KEY` | İsteğe bağlı | `""` | IP2Location.io API Key |
| `CLOUDFLARE_API` | İsteğe bağlı | `""` | Cloudflare API Key |
| `MAC_LOOKUP_API_KEY` | İsteğe bağlı | `""` | MAC Lookup API Key |
| `VITE_CURL_IPV4_DOMAIN` | İsteğe bağlı | `""` | CURL API için IPv4 alan adı |
| `VITE_CURL_IPV6_DOMAIN` | İsteğe bağlı | `""` | CURL API için IPv6 alan adı |
| `VITE_CURL_IPV64_DOMAIN` | İsteğe bağlı | `""` | CURL API için çift yığın alan adı |

CURL serisi ortam değişkenlerinden herhangi biri eksikse CURL API etkinleştirilmez.

## Gelişmiş Kullanım

Proxy kullanıyorsanız, proxy yapılandırmanıza aşağıdaki kuralları ekleyebilirsiniz. Bu yapılandırma hem gerçek IP'nizi hem de proxy kullanırken görünen IP'nizi kontrol etmenizi sağlar:

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

## Atıf

ElinksNet, Elinks tarafından sürdürülmektedir.

ElinksNet, Jason Ng tarafından geliştirilen MyIP projesine dayanmaktadır ve MIT lisansı altında kalmaya devam eder. Orijinal telif hakkı bildirimi, MIT lisansının gerektirdiği şekilde `LICENSE` dosyasında korunmaktadır.

Ek değişiklikler Copyright (c) 2026 Elinks.
