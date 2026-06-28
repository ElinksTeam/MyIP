import { fetchUpstream } from '../../common/fetch-with-timeout.js';

export default async function ipWhoIsHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const ipAddress = req.query.ip;
    const url = `https://ipwho.is/${encodeURIComponent(ipAddress)}`;

    try {
        const apiRes = await fetchUpstream(url, {
            headers: { Accept: 'application/json' },
        });
        if (!apiRes.ok) {
            return res.status(apiRes.status === 429 ? 429 : 502)
                .json({ error: 'IPWho.is upstream request failed' });
        }

        const json = await apiRes.json();
        if (json.success === false) {
            return res.status(json.message?.toLowerCase().includes('rate limit') ? 429 : 502)
                .json({ error: json.message || 'IPWho.is lookup failed' });
        }
        return res.status(200).json(normalizeIpWhoIs(json));
    } catch (error) {
        return res.status(502).json({ error: error.message });
    }
}

export function normalizeIpWhoIs(json) {
    const connection = json.connection || {};
    const asn = connection.asn ? String(connection.asn).replace(/^AS/i, '') : '';

    return {
        ip: json.ip || '',
        city: json.city || '',
        region: json.region || '',
        country: json.country_code || '',
        country_name: json.country || '',
        country_code: json.country_code || '',
        latitude: json.latitude ?? '',
        longitude: json.longitude ?? '',
        asn: asn ? `AS${asn}` : '',
        org: connection.org || connection.isp || '',
    };
}
