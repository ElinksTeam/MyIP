<template>
  <aside
    class="dashboard-sidebar sticky top-0 h-screen w-64 shrink-0 flex-col border-r bg-background"
    aria-label="Dashboard navigation"
  >
    <!-- Product identity -->
    <div class="flex h-16 items-center border-b px-5">
      <button
        type="button"
        class="flex items-center gap-2.5 rounded-md text-left transition-opacity hover:opacity-80"
        @click="handleBrandClick"
      >
        <span class="flex size-9 items-center justify-center rounded-lg border bg-card shadow-xs">
          <BrandIcon />
        </span>
        <span class="min-w-0">
          <span class="block text-base font-semibold tracking-tight">
            Elinks<span class="font-light">Net</span>
          </span>
          <span class="block text-[11px] text-muted-foreground">{{ t('additional.OpenSourceNote') }}</span>
        </span>
      </button>
    </div>

    <!-- Primary dashboard navigation -->
    <div class="flex-1 overflow-y-auto px-3 py-5">
      <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {{ t('nav.Navigation') }}
      </p>
      <nav class="space-y-1">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          :class="navItemClass(item.id)"
          @click="scrollToSection(item.id)"
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span class="truncate">{{ t(`nav.${item.id}`) }}</span>
          <span
            v-if="currentSection === item.id"
            class="ml-auto size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        </button>
      </nav>
    </div>

    <!-- Project shortcuts -->
    <div class="border-t p-3">
      <div class="rounded-lg border bg-muted/30 p-2">
        <a
          :href="t('page.footerLink')"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Github class="size-4" />
          <span class="flex-1">{{ t('additional.OpenSource') }}</span>
          <ExternalLink class="size-3.5 text-muted-foreground" />
        </a>
        <a
          href="https://hub.docker.com/r/elinksteam/elinksnet"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Container class="size-4" />
          <span class="flex-1">{{ t('additional.Docker') }}</span>
          <ExternalLink class="size-3.5 text-muted-foreground" />
        </a>
      </div>
      <p class="mb-0 mt-3 px-2 text-[11px] text-muted-foreground">
        © 2026 Elinks
      </p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/store';
import {
  Activity,
  Container,
  ExternalLink,
  Gauge,
  Github,
  Network,
  Radio,
  ScanSearch,
  ShieldCheck,
} from 'lucide-vue-next';
import BrandIcon from './svgicons/Brand.vue';

const { t } = useI18n();
const store = useMainStore();
const currentSection = computed(() => store.currentSection);

const navItems = [
  { id: 'IPInfo', icon: ScanSearch },
  { id: 'Connectivity', icon: Network },
  { id: 'WebRTC', icon: Radio },
  { id: 'DNSLeakTest', icon: ShieldCheck },
  { id: 'SpeedTest', icon: Gauge },
  { id: 'AdvancedTools', icon: Activity },
];

const navItemClass = (id) => [
  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
  id === currentSection.value
    ? 'bg-accent text-accent-foreground'
    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
];

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (!element) return;
  store.changeSection(id);
  const y = element.getBoundingClientRect().top + window.scrollY - 78;
  window.scrollTo({ top: y, behavior: 'smooth' });
};

const handleBrandClick = () => {
  if (window.scrollY === 0) {
    store.setRefreshEveryThing(true);
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>
