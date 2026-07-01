<template>
  <Card class="mb-6 overflow-hidden border-sky-500/20 shadow-xs">
    <CardContent class="p-0">
      <header class="flex flex-col gap-3 border-b bg-sky-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Sparkles class="size-5" />
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-semibold">Elinks AI</h2>
              <Badge variant="outline">Groq</Badge>
            </div>
            <p class="text-xs text-muted-foreground">{{ copy.subtitle }}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" class="gap-2" :disabled="loading" @click="analyzeNow">
          <ScanSearch class="size-4" />
          {{ copy.analyze }}
        </Button>
      </header>

      <div ref="messageList" class="max-h-[420px] min-h-48 space-y-4 overflow-y-auto p-4 sm:p-5">
        <div v-for="(message, index) in messages" :key="index"
          class="flex gap-2.5" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
          <span v-if="message.role === 'assistant'"
            class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Bot class="size-4" />
          </span>
          <div class="max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap"
            :class="message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'border bg-muted/35 text-foreground'">
            {{ message.content }}
          </div>
        </div>
        <div v-if="loading" class="flex items-center gap-2.5 text-sm text-muted-foreground">
          <span class="flex size-7 items-center justify-center rounded-full bg-sky-500/10">
            <LoaderCircle class="size-4 animate-spin text-sky-600" />
          </span>
          {{ copy.loading }}
        </div>
      </div>

      <form class="border-t bg-background p-3 sm:p-4" @submit.prevent="send">
        <div class="flex items-end gap-2">
          <Textarea v-model="question" :placeholder="copy.placeholder" rows="2"
            class="min-h-20 resize-none" :disabled="loading" @keydown.enter.exact.prevent="send" />
          <Button type="submit" size="icon" class="size-10 shrink-0" :disabled="loading || !question.trim()">
            <Send class="size-4" />
            <span class="sr-only">{{ copy.send }}</span>
          </Button>
        </div>
        <p class="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
          <LockKeyhole class="mt-0.5 size-3.5 shrink-0 text-success" />
          {{ copy.privacy }}
        </p>
      </form>
    </CardContent>
  </Card>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { useMainStore } from '@/store';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Bot, LoaderCircle, LockKeyhole, ScanSearch, Send, Sparkles } from 'lucide-vue-next';

const props = defineProps({
  getDiagnostics: { type: Function, required: true },
});

const store = useMainStore();
const loading = ref(false);
const question = ref('');
const messageList = ref(null);

const COPY = {
  zh: {
    subtitle: '基于当前检测结果的交互式网络安全助手',
    intro: '你好，我可以结合当前 IP、网络归属、代理状态和质量分数进行分析。点击“分析当前检测”，也可以直接向我提问。',
    analyze: '分析当前检测',
    analyzingPrompt: '请分析我当前的网络检测结果，指出异常、隐私风险和最值得优先处理的事项。',
    placeholder: '询问当前网络、代理、IP 质量或隐私风险…',
    privacy: '发送时会把当前 IP、地区、ASN、运营商、代理状态和质量分数提交给 Groq；不会发送浏览器指纹或账号信息。',
    loading: '正在分析检测数据…',
    send: '发送',
    error: '暂时无法连接 Elinks AI，请稍后重试。',
  },
  en: {
    subtitle: 'Interactive network assistant grounded in your current results',
    intro: 'I can analyze the current IP, network ownership, proxy status, and quality score. Select “Analyze current checks” or ask a question.',
    analyze: 'Analyze current checks',
    analyzingPrompt: 'Analyze my current network checks and identify anomalies, privacy risks, and the highest-priority actions.',
    placeholder: 'Ask about your network, proxy, IP quality, or privacy…',
    privacy: 'Sending shares the current IP, location, ASN, ISP, proxy status, and quality score with Groq. Browser fingerprints and account data are excluded.',
    loading: 'Analyzing diagnostic data…',
    send: 'Send',
    error: 'Elinks AI is temporarily unavailable. Please try again.',
  },
  fr: {
    subtitle: 'Assistant réseau interactif basé sur vos résultats',
    intro: 'Je peux analyser l’IP, le réseau, le proxy et le score de qualité actuels. Lancez l’analyse ou posez une question.',
    analyze: 'Analyser les contrôles',
    analyzingPrompt: 'Analyse mes contrôles réseau actuels et indique les anomalies, les risques et les actions prioritaires.',
    placeholder: 'Question sur le réseau, le proxy ou la confidentialité…',
    privacy: 'L’envoi partage avec Groq l’IP, la région, l’ASN, le FAI, le proxy et le score. Aucune empreinte ni donnée de compte.',
    loading: 'Analyse des données…',
    send: 'Envoyer',
    error: 'Elinks AI est temporairement indisponible.',
  },
  tr: {
    subtitle: 'Mevcut sonuçlarınıza dayalı etkileşimli ağ asistanı',
    intro: 'Mevcut IP, ağ sahibi, proxy durumu ve kalite puanını analiz edebilirim. Analizi başlatın veya sorunuzu yazın.',
    analyze: 'Mevcut sonuçları analiz et',
    analyzingPrompt: 'Mevcut ağ sonuçlarımı analiz et; anormallikleri, gizlilik risklerini ve öncelikli adımları belirt.',
    placeholder: 'Ağ, proxy, IP kalitesi veya gizlilik hakkında sorun…',
    privacy: 'Gönderim sırasında IP, konum, ASN, ISS, proxy durumu ve puan Groq ile paylaşılır; parmak izi ve hesap bilgileri gönderilmez.',
    loading: 'Tanılama verileri analiz ediliyor…',
    send: 'Gönder',
    error: 'Elinks AI şu anda kullanılamıyor.',
  },
};

const copy = new Proxy({}, {
  get: (_, key) => (COPY[store.lang] || COPY.en)[key],
});
const messages = ref([{ role: 'assistant', content: copy.intro }]);

async function analyzeNow() {
  question.value = copy.analyzingPrompt;
  await send();
}

async function send() {
  const content = question.value.trim();
  if (!content || loading.value) return;

  messages.value.push({ role: 'user', content });
  question.value = '';
  loading.value = true;
  await scrollToBottom();

  try {
    const response = await fetch('/api/ai/security-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: store.lang,
        question: content,
        diagnostics: props.getDiagnostics(),
        history: messages.value.slice(-7, -1),
      }),
    });
    if (!response.ok) throw new Error('AI unavailable');
    const data = await response.json();
    messages.value.push({ role: 'assistant', content: data.answer });
  } catch {
    messages.value.push({ role: 'assistant', content: copy.error });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}

async function scrollToBottom() {
  await nextTick();
  if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight;
}
</script>
