<template>
  <Card class="mb-6 overflow-hidden border-sky-500/20 shadow-xs">
    <CardContent class="p-5 sm:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-2xl">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span class="flex size-9 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Sparkles class="size-4.5" />
            </span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-semibold">Elinks AI</h2>
                <Badge variant="outline">{{ copy.badge }}</Badge>
              </div>
              <p class="text-xs text-muted-foreground">{{ copy.subtitle }}</p>
            </div>
          </div>
          <p class="text-sm leading-6 text-muted-foreground">{{ copy.description }}</p>
          <p class="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
            <LockKeyhole class="mt-0.5 size-3.5 shrink-0 text-success" />
            {{ copy.privacy }}
          </p>
        </div>

        <Button class="shrink-0 gap-2" :disabled="loading" @click="generate">
          <LoaderCircle v-if="loading" class="size-4 animate-spin" />
          <Sparkles v-else class="size-4" />
          {{ loading ? copy.loading : copy.button }}
        </Button>
      </div>

      <div v-if="suggestions.length" class="mt-5 grid gap-3 sm:grid-cols-2">
        <div v-for="(item, index) in suggestions" :key="`${item.title}-${index}`"
          class="rounded-md border bg-muted/30 p-3.5">
          <div class="mb-1 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck class="size-4 text-success" />
            {{ item.title }}
          </div>
          <p class="text-xs leading-5 text-muted-foreground">{{ item.detail }}</p>
        </div>
      </div>

      <p v-if="notice" class="mt-4 text-xs text-muted-foreground">{{ notice }}</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMainStore } from '@/store';
import { useProductCopy } from '@/composables/use-product-copy.js';
import { Sparkles, LockKeyhole, LoaderCircle, ShieldCheck } from 'lucide-vue-next';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const store = useMainStore();
const loading = ref(false);
const suggestions = ref([]);
const notice = ref('');
const productCopy = useProductCopy();

const COPY = {
  zh: {
    badge: '安全建议', subtitle: '轻量、隐私优先的网络助手',
    description: '生成易执行的网络与浏览器安全建议，帮助你更好地理解检测结果。',
    privacy: '只发送界面语言，不发送 IP、位置、浏览器指纹或检测结果。',
    button: '生成安全建议', loading: '正在分析…',
    fallback: 'AI 接口暂不可用，已显示 Elinks 本地安全建议。',
    local: [
      ['检查 DNS 与 WebRTC', '使用下方检测确认代理或 VPN 没有泄漏真实网络信息。'],
      ['保持浏览器更新', '及时安装安全更新，并删除不再使用或来源不明的扩展。'],
      ['保护路由器', '修改默认管理密码，启用 WPA2/WPA3，并定期更新固件。'],
      ['警惕钓鱼链接', '登录前核对域名，不在陌生页面输入密码或验证码。'],
    ],
  },
  en: {
    badge: 'Safety advice', subtitle: 'A lightweight, privacy-first network assistant',
    description: 'Generate practical network and browser safety guidance to better understand your checks.',
    privacy: 'Only your interface language is sent—never your IP, location, fingerprint, or test results.',
    button: 'Generate safety advice', loading: 'Analyzing…',
    fallback: 'The AI service is unavailable, so Elinks local safety advice is shown.',
    local: [
      ['Check DNS and WebRTC', 'Use the checks below to confirm your proxy or VPN is not leaking network details.'],
      ['Keep browsers updated', 'Install security updates and remove extensions you no longer use or trust.'],
      ['Protect your router', 'Change default credentials, use WPA2/WPA3, and keep firmware current.'],
      ['Watch for phishing', 'Verify the domain before signing in and never share passwords or verification codes.'],
    ],
  },
  fr: {
    badge: 'Conseils sécurité', subtitle: 'Un assistant réseau léger et privé',
    description: 'Générez des conseils pratiques pour mieux comprendre vos contrôles réseau.',
    privacy: 'Seule la langue est envoyée, jamais votre IP, position, empreinte ou résultats.',
    button: 'Générer des conseils', loading: 'Analyse…',
    fallback: 'Le service IA est indisponible. Les conseils locaux Elinks sont affichés.',
    local: [
      ['Vérifiez DNS et WebRTC', 'Confirmez que votre proxy ou VPN ne divulgue pas de données réseau.'],
      ['Mettez le navigateur à jour', 'Installez les correctifs et supprimez les extensions non fiables.'],
      ['Protégez le routeur', 'Changez les identifiants, utilisez WPA2/WPA3 et actualisez le micrologiciel.'],
      ['Évitez le phishing', 'Vérifiez le domaine avant de vous connecter ou de saisir un code.'],
    ],
  },
  tr: {
    badge: 'Güvenlik önerileri', subtitle: 'Hafif ve gizlilik odaklı ağ asistanı',
    description: 'Ağ kontrollerinizi anlamak için uygulanabilir güvenlik önerileri oluşturun.',
    privacy: 'Yalnızca arayüz dili gönderilir; IP, konum, parmak izi ve sonuçlar gönderilmez.',
    button: 'Güvenlik önerisi oluştur', loading: 'Analiz ediliyor…',
    fallback: 'AI hizmeti kullanılamıyor; Elinks yerel güvenlik önerileri gösteriliyor.',
    local: [
      ['DNS ve WebRTC’yi kontrol edin', 'Proxy veya VPN’in ağ bilgilerini sızdırmadığını doğrulayın.'],
      ['Tarayıcıyı güncel tutun', 'Güvenlik güncellemelerini kurun ve güvenilmeyen eklentileri kaldırın.'],
      ['Yönlendiriciyi koruyun', 'Varsayılan parolayı değiştirin, WPA2/WPA3 kullanın ve yazılımı güncelleyin.'],
      ['Kimlik avına dikkat edin', 'Giriş yapmadan önce alan adını kontrol edin ve kod paylaşmayın.'],
    ],
  },
};

const copy = computed(() => ({
  ...(COPY[store.lang] || COPY.en),
  ...productCopy.value.ai,
}));

async function generate() {
  loading.value = true;
  notice.value = '';
  try {
    const response = await fetch('/api/ai/security-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: store.lang }),
    });
    if (!response.ok) throw new Error('AI unavailable');
    const data = await response.json();
    suggestions.value = data.suggestions;
  } catch {
    suggestions.value = copy.value.local.map(([title, detail]) => ({ title, detail }));
    notice.value = copy.value.fallback;
  } finally {
    loading.value = false;
  }
}
</script>
