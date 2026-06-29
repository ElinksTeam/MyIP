<template>
  <section class="mx-auto max-w-4xl py-6">
    <div class="mb-6">
      <Badge variant="outline" class="mb-3 gap-2"><Terminal class="size-3.5" /> API</Badge>
      <h2 class="text-2xl font-semibold">{{ copy.pages.cliTitle }}</h2>
      <p class="mt-2 text-sm text-muted-foreground">{{ copy.pages.cliNote }}</p>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <Card v-for="item in commands" :key="item.command">
        <CardHeader><CardTitle class="text-sm">{{ item.label }}</CardTitle></CardHeader>
        <CardContent>
          <div class="flex items-center gap-2 rounded-md bg-zinc-950 p-3 text-zinc-100">
            <code class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs">$ {{ item.command }}</code>
            <Button size="icon" variant="ghost" class="size-8 shrink-0 hover:bg-zinc-800" @click="copyCommand(item.command)">
              <Copy class="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <Card class="mt-4">
      <CardHeader><CardTitle class="text-sm">Response fields</CardTitle></CardHeader>
      <CardContent class="grid gap-2 text-sm sm:grid-cols-2">
        <code v-for="field in fields" :key="field" class="rounded bg-muted px-2 py-1">{{ field }}</code>
      </CardContent>
    </Card>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { Copy, Terminal } from 'lucide-vue-next';
import { useProductCopy } from '@/composables/use-product-copy.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const copy = useProductCopy();
const origin = window.location.origin;
const commands = computed(() => [
  { label: copy.value.api.ip, command: `curl ${origin}/api/cli/ip` },
  { label: copy.value.api.json, command: `curl "${origin}/api/cli/ip?format=json"` },
  { label: copy.value.api.geo, command: `curl ${origin}/api/cli/geo` },
  { label: copy.value.api.target, command: `curl "${origin}/api/cli/geo?ip=8.8.8.8"` },
]);
const fields = ['ip', 'city', 'region', 'country_code', 'latitude', 'longitude', 'asn', 'org', 'source'];
const copyCommand = command => navigator.clipboard.writeText(command);
</script>
