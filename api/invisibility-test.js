import { fetchUpstream } from '../common/fetch-with-timeout.js';
import { getElinksNetApiConfig } from '../common/elinksnet-config.js';

// If length is not 28 and is not a combination of letters and numbers, return false
function isValidUserID(userID) {
    if (typeof userID !== 'string') {
        console.error("Invalid type for userID");
        return false;
    }
    if (userID.length !== 28 || !/^[a-zA-Z0-9]+$/.test(userID)) {
        console.error("Invalid userID format");
        return false;
    }
    return true;
}

export default async (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: 'No ID provided' });
    }

    // Check if address is valid
    if (!isValidUserID(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const { endpoint, key: apikey } = getElinksNetApiConfig();

    if (!apikey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    const url = new URL(`${endpoint}/getpdresult/${id}?apikey=${apikey}`);

    try {
        const apiResponse = await fetchUpstream(url, {
            headers: {
                ...req.headers,
            }
        });

        // Catch upstream error
        if (!apiResponse.ok) {
            let errorDetail = '';
            try {
                const errorData = await apiResponse.json();
                errorDetail = errorData.message || JSON.stringify(errorData);
            } catch {
                errorDetail = apiResponse.statusText;
            }
            throw new Error(`API responded with status: ${apiResponse.status} - ${errorDetail}`);
        }

        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error("Error during API request:", error);
        res.status(500).json({ error: error.message });
    }

};
