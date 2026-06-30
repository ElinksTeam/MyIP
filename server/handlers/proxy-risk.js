import { fetchUpstream } from '../../common/fetch-with-timeout.js';
import { isValidIP } from '../../common/valid-ip.js';

export default async function proxyRiskHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const ip = typeof req.query?.ip === 'string' ? req.query.ip.trim() : '';
    if (!isValidIP(ip)) {
        return res.status(400).json({ error: 'Invalid IP address' });
    }

    try {
        const apiKey = process.env.PROXYCHECK_API_KEY;
        const params = new URLSearchParams({ risk: '1', vpn: '1' });
        if (apiKey) params.set('key', apiKey);
        const response = await fetchUpstream(
            `https://proxycheck.io/v3/${encodeURIComponent(ip)}?${params}`,
            { headers: { Accept: 'application/json' } },
        );
        if (!response.ok) {
            return res.status(response.status === 429 ? 429 : 502)
                .json({ error: 'Proxy risk provider is unavailable' });
        }
        const payload = await response.json();
        const result = payload?.[ip];
        const detections = result?.detections;
        if (payload?.status !== 'ok' || !detections) {
            return res.status(502).json({ error: 'Proxy risk result is unavailable' });
        }
        const riskScore = Math.max(0, Math.min(100, Number(detections.risk) || 0));
        const isProxy = Boolean(
            detections.proxy || detections.vpn || detections.tor
            || detections.compromised || detections.scraper,
        );
        res.setHeader('Cache-Control', 'private, max-age=300');
        return res.status(200).json({
            ip,
            isProxy,
            qualityScore: 100 - riskScore,
            riskScore,
            confidence: Number(detections.confidence) || 0,
            type: result.network?.type || '',
            provider: result.network?.provider || '',
            source: 'ProxyCheck.io',
        });
    } catch {
        return res.status(502).json({ error: 'Proxy risk provider is unavailable' });
    }
}
