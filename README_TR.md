# ElinksNet - IP ve Ağ Araç Kutusu

<div align="center">

![ElinksNet Logo](public/logos/elinks-logo.png)

![GitHub Repo stars](https://img.shields.io/github/stars/ElinksTeam/ElinksNet)
![GitHub forks](https://img.shields.io/github/forks/ElinksTeam/ElinksNet)
![Docker Pulls](https://img.shields.io/docker/pulls/elinksteam/elinksnet)
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

## Kurulum

### Node ortamı

```bash
git clone https://github.com/ElinksTeam/ElinksNet.git
cd ElinksNet
npm install && npm run build
npm start
```

Varsayılan port: `18966`.

### Docker

```bash
docker run -d -p 18966:18966 --name elinksnet --restart always elinksteam/elinksnet:latest
```

## Ortam değişkenleri

ElinksNet, IP coğrafi konumu ve ASN bilgileri için MaxMind GeoLite2 veritabanlarını kullanır. MaxMind dosyaları lisans nedeniyle bu depoda dağıtılmaz.

Docker ile tam işlevsellik için aşağıdaki değişkenleri ayarlayın:

```bash
MAXMIND_ACCOUNT_ID="your-account-id"
MAXMIND_LICENSE_KEY="your-license-key"
MAXMIND_AUTO_UPDATE="true"
```

Manuel kurulumda `GeoLite2-City.mmdb` ve `GeoLite2-ASN.mmdb` dosyalarını `common/maxmind-db/` dizinine yerleştirebilirsiniz.

## Atıf

ElinksNet, ElinksTeam tarafından sürdürülmektedir.

ElinksNet, Jason Ng tarafından geliştirilen MyIP projesine dayanmaktadır ve MIT lisansı altında kalmaya devam eder. Orijinal telif hakkı bildirimi, MIT lisansının gerektirdiği şekilde `LICENSE` dosyasında korunmaktadır.

Ek değişiklikler Copyright (c) 2026 ElinksTeam.
