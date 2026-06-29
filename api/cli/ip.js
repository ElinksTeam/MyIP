import rateLimit from 'express-rate-limit';
import { cliIpHandler } from '../../server/handlers/cli-api.js';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    validate: false,
    handler: (req, res) => {
        res.status(429).setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send('Too Many Requests\n');
    },
});

export default function handler(req, res) {
    return limiter(req, res, () => cliIpHandler(req, res));
}
