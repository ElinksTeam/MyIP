import net from 'node:net';
import { fetchUpstream } from '../../common/fetch-with-timeout.js';

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function classifyQuery(value) {
    const query = String(value || '').trim();
    if (!query || query.length > 253) return null;
    if (net.isIP(query)) return { type: 'ip', value: query };
    if (/^AS\d+$/i.test(query)) return { type: 'autnum', value: query.slice(2) };
    if (/^\d{1,10}$/.test(query)) return { type: 'autnum', value: query };
    if (DOMAIN_PATTERN.test(query)) return { type: 'domain', value: query.toLowerCase() };
    return null;
}

export default async function rdapHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const target = classifyQuery(req.query.query);
    if (!target) {
        return res.status(400).json({ error: 'Enter a valid domain, IP address, or ASN' });
    }

    try {
        const response = await fetchUpstream(
            `https://rdap.org/${target.type}/${encodeURIComponent(target.value)}`,
            { headers: { Accept: 'application/rdap+json, application/json' } },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return res.status(response.status === 404 ? 404 : 502).json({
                error: payload?.title || 'RDAP lookup failed',
            });
        }

        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json({
            query: target.value,
            type: target.type,
            source: response.url,
            data: payload,
        });
    } catch {
        return res.status(502).json({ error: 'RDAP service is unavailable' });
    }
}

export { classifyQuery };
