<template>
  <section class="mb-6" aria-label="ElinksNet product modules">
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">ElinksNet</p>
        <h2 class="mt-1 text-lg font-semibold tracking-tight">{{ copy.title }}</h2>
      </div>
      <span class="hidden text-xs text-muted-foreground sm:block">{{ copy.hint }}</span>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <button v-for="item in products" :key="item.target" type="button"
        class="group rounded-lg border bg-card p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="goTo(item.target)">
        <span class="mb-3 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <component :is="item.icon" class="size-4.5" />
        </span>
        <span class="block text-sm font-semibold">{{ item.title }}</span>
        <span class="mt-1 block text-xs leading-5 text-muted-foreground">{{ item.description }}</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useMainStore } from '@/store';
import { Fingerprint, Gauge, ShieldCheck, Wrench } from 'lucide-vue-next';

const store = useMainStore();
const COPY = {
  zh: {
    title: '按需求选择检测工具', hint: '点击模块快速开始',
    identity: ['网络身份', '查看公网 IP、位置和网络运营商'],
    privacy: ['隐私检测', '检查 WebRTC 与 DNS 泄漏风险'],
    performance: ['连接质量', '测试网站连通性与网络速度'],
    toolbox: ['专业工具', '使用 DNS、WHOIS、延迟和 MTR 工具'],
  },
  en: {
    title: 'Choose a tool by goal', hint: 'Select a module to get started',
    identity: ['Network identity', 'Review your public IP, location, and network'],
    privacy: ['Privacy checks', 'Check for WebRTC and DNS leak risks'],
    performance: ['Connection quality', 'Test reachability and network speed'],
    toolbox: ['Professional tools', 'Use DNS, WHOIS, latency, and MTR tools'],
  },
  fr: {
    title: 'Choisissez un outil par objectif', hint: 'Sélectionnez un module',
    identity: ['Identité réseau', 'Vérifiez votre IP publique et votre réseau'],
    privacy: ['Contrôles de confidentialité', 'Testez les fuites WebRTC et DNS'],
    performance: ['Qualité de connexion', 'Testez l’accessibilité et le débit'],
    toolbox: ['Outils professionnels', 'Utilisez DNS, WHOIS, latence et MTR'],
  },
  tr: {
    title: 'Amacınıza göre araç seçin', hint: 'Başlamak için bir modül seçin',
    identity: ['Ağ kimliği', 'Genel IP, konum ve ağ bilgilerinizi görün'],
    privacy: ['Gizlilik kontrolleri', 'WebRTC ve DNS sızıntı risklerini kontrol edin'],
    performance: ['Bağlantı kalitesi', 'Erişilebilirlik ve ağ hızını test edin'],
    toolbox: ['Profesyonel araçlar', 'DNS, WHOIS, gecikme ve MTR araçlarını kullanın'],
  },
};

const copy = computed(() => COPY[store.lang] || COPY.en);
const products = computed(() => [
  { target: 'IPInfo', icon: Fingerprint, title: copy.value.identity[0], description: copy.value.identity[1] },
  { target: 'WebRTC', icon: ShieldCheck, title: copy.value.privacy[0], description: copy.value.privacy[1] },
  { target: 'Connectivity', icon: Gauge, title: copy.value.performance[0], description: copy.value.performance[1] },
  { target: 'AdvancedTools', icon: Wrench, title: copy.value.toolbox[0], description: copy.value.toolbox[1] },
]);

function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>
