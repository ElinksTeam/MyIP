import { fetchUpstream } from '../../common/fetch-with-timeout.js';
import { isValidIP } from '../../common/valid-ip.js';
import { normalizeIpWhoIs } from './ipwho-is.js';

export function getRequestIp(req) {
    const forwarded = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim();
    const raw = req.headers?.['cf-connecting-ip']
        || forwarded
        || req.headers?.['cf-connecting-ipv6']
        || req.ip
        || '';
    return String(raw).replace(/^::ffff:/, '').trim();
}

export function cliIpHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const ip = getRequestIp(req);
    if (!isValidIP(ip)) {
        return res.status(503).json({ error: 'Client IP is unavailable' });
    }
    res.setHeader('Cache-Control', 'no-store');
    if (req.query?.format === 'json') {
        return res.status(200).json({ ip });
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(`${ip}\n`);
}

export async function cliGeoHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const requestedIp = typeof req.query?.ip === 'string' ? req.query.ip.trim() : '';
    const ip = requestedIp || getRequestIp(req);
    if (!isValidIP(ip)) {
        return res.status(400).json({ error: 'Invalid IP address' });
    }
    try {
        const result = await lookupKeylessGeo(ip);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(result);
    } catch {
        return res.status(502).json({ error: 'Geolocation providers are unavailable' });
    }
}

export async function lookupKeylessGeo(ip) {
    try {
        const response = await fetchUpstream(`https://ipwho.is/${encodeURIComponent(ip)}`, {
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('IPWho.is request failed');
        const json = await response.json();
        if (json.success === false) throw new Error(json.message || 'IPWho.is lookup failed');
        return { ...normalizeIpWhoIs(json), source: 'IPWho.is' };
    } catch {
        const response = await fetchUpstream(`https://api.ip.sb/geoip/${encodeURIComponent(ip)}`, {
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('IP.sb request failed');
        const json = await response.json();
        return {
            ip: json.ip || ip,
            city: json.city || '',
            region: json.region || json.city || '',
            country: json.country_code || '',
            country_name: json.country || '',
            country_code: json.country_code || '',
            latitude: json.latitude ?? '',
            longitude: json.longitude ?? '',
            asn: json.asn ? `AS${String(json.asn).replace(/^AS/i, '')}` : '',
            org: json.isp || '',
            source: 'IP.sb',
        };
    }
}
