<template>
    <!-- Curl Dialog -->
    <Dialog :open="isOpen" @update:open="isOpen = $event">
        <DialogContent :title="t('curl.Title')">
            <DialogHeader :icon="Terminal" :title="t('curl.Title')" />

            <div v-if="curlDomainsHadSet" class="space-y-3">
                <!-- Description -->
                <div class="space-y-1 text-xs font-mono">
                    <p class="jn-comment"><span class="text-muted-foreground">{{ t('curl.Note1') }}</span></p>
                    <p class="jn-comment">
                        <span class="text-muted-foreground">{{ t('curl.Note2_1') }}
                            <Badge variant="outline" class="text-success">curl</Badge> {{ t('curl.Note2_2') }}</span>
                    </p>
                    <p class="jn-comment">
                        <span class="text-muted-foreground"><Badge variant="outline" class="text-success">geo</Badge> {{ t('curl.Note3') }}</span>
                    </p>
                    <p class="jn-comment">
                        <span class="text-muted-foreground"><Badge variant="outline" class="text-success">YOUR_API_KEY</Badge> {{ t('curl.Note4') }}</span>
                    </p>
                </div>

                <!-- 3 curl command blocks -->
                <div class="space-y-3">
                    <div>
                        <p class="jn-comment text-xs font-mono mb-1.5 text-muted-foreground">{{ t('curl.getIPv4') }}</p>
                        <pre class="jn-curl bg-black text-neutral-100 rounded-md p-3 text-xs font-mono overflow-x-auto">curl {{ ipv4Domain }}<span class="text-success">/geo</span> -H 'x-key: <span class="text-yellow-400">YOUR_API_KEY</span>'</pre>
                    </div>
                    <div>
                        <p class="jn-comment text-xs font-mono mb-1.5 text-muted-foreground">{{ t('curl.getIPv6') }}</p>
                        <pre class="jn-curl bg-black text-neutral-100 rounded-md p-3 text-xs font-mono overflow-x-auto">curl {{ ipv6Domain }}<span class="text-success">/geo</span> -H 'x-key: <span class="text-yellow-400">YOUR_API_KEY</span>'</pre>
                    </div>
                    <div>
                        <p class="jn-comment text-xs font-mono mb-1.5 text-muted-foreground">{{ t('curl.get6and4') }}</p>
                        <pre class="jn-curl bg-black text-neutral-100 rounded-md p-3 text-xs font-mono overflow-x-auto">curl {{ ipv64Domain }}<span class="text-success">/geo</span> -H 'x-key: <span class="text-yellow-400">YOUR_API_KEY</span>'</pre>
                    </div>
                </div>
            </div>
            <div v-else class="py-6 text-center">
                <p class="text-sm text-muted-foreground">{{ t('curl.notAvailable') }}</p>
            </div>
        </DialogContent>
    </Dialog>

    <!-- Elinks project links -->
    <div class="mx-auto max-w-3xl px-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a href="https://github.com/ElinksTeam/MyIP" target="_blank" rel="noopener"
                class="elinks-link-card"
                @click="trackEvent('Additional', 'AdditionalClick', 'GitHub')">
                <Github class="size-5 text-[#165dff]" />
                <span>
                    <strong>{{ t('additional.OpenSource') }}</strong>
                    <small>{{ t('additional.OpenSourceNote') }}</small>
                </span>
                <ExternalLink class="ml-auto size-4 opacity-40" />
            </a>

            <a href="https://hub.docker.com/r/elinksteam/elinksnet" target="_blank" rel="noopener"
                class="elinks-link-card"
                @click="trackEvent('Additional', 'AdditionalClick', 'Docker')">
                <Container class="size-5 text-[#008cd5]" />
                <span>
                    <strong>{{ t('additional.Docker') }}</strong>
                    <small>{{ t('additional.DockerNote') }}</small>
                </span>
                <ExternalLink class="ml-auto size-4 opacity-40" />
            </a>

            <button type="button" class="elinks-link-card text-left" @click="openCurlModal">
                <Terminal class="size-5 text-[#00bfd8]" />
                <span>
                    <strong>{{ t('additional.Curl') }}</strong>
                    <small>{{ t('additional.CurlNote') }}</small>
                </span>
                <ChevronRight class="ml-auto size-4 opacity-40" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { trackEvent } from '@/utils/use-analytics';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { ChevronRight, Container, ExternalLink, Github, Terminal } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';

const { t } = useI18n();

const store = useMainStore();

const ipv4Domain = computed(() => store.curl.ipv4Domain);
const ipv6Domain = computed(() => store.curl.ipv6Domain);
const ipv64Domain = computed(() => store.curl.ipv64Domain);
const curlDomainsHadSet = computed(() => store.curlDomainsHadSet);

const isOpen = ref(false);
const openCurlModal = () => {
    isOpen.value = true;
    trackEvent('Additional', 'AdditionalClick', 'Curl');
};

defineExpose({
    openCurlModal,
});
</script>

<style scoped>
.jn-curl::before {
    content: '$ ';
    color: var(--muted-foreground);
    font-weight: 500;
    margin-right: 0.25rem;
    opacity: 0.7;
}

.jn-comment::before {
    content: '// ';
    color: var(--muted-foreground);
    font-weight: 500;
    opacity: 0.7;
}

.elinks-link-card {
    display: flex;
    min-height: 4rem;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--foreground);
    background:
        linear-gradient(var(--background), var(--background)) padding-box,
        linear-gradient(135deg, rgb(22 93 255 / 0.35), rgb(0 213 232 / 0.35)) border-box;
    text-decoration: none;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.elinks-link-card:hover {
    transform: translateY(-2px);
    border-color: transparent;
    box-shadow: 0 8px 24px rgb(22 93 255 / 0.10);
}

.elinks-link-card span {
    display: flex;
    min-width: 0;
    flex-direction: column;
}

.elinks-link-card strong {
    font-size: 0.875rem;
    font-weight: 600;
}

.elinks-link-card small {
    overflow: hidden;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
