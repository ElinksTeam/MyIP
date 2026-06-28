const SUPPORTED_LANGUAGES = new Set(['en', 'fr', 'tr', 'zh']);
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: 'Elinks AI is not configured' });
    }

    const model = process.env.ELINKS_AI_MODEL || DEFAULT_MODEL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                signal: controller.signal,
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: 'You are Elinks AI, a concise network safety assistant. Give practical, non-alarmist guidance. Never claim to have inspected the user device, IP address, or network. Do not recommend paid products. Return only the requested JSON.',
                        }],
                    },
                    contents: [{
                        role: 'user',
                        parts: [{
                            text: `Provide four general online safety recommendations in ${LANGUAGE_NAMES[language]}. Focus on DNS/WebRTC privacy, browser updates, router security, and phishing awareness. Each title must be under 36 characters and each detail under 140 characters.`,
                        }],
                    }],
                    generationConfig: {
                        temperature: 0.35,
                        maxOutputTokens: 700,
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: 'OBJECT',
                            properties: {
                                suggestions: {
                                    type: 'ARRAY',
                                    minItems: 4,
                                    maxItems: 4,
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            title: { type: 'STRING' },
                                            detail: { type: 'STRING' },
                                        },
                                        required: ['title', 'detail'],
                                    },
                                },
                            },
                            required: ['suggestions'],
                        },
                    },
                }),
            },
        );

        if (!response.ok) {
            return res.status(502).json({ error: 'Elinks AI provider is unavailable' });
        }

        const payload = await response.json();
        const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
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
