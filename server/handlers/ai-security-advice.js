const SUPPORTED_LANGUAGES = new Set(['en', 'fr', 'tr', 'zh']);
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const LANGUAGE_NAMES = {
    en: 'English',
    fr: 'French',
    tr: 'Turkish',
    zh: 'Simplified Chinese',
};

export default async function aiSecurityAdvice(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const language = typeof req.body?.language === 'string' ? req.body.language : 'en';
    if (!SUPPORTED_LANGUAGES.has(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: 'Elinks AI is not configured' });
    }

    const model = process.env.ELINKS_AI_MODEL || DEFAULT_MODEL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model,
                    temperature: 0.35,
                    max_completion_tokens: 700,
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: 'You are Elinks AI, a concise network safety assistant. Give practical, non-alarmist guidance. Never claim to have inspected the user device. Do not recommend paid products. Return JSON only as {"suggestions":[{"title":"...","detail":"..."}]} with exactly four items.',
                        },
                        {
                            role: 'user',
                            content: `Provide four online safety recommendations in ${LANGUAGE_NAMES[language]}. Focus on DNS/WebRTC privacy, browser updates, router security, and phishing. Each title must be under 36 characters and detail under 140 characters.`,
                        },
                    ],
                }),
            });

        if (!response.ok) {
            return res.status(502).json({ error: 'Elinks AI provider is unavailable' });
        }

        const payload = await response.json();
        const text = payload?.choices?.[0]?.message?.content;
        const parsed = JSON.parse(text || '{}');
        const suggestions = Array.isArray(parsed.suggestions)
            ? parsed.suggestions
                .filter(item => typeof item?.title === 'string' && typeof item?.detail === 'string')
                .slice(0, 4)
            : [];

        if (suggestions.length !== 4) {
            return res.status(502).json({ error: 'Elinks AI returned an invalid response' });
        }

        return res.status(200).json({ suggestions, model });
    } catch (error) {
        const message = error?.name === 'AbortError'
            ? 'Elinks AI request timed out'
            : 'Elinks AI provider is unavailable';
        return res.status(502).json({ error: message });
    } finally {
        clearTimeout(timeout);
    }
}
