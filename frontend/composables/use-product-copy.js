import { computed } from 'vue';
import { useMainStore } from '@/store';

const COPY = {
  zh: {
    workspace: { diagnostics: '网络诊断', diagnosticsNote: '链路、延迟、路由与解析', intelligence: '情报与安全', intelligenceNote: '归属、封锁、设备与隐私', tools: '工具', live: '实时工作区', ready: '全天候', local: '隐私优先' },
    api: { description: '同域公共 API，无需注册或 API Key。', noKey: '免 Key', copy: '复制命令', ip: '查询当前 IP', ipv4: '强制 IPv4', ipv6: '强制 IPv6', json: 'JSON 格式', geo: '查询当前 IP 地理信息', target: '查询指定 IP', docs: '完整 CLI 文档' },
    ai: { badge: 'Groq 安全建议', subtitle: '快速、隐私优先的网络助手', description: '生成可执行的网络与浏览器安全建议。', privacy: '仅发送界面语言，不发送 IP、位置、浏览器指纹或检测结果。', button: '生成安全建议', loading: '正在分析…', fallback: 'Groq 暂不可用，已显示 Elinks 本地安全建议。' },
    actions: { share: '生成分享图', export: '导出检测报告', saved: '已生成', reportTitle: 'ElinksNet 网络检测报告' },
    proxy: { title: '代理与质量', proxy: '代理状态', quality: 'IP 质量', unknown: '待检测', loading: '检测中…', unavailable: '暂不可用' },
    pages: { cliTitle: 'CLI 与同域 API', cliNote: '无需 Key、带平台限流的命令行接口。', dockerTitle: 'Docker 一键部署', dockerNote: '使用 Docker Compose 在自己的服务器运行 ElinksNet。', back: '返回控制台', copy: '复制', copied: '已复制', deploy: '开始部署' },
  },
  en: {
    workspace: { diagnostics: 'Network diagnostics', diagnosticsNote: 'Routes, latency, policy and DNS', intelligence: 'Intelligence & security', intelligenceNote: 'Ownership, filtering, devices and privacy', tools: 'Tools', live: 'Live workspace', ready: 'Always on', local: 'Privacy-first' },
    api: { description: 'Same-origin public API. No signup or API key.', noKey: 'No key', copy: 'Copy command', ip: 'Current IP', ipv4: 'Force IPv4', ipv6: 'Force IPv6', json: 'JSON format', geo: 'Current IP geolocation', target: 'Look up an IP', docs: 'Full CLI documentation' },
    ai: { badge: 'Groq safety advice', subtitle: 'Fast, privacy-first network assistant', description: 'Generate practical network and browser guidance.', privacy: 'Only the interface language is sent—never your IP, location, fingerprint, or results.', button: 'Generate advice', loading: 'Analyzing…', fallback: 'Groq is unavailable, so local Elinks advice is shown.' },
    actions: { share: 'Create share image', export: 'Export report', saved: 'Generated', reportTitle: 'ElinksNet network report' },
    proxy: { title: 'Proxy & quality', proxy: 'Proxy status', quality: 'IP quality', unknown: 'Pending', loading: 'Checking…', unavailable: 'Unavailable' },
    pages: { cliTitle: 'CLI and same-origin API', cliNote: 'Keyless command-line endpoints with platform rate limiting.', dockerTitle: 'One-click Docker deployment', dockerNote: 'Run ElinksNet on your own server with Docker Compose.', back: 'Back to dashboard', copy: 'Copy', copied: 'Copied', deploy: 'Deploy now' },
  },
  fr: {
    workspace: { diagnostics: 'Diagnostic réseau', diagnosticsNote: 'Routes, latence, règles et DNS', intelligence: 'Renseignement et sécurité', intelligenceNote: 'Propriété, filtrage, appareils et confidentialité', tools: 'Outils', live: 'Espace en direct', ready: 'Toujours prêt', local: 'Confidentiel' },
    api: { description: 'API publique du même domaine, sans clé.', noKey: 'Sans clé', copy: 'Copier', ip: 'IP actuelle', ipv4: 'Forcer IPv4', ipv6: 'Forcer IPv6', json: 'Format JSON', geo: 'Géolocalisation actuelle', target: 'Rechercher une IP', docs: 'Documentation CLI' },
    ai: { badge: 'Conseils Groq', subtitle: 'Assistant réseau rapide et confidentiel', description: 'Transformez un résumé anonyme en conseils pratiques.', privacy: 'Seul un résumé anonyme minimal est envoyé.', button: 'Générer', loading: 'Analyse…', fallback: 'Groq est indisponible. Conseils locaux affichés.' },
    actions: { share: 'Créer une image', export: 'Exporter le rapport', saved: 'Généré', reportTitle: 'Rapport réseau ElinksNet' },
    proxy: { title: 'Proxy et qualité', proxy: 'État du proxy', quality: 'Qualité IP', unknown: 'En attente', loading: 'Analyse…', unavailable: 'Indisponible' },
    pages: { cliTitle: 'CLI et API', cliNote: 'API sans clé avec limitation de débit.', dockerTitle: 'Déploiement Docker', dockerNote: 'Exécutez ElinksNet avec Docker Compose.', back: 'Retour', copy: 'Copier', copied: 'Copié', deploy: 'Déployer' },
  },
  tr: {
    workspace: { diagnostics: 'Ağ tanılama', diagnosticsNote: 'Rota, gecikme, kural ve DNS', intelligence: 'İstihbarat ve güvenlik', intelligenceNote: 'Sahiplik, filtreleme, cihazlar ve gizlilik', tools: 'Araç', live: 'Canlı çalışma alanı', ready: 'Her zaman açık', local: 'Gizlilik odaklı' },
    api: { description: 'Aynı alan adı API’si, anahtar gerekmez.', noKey: 'Anahtarsız', copy: 'Kopyala', ip: 'Geçerli IP', ipv4: 'IPv4 kullan', ipv6: 'IPv6 kullan', json: 'JSON biçimi', geo: 'Geçerli IP konumu', target: 'Bir IP sorgula', docs: 'CLI belgeleri' },
    ai: { badge: 'Groq güvenlik önerileri', subtitle: 'Hızlı ve gizlilik odaklı ağ asistanı', description: 'Anonim kontrol özetini uygulanabilir önerilere dönüştürün.', privacy: 'Yalnızca minimum anonim özet gönderilir.', button: 'Öneri oluştur', loading: 'Analiz ediliyor…', fallback: 'Groq kullanılamıyor; yerel öneriler gösteriliyor.' },
    actions: { share: 'Paylaşım görseli', export: 'Raporu dışa aktar', saved: 'Oluşturuldu', reportTitle: 'ElinksNet ağ raporu' },
    proxy: { title: 'Proxy ve kalite', proxy: 'Proxy durumu', quality: 'IP kalitesi', unknown: 'Bekleniyor', loading: 'Kontrol…', unavailable: 'Kullanılamıyor' },
    pages: { cliTitle: 'CLI ve API', cliNote: 'Anahtarsız ve hız sınırlı komut satırı API’si.', dockerTitle: 'Docker dağıtımı', dockerNote: 'ElinksNet’i Docker Compose ile çalıştırın.', back: 'Panele dön', copy: 'Kopyala', copied: 'Kopyalandı', deploy: 'Dağıt' },
  },
};

export function useProductCopy() {
  const store = useMainStore();
  return computed(() => COPY[store.lang] || COPY.en);
}
