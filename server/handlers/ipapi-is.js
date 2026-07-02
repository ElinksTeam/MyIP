import { fetchUpstream } from '../../common/fetch-with-timeout.js';

export default async (req, res) => {
    // IP presence + validity guaranteed by requireValidIP middleware.
    const ipAddress = req.query.ip;

    if (!process.env.IPAPIIS_API_KEY) {
        return res.status(503).json({ error: 'IPAPI.is is not configured' });
    }

    const keys = process.env.IPAPIIS_API_KEY.split(',').map(key => key.trim()).filter(Boolean);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const url = `https://api.ipapi.is?q=${ipAddress}&key=${key}`;

    try {
        const apiRes = await fetchUpstream(url);
        const json = await apiRes.json();
        res.json(modifyJsonForIPAPI(json));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

function modifyJsonForIPAPI(json) {
    let asn = json.asn || {};
    const { ip, location, is_datacenter, is_proxy, is_vpn, is_tor } = json;

    return {
        ip: ip,
        city: location.city || 'N/A',
        region: location.state || 'N/A',
        country: location.country_code || 'N/A',
        country_name: location.country || 'N/A',
        country_code: location.country_code || 'N/A',
        latitude: location.latitude || 'N/A',
        longitude: location.longitude || 'N/A',
        postalCode: location.zip || location.postal_code || 'N/A',
        timezone: location.timezone || 'N/A',
        continent: location.continent || 'N/A',
        asn: asn.asn === undefined ? 'N/A' : 'AS' + asn.asn,
        org: asn.org || 'N/A',
        networkOrganization: asn.org || 'N/A',
        isHosting: is_datacenter || false,
        isProxy: is_proxy || is_vpn || is_tor || false
    };
}
