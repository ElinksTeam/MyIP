<template>
  <div class="flex flex-wrap gap-2">
    <Button variant="outline" class="gap-2" @click="createShareImage">
      <ImageDown class="size-4" /> {{ copy.actions.share }}
    </Button>
    <Button variant="outline" class="gap-2" @click="exportReport">
      <FileDown class="size-4" /> {{ copy.actions.export }}
    </Button>
  </div>
</template>

<script setup>
import { FileDown, ImageDown } from 'lucide-vue-next';
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
    isp: card.isp || '',
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

function createShareImage() {
  const data = report();
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#07111f');
  gradient.addColorStop(1, '#0d3b66');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 28px sans-serif';
  ctx.fillText('ELINKS NETWORK LAB', 72, 82);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 54px sans-serif';
  ctx.fillText(copy.value.actions.reportTitle, 72, 160);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px sans-serif';
  ctx.fillText(new Date().toLocaleString(), 72, 206);
  const cards = data.cards.slice(0, 4);
  cards.forEach((card, index) => {
    const y = 270 + index * 74;
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(72, y - 42, 1056, 58);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 22px monospace';
    ctx.fillText(card.ip, 94, y - 5);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`${card.source} · ${card.country || '—'} · ${card.isp || '—'}`.slice(0, 80), 450, y - 5);
  });
  ctx.fillStyle = '#38bdf8';
  ctx.font = '20px sans-serif';
  ctx.fillText(window.location.host, 72, 590);
  canvas.toBlob(blob => blob && download(blob, `elinksnet-share-${Date.now()}.png`), 'image/png');
}
</script>
