<template>
  <div class="my-5 space-y-5">
    <div class="rounded-xl border bg-muted/25 p-4">
      <p class="text-sm leading-6 text-muted-foreground">{{ copy.description }}</p>
      <div class="mt-4 flex gap-2">
        <Input v-model="query" data-1p-ignore :placeholder="copy.placeholder"
          :disabled="loading" @keyup.enter="lookup" />
        <Button variant="action" :disabled="loading || !query.trim()" @click="lookup">
          <Spinner v-if="loading" />
          <Search v-else class="size-4" />
          <span class="hidden sm:inline">{{ copy.search }}</span>
        </Button>
      </div>
      <p v-if="error" class="mt-2 text-sm text-destructive">{{ error }}</p>
    </div>

    <template v-if="result">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="item in summary" :key="item.label" class="rounded-lg border bg-card p-3">
          <p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{{ item.label }}</p>
          <p class="mt-1 break-words text-sm font-medium">{{ item.value || '—' }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-xl border bg-card">
        <div class="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p class="text-sm font-semibold">{{ copy.raw }}</p>
            <p class="text-xs text-muted-foreground">{{ result.source }}</p>
          </div>
          <Badge variant="secondary">{{ result.type.toUpperCase() }}</Badge>
        </div>
        <pre class="max-h-[520px] overflow-auto p-4 text-xs leading-5">{{ JSON.stringify(result.data, null, 2) }}</pre>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMainStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Search } from 'lucide-vue-next';

const store = useMainStore();
const query = ref('');
const result = ref(null);
const loading = ref(false);
const error = ref('');
const COPY = {
  zh: { description: '使用标准 RDAP 查询域名、IP 地址和自治系统注册数据。无需 API Key。', placeholder: 'example.com、1.1.1.1 或 AS13335', search: '查询', raw: 'RDAP 原始数据', handle: '注册标识', name: '名称', range: '资源范围', status: '状态' },
  en: { description: 'Query structured registration data for domains, IP addresses, and autonomous systems with keyless RDAP.', placeholder: 'example.com, 1.1.1.1, or AS13335', search: 'Lookup', raw: 'Raw RDAP data', handle: 'Handle', name: 'Name', range: 'Resource range', status: 'Status' },
  fr: { description: 'Interrogez les données RDAP des domaines, IP et systèmes autonomes sans clé API.', placeholder: 'example.com, 1.1.1.1 ou AS13335', search: 'Rechercher', raw: 'Données RDAP', handle: 'Identifiant', name: 'Nom', range: 'Plage', status: 'Statut' },
  tr: { description: 'Alan adı, IP ve otonom sistem kayıtlarını anahtarsız RDAP ile sorgulayın.', placeholder: 'example.com, 1.1.1.1 veya AS13335', search: 'Sorgula', raw: 'Ham RDAP verisi', handle: 'Kayıt', name: 'Ad', range: 'Kaynak aralığı', status: 'Durum' },
};
const copy = computed(() => COPY[store.lang] || COPY.en);
const summary = computed(() => {
  const data = result.value?.data || {};
  const range = data.startAddress && data.endAddress
    ? `${data.startAddress} – ${data.endAddress}`
    : data.startAutnum && data.endAutnum ? `AS${data.startAutnum} – AS${data.endAutnum}` : data.ldhName;
  return [
    { label: copy.value.handle, value: data.handle },
    { label: copy.value.name, value: data.name || data.ldhName },
    { label: copy.value.range, value: range },
    { label: copy.value.status, value: Array.isArray(data.status) ? data.status.join(', ') : data.status },
  ];
});

async function lookup() {
  if (!query.value.trim() || loading.value) return;
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    const response = await fetch(`/api/rdap?query=${encodeURIComponent(query.value.trim())}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || copy.value.search);
    result.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
