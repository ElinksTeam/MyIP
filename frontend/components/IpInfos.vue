<template>
  <!-- IP Infos -->
  <section class="ip-data-section mb-10 mt-2">
    <header class="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 id="IPInfo"
          class="m-0 flex min-w-0 flex-1 items-center gap-2 text-xl md:text-3xl font-semibold tracking-tight leading-tight">
          🔎 {{ t('ipInfos.Title') }}
        </h2>
        <p class="mt-2 max-w-4xl text-sm text-muted-foreground">{{ t('ipInfos.Notes') }}</p>
      </div>
      <DashboardActions class="shrink-0" :get-cards="() => ipDataCards" />
    </header>

    <!-- Card grid: 1 col on mobile, always 2 cols on PC (md+). Card counts
         (2 / 4 / 6) are all even, so the last row always fills. -->
    <div class="grid gap-4 items-stretch grid-cols-1 md:grid-cols-2">
      <div v-for="(card, index) in ipDataCards.slice(0, ipCardsToShow)" :key="card.id" :ref="card.id" class="flex"
        :class="{ 'opacity-60': !card.ip || card.ip === t('ipInfos.IPv4Error') || card.ip === t('ipInfos.IPv6Error') }">
        <IPCard class="w-full" :card="card" :index="index" :isDarkMode="isDarkMode" :isMobile="isMobile"
          :isCardsCollapsed="isCardsCollapsed" :copiedStatus="copiedStatus"
          :configs="configs" :asnInfos="asnInfos" @refresh-card="refreshCard" />
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { trackEvent } from '@/utils/use-analytics';
import { isValidIP } from '@/utils/valid-ip.js';
import { fetchMergedIpDetails } from '@/utils/merge-ip-sources.js';
import {
  getIPFromElinksNetV4,
  getIPFromElinksNetV6,
} from '@/utils/getips';
import { authenticatedFetch } from '@/utils/authenticated-fetch';
import IPCard from './ip-infos/IPCard.vue';
import DashboardActions from './DashboardActions.vue';


const { t } = useI18n();

// Store
const store = useMainStore();
const isDarkMode = computed(() => store.isDarkMode);
const isMobile = computed(() => store.isMobile);
const configs = computed(() => store.configs);
const userPreferences = computed(() => store.userPreferences);
const lang = computed(() => store.lang);

// Dynamic configuration of the page
const isCardsCollapsed = computed(() => userPreferences.value.simpleMode);

// Default card data
const createDefaultCard = () => ({
  ip: "",
  country_name: "",
  region: "",
  city: "",
  district: "",
  postalCode: "",
  timezone: "",
  continent: "",
  latitude: "",
  longitude: "",
  isp: "",
  networkOrganization: "",
  networkClass: "",
  asn: "",
  asnlink: "",
  mapUrl: '/res/defaultMap.webp',
  mapUrl_dark: '/res/defaultMap_dark.webp',
  proxyRiskStatus: 'idle',
});

// IP data cards
// Keep one canonical IPv4 card and one canonical IPv6 card.
const ipDataCards = reactive([
  {
    ...createDefaultCard(),
    id: "elinksnet_v4",
    source: "ElinksNet IPv4",
  },
  {
    ...createDefaultCard(),
    id: "elinksnet_v6",
    source: "ElinksNet IPv6",
  },
]);

// Default ASN information
const asnInfos = ref({
  "AS888888": {
    "asnName": "Google", "asnOrgName": "GOGL-ARIN", "estimatedUsers": "888888", "IPv4_Pct": "95.35", "IPv6_Pct": "4.65", "HTTP_Pct": "3.16", "HTTPS_Pct": "96.84", "Desktop_Pct": "58.88", "Mobile_Pct": "41.12", "Bot_Pct": "98.46", "Human_Pct": "1.54"
  }
});

// Other data
const ipCardsToShow = ref(2);
const copiedStatus = ref({});
const IPArray = ref([]);
const fetchStatus = reactive([]);

// Middleware
let pendingIPDetailsRequests = new Map();
let ipDataCache = new Map();
let pendingProxyRiskRequests = new Map();
let proxyRiskCache = new Map();

const applyProxyRisk = (ip, risk) => {
  ipDataCards
    .filter(card => card.ip === ip)
    .forEach(card => Object.assign(card, {
      isProxy: risk.isProxy
        ? t('ipInfos.advancedData.proxyYes')
        : t('ipInfos.advancedData.proxyNo'),
      qualityScore: risk.qualityScore,
      type: card.type || risk.type,
      proxyOperator: risk.provider,
      proxyRiskSource: risk.source,
      proxyRiskStatus: 'ready',
    }));
};

