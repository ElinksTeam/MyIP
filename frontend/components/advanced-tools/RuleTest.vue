<template>
  <div class="rule-test-section my-4 space-y-4">
    <div class="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div class="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <div class="mb-2 flex items-center gap-2">
            <Badge variant="outline" class="gap-1.5 font-mono text-[10px] uppercase tracking-wider">
              <Waypoints class="size-3.5" />
              Policy Matrix
            </Badge>
            <Badge :variant="finishAll ? 'secondary' : 'outline'" class="gap-1 text-[10px]">
              <span class="size-1.5 rounded-full" :class="finishAll ? 'bg-success' : 'bg-info animate-pulse'" />
              {{ finishAll ? copy.complete : copy.running }}
            </Badge>
          </div>
          <h2 class="text-lg font-semibold tracking-tight">{{ t('ruletest.Title') }}</h2>
          <p class="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{{ t('ruletest.Note') }}</p>
        </div>
        <div class="grid grid-cols-3 gap-2 lg:min-w-[300px]">
          <div class="rounded-lg border bg-muted/30 px-3 py-2">
            <p class="font-mono text-lg font-semibold">{{ completedCount }}/8</p>
            <p class="text-[10px] text-muted-foreground">{{ copy.checked }}</p>
          </div>
          <div class="rounded-lg border bg-muted/30 px-3 py-2">
            <p class="font-mono text-lg font-semibold text-success">{{ successCount }}</p>
            <p class="text-[10px] text-muted-foreground">{{ copy.routes }}</p>
          </div>
          <div class="rounded-lg border bg-muted/30 px-3 py-2">
            <p class="font-mono text-lg font-semibold">{{ uniqueRouteCount }}</p>
            <p class="text-[10px] text-muted-foreground">{{ copy.exits }}</p>
          </div>
        </div>
      </div>
      <Progress :model-value="progressValue" class="h-1 rounded-none" />
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Card v-for="test in ruleTests" :key="test.id"
        class="keyboard-shortcut-card jn-card overflow-hidden border-border/70 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        <CardContent class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                <Waypoints class="size-4 text-muted-foreground" />
              </span>
              <div class="min-w-0">
                <p class="text-sm font-semibold">
                  {{ test.name }} <span class="font-mono text-xs text-muted-foreground">#{{ test.id }}</span>
                </p>
                <p class="truncate font-mono text-[11px] text-muted-foreground" :title="test.url">{{ test.url }}</p>
              </div>
            </div>
            <Badge variant="outline" class="shrink-0 gap-1.5 text-[10px]">
              <span class="size-1.5 rounded-full" :class="dotClass(toneOf(test))" />
              {{ statusLabel(test) }}
            </Badge>
          </div>

          <div class="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-muted/20 p-3">
            <div class="min-w-0">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Resolved endpoint</p>
              <p class="truncate font-mono font-medium" :class="[fitOneLineClass(test.ip), textClass(toneOf(test))]" :title="test.ip">
                {{ test.ip }}
              </p>
            </div>
            <div class="min-w-[86px] border-l pl-3">
              <p class="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin class="size-3" /> {{ t('ruletest.Country') }}
              </p>
              <div class="flex items-center gap-1.5 text-xs font-medium">
                <template v-if="!isFieldPending(test.country)">
                  <Icon v-if="test.country_code" :icon="'circle-flags:' + test.country_code.toLowerCase()"
                    class="size-4 shrink-0" />
                  <span class="max-w-24 truncate">{{ test.country }}</span>
                </template>
                <span v-else class="text-muted-foreground">—</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="flex justify-center border-t pt-4">
      <Button variant="action" :disabled="!finishAll" class="cursor-pointer shadow-lg"
        :class="[isMobile ? 'w-full' : 'w-72']" @click="checkAllRuleTest(true)">
        <Spinner v-if="!finishAll" />
        <RotateCw v-else />
        {{ t('ruletest.RefreshAll') }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import getCountryName from '@/data/country-name.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useStatusTone } from '@/composables/use-status-tone.js';
import { Icon } from '@iconify/vue';
import { MapPin, RotateCw, Waypoints } from 'lucide-vue-next';

const { t } = useI18n();
const store = useMainStore();
const isMobile = computed(() => store.isMobile);
const lang = computed(() => store.lang);
const isSignedIn = computed(() => store.isSignedIn);
const { dotClass, textClass } = useStatusTone();

const createDefaultCard = () => ({
  name: t('ruletest.Name'),
  ip: t('ruletest.StatusWait'),
  country_code: '',
  country: t('ruletest.StatusWait'),
});

const ruleTests = ref(Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  url: `ptest-${index + 1}.ipcheck.ing`,
  ...createDefaultCard(),
})));

