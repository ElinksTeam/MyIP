import { getElinksNetApiConfig } from '../../common/elinksnet-config.js';
import { isMaxMindReady } from '../../common/maxmind-service.js';

// Validate environment variables exist to enable/disable frontend features
export default (req, res) => {
    // defensive; app.get() in backend-server.js already gates method, but a
    // dedicated smoke test asserts this branch directly against the handler.
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Referer has already been validated by requireReferer middleware. Here we
    // Classify the legacy hosted endpoint for compatibility-only behavior.
    const referer = req.headers.referer;
    const hostname = referer ? new URL(referer).hostname : '';
    const allowedHostnames = ['ipcheck.ing', 'www.ipcheck.ing', 'localtest.ipcheck.ing', 'dev.ipcheck.ing', 'test.ipcheck.ing'];
    const originalSite = allowedHostnames.includes(hostname);

    const { key: elinksNetApiKey } = getElinksNetApiConfig();
    const envConfigs = {
        map: true,
        ipInfo: process.env.IPINFO_API_TOKEN,
        elinksNet: elinksNetApiKey,
        ip2location: process.env.IP2LOCATION_API_KEY,
        originalSite,
        cloudFlare: process.env.CLOUDFLARE_API,
        ipapiis: process.env.IPAPIIS_API_KEY,
        elinksAi: process.env.GROQ_API_KEY,
        maxmind: isMaxMindReady(),
    };
    let result = {};
    for (const key in envConfigs) {
        result[key] = !!envConfigs[key];
    }
    res.status(200).json(result);
};
