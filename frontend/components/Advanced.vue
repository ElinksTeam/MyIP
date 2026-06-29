<template>
  <section class="advanced-tools-section mb-10">
    <div class="mb-5 overflow-hidden rounded-xl border bg-card shadow-sm">
      <div class="relative p-5 sm:p-6">
        <div class="advanced-grid-pattern absolute inset-y-0 right-0 hidden w-2/5 opacity-50 lg:block" />
        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <Badge variant="outline" class="mb-3 gap-1.5 bg-background/70">
              <TerminalSquare class="size-3.5 text-primary" />
              Elinks Network Lab
            </Badge>
            <h2 id="AdvancedTools" class="m-0 text-2xl font-semibold tracking-tight md:text-3xl">
              {{ t('advancedtools.Title') }}
            </h2>
            <p class="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{{ t('advancedtools.Note') }}</p>
          </div>
          <div class="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div v-for="metric in workspaceMetrics" :key="metric.label"
              class="rounded-lg border bg-background/70 px-3 py-2.5">
              <p class="font-mono text-lg font-semibold">{{ metric.value }}</p>
              <p class="text-[11px] text-muted-foreground">{{ metric.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-for="group in toolGroups" :key="group.id" class="mb-6">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <component :is="group.icon" class="size-4 text-muted-foreground" />
          <h3 class="text-sm font-semibold">{{ group.title }}</h3>
          <Badge variant="secondary" class="font-mono text-[10px]">{{ group.cards.length }}</Badge>
        </div>
        <span class="hidden text-xs text-muted-foreground sm:block">{{ group.note }}</span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ToolCard v-for="(card, index) in group.cards" :key="card.path" :data-adv-path="card.path"
          :icon="card.icon" :code="`LAB-${String(index + 1).padStart(2, '0')}`"
          :title="t(card.titleKey)" :note="t(card.noteKey)"
          @open="navigateAndToggleOffcanvas(card.path)" />
      </div>
    </div>

    <Drawer :open="isOpen" @update:open="onOpenChange" :dismissible="true">
      <DrawerContent :title="activeCard ? t(activeCard.titleKey) : t('advancedtools.Title')"
        :class="['jn-tools-drawer overflow-hidden', (isMobile || isFullScreen) ? 'h-full rounded-none' : 'h-[88vh]']">
        <div class="flex items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur shrink-0">
          <span v-if="activeCard" class="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/60">
            <component :is="activeCard.icon" class="size-4.5" />
          </span>
          <div v-if="activeCard" class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="truncate text-sm font-semibold md:text-base">{{ t(activeCard.titleKey) }}</span>
              <Badge variant="outline" class="hidden text-[10px] sm:inline-flex">{{ workspaceCopy.live }}</Badge>
            </div>
            <p class="truncate text-[11px] text-muted-foreground">{{ t(activeCard.noteKey) }}</p>
          </div>
          <span v-else class="flex-1" />
          <button v-if="!isMobile" type="button"
            class="rounded-md border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            @click="fullScreen" :aria-label="isFullScreen ? 'Exit full screen' : 'Full screen'">
            <Maximize v-if="!isFullScreen" class="size-4" />
            <Minimize v-else class="size-4" />
          </button>
          <DrawerClose @click="resetNavigatorURL()"
            class="rounded-md border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
        </div>

        <div class="tool-rail flex shrink-0 gap-1.5 overflow-x-auto border-b bg-muted/20 px-3 py-2">
          <button v-for="card in enabledCards" :key="card.path" type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors"
            :class="card.path === router.currentRoute.value.path ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
            @click="navigateAndToggleOffcanvas(card.path)">
            <component :is="card.icon" class="size-3.5" />
            {{ t(card.titleKey) }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-1 pb-6" ref="scrollContainer">
          <div :class="isMobile ? 'w-full px-3' : 'jn-canvas-width px-6'">
            <router-view />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { trackEvent } from '@/utils/use-analytics';
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer';
import ToolCard from './advanced-tools/ToolCard.vue';
import { useProductCopy } from '@/composables/use-product-copy.js';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Cable, CircleGauge, Container, FileSearch, Fingerprint,
  ListChecks, Maximize, Minimize, MonitorCog, Network, Radar, Route, ServerCog,
  ShieldCheck, TerminalSquare, Waypoints,
} from 'lucide-vue-next';

const { t } = useI18n();
const store = useMainStore();
const router = useRouter();
const isMobile = computed(() => store.isMobile);
const configs = computed(() => store.configs);
const scrollContainer = ref(null);

const cards = reactive([
  { path: '/pingtest', icon: CircleGauge, group: 'diagnostics', titleKey: 'pingtest.Title', noteKey: 'advancedtools.PingTestNote', enabled: true },
  { path: '/mtrtest', icon: Route, group: 'diagnostics', titleKey: 'mtrtest.Title', noteKey: 'advancedtools.MTRTestNote', enabled: true },
  { path: '/ruletest', icon: Waypoints, group: 'diagnostics', titleKey: 'ruletest.Title', noteKey: 'advancedtools.RuleTestNote', enabled: true },
  { path: '/dnsresolver', icon: ServerCog, group: 'diagnostics', titleKey: 'dnsresolver.Title', noteKey: 'advancedtools.DNSResolverNote', enabled: true },
  { path: '/censorshipcheck', icon: Radar, group: 'intelligence', titleKey: 'censorshipcheck.Title', noteKey: 'advancedtools.CensorshipCheck', enabled: true },
  { path: '/whois', icon: FileSearch, group: 'intelligence', titleKey: 'whois.Title', noteKey: 'advancedtools.Whois', enabled: true },
  { path: '/macchecker', icon: Cable, group: 'intelligence', titleKey: 'macchecker.Title', noteKey: 'advancedtools.MacChecker', enabled: true },
  { path: '/browserinfo', icon: MonitorCog, group: 'intelligence', titleKey: 'browserinfo.Title', noteKey: 'advancedtools.BrowserInfo', enabled: true },
  { path: '/securitychecklist', icon: ListChecks, group: 'intelligence', titleKey: 'securitychecklist.Title', noteKey: 'advancedtools.SecurityChecklist', enabled: true },
  { path: '/invisibilitytest', icon: Fingerprint, group: 'intelligence', titleKey: 'invisibilitytest.Title', noteKey: 'advancedtools.InvisibilityTest', enabled: false },
  { path: '/cli', icon: BookOpen, group: 'platform', titleKey: 'curl.Title', noteKey: 'additional.CurlNote', enabled: true },
  { path: '/docker', icon: Container, group: 'platform', titleKey: 'additional.Docker', noteKey: 'additional.DockerNote', enabled: true },
]);

const enabledCards = computed(() => cards.filter(card => card.enabled));
const openedCard = computed(() => store.currentPath.id);
const activeCard = computed(() => openedCard.value >= 0 ? cards[openedCard.value] : null);

const COPY = {
  zh: { diagnostics: '网络诊断', diagnosticsNote: '链路、延迟、路由与解析', intelligence: '情报与安全', intelligenceNote: '归属、封锁、设备与隐私', tools: '工具', live: '实时工作区', ready: '全天候', local: '隐私优先' },
  en: { diagnostics: 'Network diagnostics', diagnosticsNote: 'Routes, latency, policy and DNS', intelligence: 'Intelligence & security', intelligenceNote: 'Ownership, filtering, devices and privacy', tools: 'Tools', live: 'Live workspace', ready: 'Always on', local: 'Privacy-first' },
  fr: { diagnostics: 'Diagnostic réseau', diagnosticsNote: 'Routes, latence, règles et DNS', intelligence: 'Renseignement et sécurité', intelligenceNote: 'Propriété, filtrage, appareils et vie privée', tools: 'Outils', live: 'Espace en direct', ready: 'Toujours prêt', local: 'Confidentiel' },
  tr: { diagnostics: 'Ağ tanılama', diagnosticsNote: 'Rota, gecikme, kural ve DNS', intelligence: 'İstihbarat ve güvenlik', intelligenceNote: 'Sahiplik, filtreleme, cihazlar ve gizlilik', tools: 'Araç', live: 'Canlı çalışma alanı', ready: 'Her zaman açık', local: 'Gizlilik odaklı' },
};
const productCopy = useProductCopy();
const workspaceCopy = computed(() => productCopy.value.workspace);
const toolGroups = computed(() => [
  { id: 'diagnostics', icon: Network, title: workspaceCopy.value.diagnostics, note: workspaceCopy.value.diagnosticsNote, cards: enabledCards.value.filter(card => card.group === 'diagnostics') },
  { id: 'intelligence', icon: ShieldCheck, title: workspaceCopy.value.intelligence, note: workspaceCopy.value.intelligenceNote, cards: enabledCards.value.filter(card => card.group === 'intelligence') },
  { id: 'platform', icon: TerminalSquare, title: 'Platform', note: 'CLI · API · Docker', cards: enabledCards.value.filter(card => card.group === 'platform') },
]);
const workspaceMetrics = computed(() => [
  { value: enabledCards.value.length, label: workspaceCopy.value.tools },
  { value: '24/7', label: workspaceCopy.value.ready },
  { value: 'LOCAL', label: workspaceCopy.value.local },
]);

const isFullScreen = ref(false);
const isOpen = computed(() => store.openSheet === 'tools');

function onOpenChange(value) {
  if (!value) {
    store.setOpenSheet(null);
    if (router.currentRoute.value.path !== '/') router.push('/');
    isFullScreen.value = false;
  } else {
    store.setOpenSheet('tools');
  }
}

function navigateAndToggleOffcanvas(routePath) {
  router.push(routePath);
  const routeName = routePath.slice(1);
  trackEvent('Nav', 'NavClick', routeName.charAt(0).toUpperCase() + routeName.slice(1));
  scrollContainer.value?.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function fullScreen() {
  isFullScreen.value = !isFullScreen.value;
}

function resetNavigatorURL() {
  router.push('/');
}

onMounted(() => {
  store.setMountingStatus('advancedtools', true);
  if (configs.value.originalSite) {
    cards.find(card => card.path === '/invisibilitytest').enabled = true;
  }
});

defineExpose({ navigateAndToggleOffcanvas, fullScreen });
</script>

<style scoped>
.advanced-grid-pattern {
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(to left, black, transparent);
}

.jn-canvas-width {
  width: 100%;
  margin: auto;
  max-width: 1400px;
}

.jn-tools-drawer {
  display: flex;
  flex-direction: column;
}

:global(.jn-tools-drawer) {
  transition:
    transform 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    height 0.3s cubic-bezier(0.32, 0.72, 0, 1) !important;
}

.tool-rail {
  scrollbar-width: none;
}

.tool-rail::-webkit-scrollbar {
  display: none;
}
</style>