const IPArray = ref([]);
const finishAll = ref(false);
const COPY = {
  zh: { running: '检测中', complete: '检测完成', checked: '已检测', routes: '可用线路', exits: '独立出口', waiting: '等待', failed: '失败', online: '在线' },
  en: { running: 'Running', complete: 'Complete', checked: 'Checked', routes: 'Routes online', exits: 'Unique exits', waiting: 'Waiting', failed: 'Failed', online: 'Online' },
  fr: { running: 'Analyse', complete: 'Terminé', checked: 'Vérifiés', routes: 'Routes actives', exits: 'Sorties uniques', waiting: 'Attente', failed: 'Échec', online: 'En ligne' },
  tr: { running: 'Çalışıyor', complete: 'Tamamlandı', checked: 'Kontrol', routes: 'Aktif rota', exits: 'Benzersiz çıkış', waiting: 'Bekliyor', failed: 'Başarısız', online: 'Çevrimiçi' },
};
const copy = computed(() => COPY[store.lang] || COPY.en);

const toneOf = (test) => {
  if (test.ip === t('ruletest.StatusWait')) return 'wait';
  if (test.ip === t('ruletest.StatusError')) return 'fail';
  if (test.ip.includes('.') || test.ip.includes(':')) return 'ok-fast';
  return 'wait';
};
const completedCount = computed(() => ruleTests.value.filter(test => toneOf(test) !== 'wait').length);
const successCount = computed(() => ruleTests.value.filter(test => toneOf(test) === 'ok-fast').length);
const uniqueRouteCount = computed(() => new Set(
  ruleTests.value.filter(test => toneOf(test) === 'ok-fast').map(test => test.ip)
).size);
const progressValue = computed(() => (completedCount.value / ruleTests.value.length) * 100);

const isFieldPending = (value) =>
  !value || value === t('ruletest.StatusWait') || value === t('ruletest.StatusError');

const statusLabel = (test) => {
  const tone = toneOf(test);
  if (tone === 'ok-fast') return copy.value.online;
  if (tone === 'fail') return copy.value.failed;
  return copy.value.waiting;
};

const fitOneLineClass = (text) => {
  const length = typeof text === 'string' ? text.length : 0;
  if (length <= 15) return 'text-base';
  if (length <= 26) return 'text-sm';
  return 'text-xs';
};

async function fetchTrace(index, url) {
  try {
    const response = await fetch(`https://${url}/cdn-cgi/trace`);
    const data = await response.text();
    const lines = data.split('\n');
    const ipLine = lines.find(line => line.startsWith('ip='));
    const countryLine = lines.find(line => line.startsWith('loc='));
    if (!ipLine) throw new Error('Trace response did not include an IP');

    const ip = ipLine.split('=')[1];
    ruleTests.value[index].ip = ip;
    IPArray.value = [...IPArray.value, ip];
    if (countryLine) {
      const country = countryLine.split('=')[1];
      ruleTests.value[index].country_code = country;
      ruleTests.value[index].country = getCountryName(country, lang.value);
    }
  } catch (error) {
    ruleTests.value[index].ip = t('ruletest.StatusError');
    ruleTests.value[index].country_code = '';
    ruleTests.value[index].country = t('ruletest.StatusError');
    console.error('Error fetching Data:', error);
  }
}

async function checkAllRuleTest(refresh = false) {
  finishAll.value = false;
  if (refresh) {
    ruleTests.value.forEach(test => Object.assign(test, createDefaultCard()));
  }

  for (let index = 0; index < ruleTests.value.length; index += 1) {
    await fetchTrace(index, ruleTests.value[index].url);
  }

  finishAll.value = true;
  if (isSignedIn.value) checkAchievements();
}

function checkAchievements() {
  const uniqueIPs = new Set(ruleTests.value.map(test => test.ip));
  if (uniqueIPs.size === 8 && !store.userAchievements.CrossingTheWall.achieved) {
    store.setTriggerUpdateAchievements('CrossingTheWall');
  }
}

onMounted(() => {
  setTimeout(() => checkAllRuleTest(), 500);
});

watch(IPArray, () => {
  store.updateAllIPs(IPArray.value);
}, { deep: true });
</script>
