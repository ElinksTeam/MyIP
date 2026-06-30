import countryLookup from 'country-code-lookup';
import { fetchUpstream } from '../../common/fetch-with-timeout.js';

export default async (req, res) => {
    // IP presence + validity guaranteed by requireValidIP middleware.
    const ipAddress = req.query.ip;

    if (!process.env.IPINFO_API_TOKEN) {
        return res.status(503).json({ error: 'IPinfo.io is not configured' });
    }

    // IPinfo Lite is free and unlimited, and provides country + ASN data.
    const tokens = process.env.IPINFO_API_TOKEN.split(',').map(token => token.trim()).filter(Boolean);
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const url = `https://api.ipinfo.io/lite/${ipAddress}?token=${token}`;

    try {
        const apiRes = await fetchUpstream(url);
        const json = await apiRes.json();
        res.json(modifyJson(json));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

function modifyJson(json) {
    const countryCode = json.country_code || json.country || '';
    const countryName = json.country_code
        ? json.country
        : countryLookup.byIso(countryCode)?.country || 'Unknown Country';
    const [latitude, longitude] = json.loc
        ? json.loc.split(',').map(Number)
        : ['N/A', 'N/A'];
    const [legacyAsn, ...legacyOrg] = (json.org || '').split(' ');

    return {
        ip: json.ip,
        city: json.city || 'N/A',
        region: json.region || 'N/A',
        country: countryCode || 'N/A',
        country_name: countryName,
        country_code: countryCode || 'N/A',
        latitude,
        longitude,
        asn: json.asn || legacyAsn || 'N/A',
        org: json.as_name || legacyOrg.join(' ') || 'N/A',
    };
}
