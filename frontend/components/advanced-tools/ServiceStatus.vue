<template>
  <div class="my-5 space-y-5">
    <div class="flex flex-col gap-3 rounded-xl border bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="size-2.5 rounded-full" :class="overallClass" />
          <h3 class="text-lg font-semibold">{{ copy.title }}</h3>
        </div>
        <p class="mt-1 text-sm text-muted-foreground">{{ copy.description }}</p>
      </div>
      <Button variant="outline" class="gap-2" :disabled="loading" @click="runChecks">
        <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
        {{ copy.refresh }}
      </Button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="service in services" :key="service.id"
        class="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-full" :class="tone(service.status)" />
            <p class="truncate text-sm font-semibold">{{ service.name }}</p>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">{{ service.note }}</p>
        </div>
        <div class="text-right">
          <Badge :variant="service.status === 'online' ? 'secondary' : 'outline'">
            {{ label(service.status) }}
          </Badge>
          <p v-if="service.latency !== null" class="mt-1 font-mono text-[11px] text-muted-foreground">
            {{ service.latency }} ms
          </p>
        </div>
      </div>
    </div>
    <p class="text-xs text-muted-foreground">{{ copy.updated }} {{ updatedAt || '—' }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useMainStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-vue-next';

const store = useMainStore();
const loading = ref(false);
const updatedAt = ref('');
const services = ref([
  { id: 'core', name: 'ElinksNet Core API', note: '/api/cli/ip', url: '/api/cli/ip?format=json', status: 'checking', latency: null },
  { id: 'rdap', name: 'RDAP Registry', note: 'IANA bootstrap via RDAP.org', url: '/api/rdap?query=example.com', status: 'checking', latency: null },
  { id: 'ipinfo', name: 'IPinfo Lite', note: 'Country and ASN intelligence', url: '/api/ipinfo?ip=8.8.8.8', status: 'checking', latency: null },
  { id: 'ipapiis', name: 'IPAPI.is', note: 'Proxy and hosting intelligence', url: '/api/ipapiis?ip=1.1.1.1', status: 'checking', latency: null },
  { id: 'ip2location', name: 'IP2Location', note: 'IPv4 and IPv6 geolocation', url: '/api/ip2location?ip=8.8.8.8', status: 'checking', latency: null },
  { id: 'ai', name: 'Elinks AI / Groq', note: 'Interactive diagnostics assistant', config: 'elinksAi', status: 'checking', latency: null },
]);
const COPY = {
  zh: { title: '服务运行状态', description: '实时检查 ElinksNet 核心服务和上游数据源。', refresh: '重新检测', online: '在线', offline: '异常', checking: '检测中', updated: '最近检测：' },
  en: { title: 'Service status', description: 'Live health checks for ElinksNet services and upstream data providers.', refresh: 'Run checks', online: 'Operational', offline: 'Degraded', checking: 'Checking', updated: 'Last checked:' },
  fr: { title: 'État des services', description: 'Vérification des services ElinksNet et des fournisseurs.', refresh: 'Vérifier', online: 'Opérationnel', offline: 'Dégradé', checking: 'Analyse', updated: 'Dernier contrôle :' },
  tr: { title: 'Servis durumu', description: 'ElinksNet servisleri ve veri sağlayıcıları için canlı kontroller.', refresh: 'Kontrol et', online: 'Çalışıyor', offline: 'Sorunlu', checking: 'Kontrol', updated: 'Son kontrol:' },
};
const copy = computed(() => COPY[store.lang] || COPY.en);
const overallClass = computed(() =>
  services.value.some(item => item.status === 'offline') ? 'bg-warning' :
  services.value.every(item => item.status === 'online') ? 'bg-success' : 'bg-muted-foreground'
);
const tone = status => status === 'online' ? 'bg-success' : status === 'offline' ? 'bg-destructive' : 'bg-muted-foreground animate-pulse';
const label = status => copy.value[status] || copy.value.checking;

async function runChecks() {
  loading.value = true;
  services.value.forEach(service => {
    service.status = 'checking';
    service.latency = null;
  });
  await Promise.all(services.value.map(async service => {
    if (service.config) {
      service.status = store.configs?.[service.config] ? 'online' : 'offline';
      return;
    }
    const started = performance.now();
    try {
      const response = await fetch(service.url, { cache: 'no-store' });
      service.latency = Math.round(performance.now() - started);
      service.status = response.ok ? 'online' : 'offline';
    } catch {
      service.status = 'offline';
    }
  }));
  updatedAt.value = new Date().toLocaleString();
  loading.value = false;
}

onMounted(runChecks);
</script>
