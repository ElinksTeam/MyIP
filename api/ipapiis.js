import net from 'node:net';
import ipapiisHandler from '../server/handlers/ipapi-is.js';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (typeof req.query.ip !== 'string' || net.isIP(req.query.ip) === 0) {
        return res.status(400).json({ error: 'Invalid IP address' });
    }

    return ipapiisHandler(req, res);
}
