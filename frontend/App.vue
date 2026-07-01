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
            <Card class="mb-4 border-border/70 shadow-xs">
              <CardContent class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">ElinksNet</p>
                  <h1 class="mt-1 text-xl font-semibold tracking-tight">{{ t('page.title') }}</h1>
                </div>
                <DashboardActions :get-cards="getReportCards" />
              </CardContent>
            </Card>

            <!-- Existing network tools, restyled as the dashboard canvas -->
            <div class="dashboard-sections rounded-md" tabindex="0">
              <IPCheck ref="IPCheckRef" />
              <ElinksAiAdvisor :get-diagnostics="getAiDiagnostics" />
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
import { Card, CardContent } from './components/ui/card';

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
const getAiDiagnostics = () => ({
    generatedAt: new Date().toISOString(),
    cards: getReportCards()
        .filter(card => card.ip && !String(card.ip).includes('Error'))
        .map(card => ({
            source: card.source || '',
            ip: card.ip,
            country: card.country_name || '',
            region: card.region || '',
            city: card.city || '',
            isp: card.isp || '',
            asn: card.asn || '',
            proxy: card.isProxy || 'unknown',
            qualityScore: card.qualityScore ?? 'unknown',
            networkType: card.type || '',
        })),
});

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
