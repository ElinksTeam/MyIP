# ElinksNet 8

ElinksNet; Next.js, React, Tailwind CSS, HeroUI ve shadcn/ui ile geliştirilen çok dilli bir IP istihbaratı ve ağ tanılama platformudur.

Canlı servis: [net.elinks.dev](https://net.elinks.dev)

## Başlıca özellikler

- Anahtarsız 26'ya kadar IP veri kaynağı ve isteğe bağlı kimlik doğrulamalı kaynaklar.
- IP kalite puanı; konut, mobil, veri merkezi, proxy, VPN ve Tor sınıflandırması.
- Alan bazında kaynak şeffaflığı, veri uyumu ve gerçek zamanlı servis durumu.
- IPv4/IPv6, WebRTC, gelişmiş DNS sızıntısı, hız, küresel gecikme, MTR, DNS, RDAP, WHOIS, MAC ve erişilebilirlik testleri.
- İngilizce, Basitleştirilmiş Çince, Japonca ve Tayca arayüz ve yer adı yerelleştirmesi.
- Zaman damgası ve SHA-256 rapor parmak izi içeren paylaşım görselleri.
- Hızlı, Profesyonel ve Derin Analiz modlarına sahip ElinksAI.

## Docker

```bash
docker run -d --name elinksnet --restart unless-stopped \
  -p 18966:18966 elinksteam/elinksnet:8.0.0
```

## İsteğe bağlı değişkenler

`GROQ_API_KEY`, `ELINKS_AI_MODEL`, `ELINKS_AI_FAST_MODEL`, `ELINKS_AI_DEEP_MODEL`, `IPINFO_API_TOKEN`, `IPAPIIS_API_KEY`, `IP2LOCATION_API_KEY` ve `MAC_LOOKUP_API_KEY`.

## Proje kökeni ve lisans

ElinksNet 8, Next.js üzerinde büyük ölçüde yeniden yazılmıştır; ancak depo Jason Ng'nin MyIP projesinden türeyen kodu ve geçmişi korur. Bu nedenle MIT Lisansı kapsamındaki türev bir çalışma olmaya devam eder. Özgün telif hakkı bildirimi `LICENSE` dosyasında korunur.
