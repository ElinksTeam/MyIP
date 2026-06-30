import { fetchUpstream } from '../../common/fetch-with-timeout.js';

export default async (req, res) => {
    // IP presence + validity guaranteed by requireValidIP middleware.
    const ipAddress = req.query.ip;

    if (!process.env.IP2LOCATION_API_KEY) {
        return res.status(503).json({ error: 'IP2Location.io is not configured' });
    }

    const keys = process.env.IP2LOCATION_API_KEY.split(',').map(key => key.trim()).filter(Boolean);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const url = `https://api.ip2location.io/?ip=${ipAddress}&key=${key}`;

    try {
        const apiRes = await fetchUpstream(url);
        const json = await apiRes.json();
        res.json(modifyJsonForIPAPI(json));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

function modifyJsonForIPAPI(json) {
    const asn = json.asn;
    const { ip, country_code, country_name, region_name, city_name, latitude, longitude, as } = json;
    const normalizedAsn = asn === undefined || asn === null
        ? 'N/A'
        : String(asn).toUpperCase().startsWith('AS') ? String(asn) : `AS${asn}`;

    return {
        ip: ip,
        city: city_name || 'N/A',
        region: region_name || 'N/A',
        country: country_code || 'N/A',
        country_name: country_name || 'N/A',
        country_code: country_code || 'N/A',
        latitude: latitude ?? 'N/A',
        longitude: longitude ?? 'N/A',
        asn: normalizedAsn,
        org: as || 'N/A',
    };
}
