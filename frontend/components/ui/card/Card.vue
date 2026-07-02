<script setup>
import { cn } from '@/lib/utils';

defineProps({
  class: { type: [String, Array, Object], default: undefined },
});
</script>

<template>
  <div
    :class="cn('rounded-xl border border-border/60 bg-card text-card-foreground shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_24px_rgb(15_23_42_/_0.04)]', $props.class)"
  >
    <slot />
  </div>
</template>
