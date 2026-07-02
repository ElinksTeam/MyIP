<template>
  <div class="flex flex-wrap gap-2">
    <Button variant="outline" class="gap-2" @click="exportReport">
      <FileDown class="size-4" /> {{ copy.actions.export }}
    </Button>
  </div>
</template>

<script setup>
import { FileDown } from 'lucide-vue-next';
import { useProductCopy } from '@/composables/use-product-copy.js';
import { Button } from '@/components/ui/button';

const props = defineProps({
  getCards: { type: Function, required: true },
});
const copy = useProductCopy();

function report() {
  const cards = (props.getCards() || []).filter(card => card.ip).map(card => ({
    source: card.source,
    ip: card.ip,
    country: card.country_name || '',
    region: card.region || '',
    city: card.city || '',
    district: card.district || '',
    postalCode: card.postalCode || '',
    timezone: card.timezone || '',
    coordinates: card.latitude && card.longitude ? [card.latitude, card.longitude] : null,
    isp: card.isp || '',
    networkOrganization: card.networkOrganization || '',
    asn: card.asn || '',
    proxy: card.isProxy || 'unknown',
    qualityScore: card.qualityScore ?? 'unknown',
  }));
  return {
    product: 'ElinksNet',
    generatedAt: new Date().toISOString(),
    url: window.location.origin,
    cards,
  };
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportReport() {
  const data = JSON.stringify(report(), null, 2);
  download(new Blob([data], { type: 'application/json' }), `elinksnet-report-${Date.now()}.json`);
}

</script>
