<template>
  <section class="mx-auto max-w-4xl py-6">
    <Badge variant="outline" class="mb-3 gap-2"><Container class="size-3.5" /> Docker</Badge>
    <h2 class="text-2xl font-semibold">{{ copy.pages.dockerTitle }}</h2>
    <p class="mt-2 text-sm text-muted-foreground">{{ copy.pages.dockerNote }}</p>
    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <Card v-for="(step, index) in steps" :key="step.title">
        <CardHeader>
          <Badge variant="secondary" class="mb-2 w-fit">{{ index + 1 }}</Badge>
          <CardTitle class="text-base">{{ step.title }}</CardTitle>
          <CardDescription>{{ step.note }}</CardDescription>
        </CardHeader>
      </Card>
    </div>
    <Card class="mt-4">
      <CardHeader><CardTitle class="text-sm">docker-compose.yml</CardTitle></CardHeader>
      <CardContent>
        <pre class="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">{{ compose }}</pre>
        <div class="mt-3 flex flex-wrap gap-2">
          <Button class="gap-2" @click="copyCompose"><Copy class="size-4" /> {{ copied ? copy.pages.copied : copy.pages.copy }}</Button>
          <Button variant="outline" as-child><a href="https://hub.docker.com/r/elinksteam/elinksnet" target="_blank" rel="noopener">Docker Hub <ExternalLink class="ml-2 size-4" /></a></Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { Container, Copy, ExternalLink } from 'lucide-vue-next';
import { useProductCopy } from '@/composables/use-product-copy.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const copy = useProductCopy();
const copied = ref(false);
const steps = [
  { title: 'Install Docker', note: 'Docker Engine 24+ and Compose v2.' },
  { title: 'Create Compose file', note: 'Copy the production-ready definition below.' },
  { title: 'Start ElinksNet', note: 'Run docker compose up -d and open port 18966.' },
];
const compose = `services:
  elinksnet:
    image: elinksteam/elinksnet:latest
    container_name: elinksnet
    restart: unless-stopped
    ports:
      - "18966:18966"
    environment:
      - FRONTEND_PORT=18966
      - GROQ_API_KEY=\${GROQ_API_KEY}`;
async function copyCompose() {
  await navigator.clipboard.writeText(compose);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1600);
}
</script>
