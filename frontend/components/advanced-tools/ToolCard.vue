<template>
  <Card class="keyboard-shortcut-card jn-card group relative cursor-pointer overflow-hidden border-border/70 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md data-[keyboard-hover=true]:ring-2 data-[keyboard-hover=true]:ring-primary/50"
    role="button" tabindex="0" @click="$emit('open')" @keydown.enter.prevent="$emit('open')"
    @keydown.space.prevent="$emit('open')">
    <CardContent class="p-4">
      <div class="mb-5 flex items-start justify-between gap-3">
        <span class="flex size-10 items-center justify-center rounded-lg border bg-muted/60 transition-colors group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:text-primary">
          <component :is="icon" class="size-5" />
        </span>
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{{ code }}</span>
      </div>
      <div class="flex items-end justify-between gap-3">
        <div class="min-w-0">
          <h4 class="text-base font-semibold">{{ title }}</h4>
          <p class="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{{ note }}</p>
        </div>
        <ArrowUpRight class="mb-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ArrowUpRight } from 'lucide-vue-next';
import { Card, CardContent } from '@/components/ui/card';

defineProps({
  icon: { type: [Object, Function], required: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String, required: true },
});
defineEmits(['open']);
</script>
