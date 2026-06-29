<template>
  <TooltipProvider :delay-duration="150">
    <div class="dashboard-shell min-h-screen bg-muted/30">
      <DashboardSidebar />

      <div class="min-w-0 flex-1">
        <NavBar ref="navBarRef" />
        <User ref="userRef" />
        <Achievements ref="achievementsRef" />
        <Preferences ref="preferencesRef" />
        <Alert />

        <main id="mainpart" class="w-full px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
          <div class="mx-auto w-full max-w-[1440px]">
            <!-- Dashboard overview -->
            <Card class="mb-6 overflow-hidden border-border/70 shadow-xs">
              <CardContent class="relative p-5 sm:p-7">
                <div class="absolute inset-y-0 right-0 hidden w-1/3 opacity-40 lg:block dashboard-grid-pattern" />
                <div class="relative max-w-3xl">
                  <Badge variant="outline" class="mb-4 gap-1.5 bg-background/70">
                    <Activity class="size-3.5 text-success" />
                    ElinksNet
                  </Badge>
                  <h1 class="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {{ t('page.title') }}
                  </h1>
                  <p class="mb-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {{ t('page.description') }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="secondary" class="gap-1.5 px-2.5 py-1">
                      <span class="size-1.5 rounded-full bg-success" />
                      {{ t('nav.Connectivity') }}
                    </Badge>
                    <Badge variant="secondary" class="gap-1.5 px-2.5 py-1">
                      <span class="size-1.5 rounded-full bg-info" />
                      {{ t('nav.DNSLeakTest') }}
                    </Badge>
                    <Badge variant="secondary" class="gap-1.5 px-2.5 py-1">
                      <span class="size-1.5 rounded-full bg-action" />
                      {{ t('nav.AdvancedTools') }}
                    </Badge>
                  </div>
                  <DashboardActions class="mt-4" :get-cards="getReportCards" />
                </div>
              </CardContent>
            </Card>

            <ProductOverview />
            <ElinksAiAdvisor />

            <!-- Existing network tools, restyled as the dashboard canvas -->
            <div class="dashboard-sections rounded-md" tabindex="0">
              <IPCheck ref="IPCheckRef" />
              <Connectivity ref="connectivityRef" />
              <WebRTC ref="webRTCRef" />
              <DNSLeaks ref="dnsLeaksRef" />
              <SpeedTest ref="speedTestRef" />
              <AdvancedTools ref="advancedToolsRef" />
            </div>
          </div>
        </main>

        <div class="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8">
          <Additional ref="additionalRef" />
        </div>
        <Footer ref="footerRef" />
      </div>
    </div>

    <InfoMask :showMaskButton.value="showMaskButton" :infoMaskLevel.value="infoMaskLevel"
      :toggleInfoMask="toggleInfoMask" />
    <QueryIP ref="queryIPRef" />
    <HelpModal ref="helpModalRef" />
    <PWA />
  </TooltipProvider>
</template>

<script setup>
// Components
import NavBar from './components/Nav.vue';
import DashboardSidebar from './components/DashboardSidebar.vue';
import DashboardActions from './components/DashboardActions.vue';
import IPCheck from './components/IpInfos.vue';
import Connectivity from './components/ConnectivityTest.vue';
import WebRTC from './components/WebRtcTest.vue';
import DNSLeaks from './components/DnsLeaksTest.vue';
import Additional from './components/Additional.vue';
import Footer from './components/Footer.vue';
import User from './components/User.vue';
import Achievements from './components/Achievements.vue';

// Widgets
import Preferences from './components/widgets/Preferences.vue';
import QueryIP from './components/widgets/QueryIP.vue';
import HelpModal from './components/widgets/Help.vue';
import PWA from './components/widgets/PWA.vue';
import Alert from './components/widgets/Toast.vue';
import InfoMask from './components/widgets/InfoMask.vue';

// UI
import { TooltipProvider } from './components/ui/tooltip';
import { Badge } from './components/ui/badge';
import { Card, CardContent } from './components/ui/card';
import { Activity } from 'lucide-vue-next';

// Vue + Store
import { defineAsyncComponent, ref, computed, onMounted } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';

// Composables
import { useInfoMask } from '@/composables/use-info-mask.js';
import { useRefreshOrchestrator } from '@/composables/use-refresh-orchestrator.js';
import { useShortcuts } from '@/composables/use-shortcuts.js';
import { useSectionTracking } from '@/composables/use-section-tracking.js';

const { t } = useI18n();
const ProductOverview = defineAsyncComponent(() => import('./components/ProductOverview.vue'));
const ElinksAiAdvisor = defineAsyncComponent(() => import('./components/ElinksAiAdvisor.vue'));
const SpeedTest = defineAsyncComponent(() => import('./components/SpeedTest.vue'));
const AdvancedTools = defineAsyncComponent(() => import('./components/Advanced.vue'));
const store = useMainStore();
const configs = computed(() => store.configs);
const userPreferences = computed(() => store.userPreferences);
const isSignedIn = computed(() => store.isSignedIn);
const openedCard = computed(() => store.currentPath.id);

// Template refs
const navBarRef = ref(null);
const userRef = ref(null);
const achievementsRef = ref(null);
const preferencesRef = ref(null);
const queryIPRef = ref(null);
const helpModalRef = ref(null);
const additionalRef = ref(null);
const footerRef = ref(null);
const speedTestRef = ref(null);
const advancedToolsRef = ref(null);
const IPCheckRef = ref(null);
const connectivityRef = ref(null);
const webRTCRef = ref(null);
const dnsLeaksRef = ref(null);
const getReportCards = () => IPCheckRef.value?.ipDataCards || [];

// Hide loading mask on first screen
const loadingElement = document.getElementById('jn-loading');
if (loadingElement) loadingElement.style.display = 'none';

// Info mask
const { infoMaskLevel, isInfosLoaded, showMaskButton, toggleInfoMask } = useInfoMask({
    refs: { IPCheckRef, webRTCRef, dnsLeaksRef },
    store,
    t,
});

// Refresh / initial load sequence
const { loadingControl } = useRefreshOrchestrator({
    refs: { IPCheckRef, connectivityRef, webRTCRef, dnsLeaksRef },
    store,
    t,
    userPreferences,
    infoMaskLevel,
});

// Shortcuts
const { loadShortcuts } = useShortcuts({
    refs: {
        navBarRef, preferencesRef, queryIPRef, helpModalRef, additionalRef, footerRef,
        speedTestRef, advancedToolsRef, IPCheckRef, connectivityRef, webRTCRef, dnsLeaksRef,
        isInfosLoaded, openedCard, toggleInfoMask,
    },
    store, t, configs, userPreferences, isSignedIn,
});

// Scroll monitoring + section tracking (logic from widgets/Patch.vue)
useSectionTracking();

onMounted(() => {
    loadingControl();
    loadShortcuts();
});
</script>

<style scoped></style>
