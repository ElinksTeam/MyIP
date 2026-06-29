<template>
    <!-- Curl Dialog -->
    <Dialog :open="isOpen" @update:open="isOpen = $event">
        <DialogContent :title="t('curl.Title')">
            <DialogHeader :icon="Terminal" :title="t('curl.Title')" />

            <div class="space-y-4">
                <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{{ apiCopy.description }}</span>
                    <Badge variant="outline" class="text-success">{{ apiCopy.noKey }}</Badge>
                    <Badge variant="outline">60 / min</Badge>
                </div>

                <div class="space-y-3">
                    <div v-for="(item, index) in commands" :key="item.label" class="space-y-1.5">
                        <p class="text-xs font-medium text-muted-foreground">{{ item.label }}</p>
                        <div class="flex items-center gap-2 rounded-lg border bg-zinc-950 p-2 pl-3">
                            <code class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs text-zinc-100">$ {{ item.command }}</code>
                            <Button type="button" variant="ghost" size="icon"
                                class="size-8 shrink-0 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                :aria-label="apiCopy.copy" @click="copyCommand(item.command, index)">
                                <Check v-if="copiedIndex === index" class="size-4 text-emerald-400" />
                                <Copy v-else class="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>

    <!-- Elinks project links -->
    <div class="mx-auto max-w-3xl px-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a href="https://github.com/ElinksTeam/ElinksNet" target="_blank" rel="noopener"
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { trackEvent } from '@/utils/use-analytics';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Check, ChevronRight, Container, Copy, ExternalLink, Github, Terminal } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductCopy } from '@/composables/use-product-copy.js';

const { locale, t } = useI18n();
const origin = window.location.origin;
const copiedIndex = ref(-1);
const copyByLocale = {
    zh: { description: '同域公共 API，无需注册或 API Key。', noKey: '免 Key', copy: '复制命令', ip: '查询当前 IP', ipv4: '强制 IPv4', ipv6: '强制 IPv6', json: 'JSON 格式', geo: '查询当前 IP 地理信息', target: '查询指定 IP' },
    en: { description: 'Same-origin public API. No signup or API key.', noKey: 'No key', copy: 'Copy command', ip: 'Current IP', ipv4: 'Force IPv4', ipv6: 'Force IPv6', json: 'JSON format', geo: 'Current IP geolocation', target: 'Look up an IP' },
    fr: { description: 'API publique du même domaine, sans clé.', noKey: 'Sans clé', copy: 'Copier', ip: 'IP actuelle', ipv4: 'Forcer IPv4', ipv6: 'Forcer IPv6', json: 'Format JSON', geo: 'Géolocalisation actuelle', target: 'Rechercher une IP' },
    tr: { description: 'Aynı alan adı API’si, anahtar gerekmez.', noKey: 'Anahtarsız', copy: 'Komutu kopyala', ip: 'Geçerli IP', ipv4: 'IPv4 kullan', ipv6: 'IPv6 kullan', json: 'JSON biçimi', geo: 'Geçerli IP konumu', target: 'Bir IP sorgula' },
};
const productCopy = useProductCopy();
const apiCopy = computed(() => productCopy.value.api);
const commands = computed(() => [
    { label: apiCopy.value.ip, command: `curl ${origin}/api/cli/ip` },
    { label: apiCopy.value.ipv4, command: `curl -4 ${origin}/api/cli/ip` },
    { label: apiCopy.value.ipv6, command: `curl -6 ${origin}/api/cli/ip` },
    { label: apiCopy.value.json, command: `curl "${origin}/api/cli/ip?format=json"` },
    { label: apiCopy.value.geo, command: `curl ${origin}/api/cli/geo` },
    { label: apiCopy.value.target, command: `curl "${origin}/api/cli/geo?ip=8.8.8.8"` },
]);
const copyCommand = async (command, index) => {
    await navigator.clipboard.writeText(command);
    copiedIndex.value = index;
    window.setTimeout(() => {
        if (copiedIndex.value === index) copiedIndex.value = -1;
    }, 1600);
};

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
