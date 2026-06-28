import { fetchUpstream } from '../common/fetch-with-timeout.js';
import { getElinksNetApiConfig } from '../common/elinksnet-config.js';

export default async (req, res) => {
    const { endpoint, key } = getElinksNetApiConfig();

    if (!key) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    // Build request
    const url = new URL(`${endpoint}/userinfo?key=${key}`);

    try {
        const apiResponse = await fetchUpstream(url, {
            headers: {
                ...req.headers,
            }
        });

        if (!apiResponse.ok) {
            throw new Error(`API responded with status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error("Error during API request:", error);
        res.status(500).json({ error: error.message });
    }
}