const fetchProxyRisk = async (ip) => {
  if (proxyRiskCache.has(ip)) {
    applyProxyRisk(ip, proxyRiskCache.get(ip));
    return;
  }
  if (pendingProxyRiskRequests.has(ip)) {
    await pendingProxyRiskRequests.get(ip);
    return;
  }
  ipDataCards.filter(card => card.ip === ip).forEach(card => { card.proxyRiskStatus = 'loading'; });
  const request = authenticatedFetch(`/api/proxy-risk?ip=${encodeURIComponent(ip)}`)
    .then((risk) => {
      proxyRiskCache.set(ip, risk);
      applyProxyRisk(ip, risk);
    })
    .catch((error) => {
      console.error('Proxy risk lookup failed:', error);
      ipDataCards
        .filter(card => card.ip === ip)
        .forEach(card => { card.proxyRiskStatus = 'error'; });
    })
    .finally(() => pendingProxyRiskRequests.delete(ip));
  pendingProxyRiskRequests.set(ip, request);
  await request;
};

// Shared method to get IP address
const fetchIP = async (cardID, getFromSource) => {
  try {
    const { ip, source } = await getFromSource(configs.value.originalSite);
    if (isValidIP(ip)) {
      ipDataCards[cardID].ip = ip;
      ipDataCards[cardID].source = source;
      IPArray.value = [...IPArray.value, ip];
      try {
        await fetchIPDetails(cardID, ip);
      } catch (error) {
        // Keep the valid IP visible even if every optional geo provider fails.
        console.error(`IP details unavailable for card ${cardID}:`, error);
      }
    } else if (cardID === 1 || cardID === 3) {
      ipDataCards[cardID].ip = t('ipInfos.IPv6Error');
    } else {
      ipDataCards[cardID].ip = t('ipInfos.IPv4Error');
    }
  } catch (error) {
    console.error(`IP detection failed for card ${cardID}:`, error);
    ipDataCards[cardID].ip = cardID === 1 || cardID === 3
      ? t('ipInfos.IPv6Error')
      : t('ipInfos.IPv4Error');
  } finally {
    fetchStatus[cardID] = { [cardID]: true };
    trackFetchStatus(fetchStatus);
  }
};

// Report data fetch status, and send to store
const trackFetchStatus = (status) => {
  let allHasFetched = true;
  for (let i = 0; i < ipCardsToShow.value; i++) {
    if (status[i] === undefined) {
      allHasFetched = false;
    } else {
      allHasFetched = allHasFetched && status[i][i];
    }
  }
  if (allHasFetched) {
    store.setLoadingStatus('ipcheck', true);
  }
};

// Check all IP addresses
const checkAllIPs = async () => {
  const ipFunctions = [
    () => fetchIP(0, getIPFromElinksNetV4),
    () => fetchIP(1, getIPFromElinksNetV6),
  ];
  const tasks = ipFunctions.slice(0, ipCardsToShow.value);
  for (const [index, task] of tasks.entries()) {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, 350));
    await task();
  }
};

// Get IP details from IP address
const fetchIPDetails = async (cardIndex, ip) => {
  const card = ipDataCards[cardIndex];
  card.ip = ip;
  // Check if the IP data is already in the cache
  if (ipDataCache.has(ip)) {
    const cachedData = ipDataCache.get(ip);
    Object.assign(card, cachedData);
    void fetchProxyRisk(ip);
    return;
  }

  // Check if there is a query in progress, if so, wait for it to complete
  if (pendingIPDetailsRequests.has(ip)) {
    await pendingIPDetailsRequests.get(ip);
    const cachedData = ipDataCache.get(ip);
    if (cachedData) {
      Object.assign(card, cachedData);
      void fetchProxyRisk(ip);
    }
    return;
  }

  const fetchPromise = fetchMergedIpDetails({ store, ip, language: lang.value, t })
    .then(cardData => {
      Object.assign(card, cardData);
      ipDataCache.set(ip, cardData);
      void fetchProxyRisk(ip);
    });

  // Store this Promise in pendingIPDetailsRequests to avoid duplicate queries
  pendingIPDetailsRequests.set(ip, fetchPromise);

  try {
    await fetchPromise;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    // After completion, remove from pendingIPDetailsRequests
    pendingIPDetailsRequests.delete(ip);
  }
};

// Refresh a card
const refreshCard = (card, index) => {
  clearCardData(card);
  switch (index) {
    case 0:
      fetchIP(0, getIPFromElinksNetV4);
      break;
    case 1:
      fetchIP(1, getIPFromElinksNetV6);
      break;
    default:
      console.error("Undefind Source:");
  }
  trackEvent('IPCheck', 'RefreshClick', 'IPInfos');
};

// Clear card data
const clearCardData = (card) => {
  Object.assign(card, createDefaultCard());
};

watch(IPArray, () => {
  store.updateAllIPs(IPArray.value);
});

onMounted(() => {
  store.setMountingStatus('ipcheck', true);
});

defineExpose({
  checkAllIPs,
  ipDataCards,
  refreshCard,
});

</script>

<style scoped></style>
