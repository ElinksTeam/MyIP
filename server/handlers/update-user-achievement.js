import { fetchUpstream } from '../../common/fetch-with-timeout.js';
import { getElinksNetApiConfig } from '../../common/elinksnet-config.js';

export default async (req, res) => {
    // defensive; app.put() in backend-server.js already gates method
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { endpoint, key } = getElinksNetApiConfig();

    if (!key) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    const achievement = req.body;
    if (!achievement) {
        return res.status(400).json({ error: 'Achievement name is required' });
    }

    // Build request
    const url = new URL(`${endpoint}/updateuserachievements?key=${key}`);

    try {
        const apiResponse = await fetchUpstream(url, {
            method: 'PUT',
            headers: {
                ...req.headers,
            },
            body: JSON.stringify(req.body),
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
