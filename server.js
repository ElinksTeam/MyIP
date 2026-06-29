import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { slowDown } from 'express-slow-down'
import rateLimit from 'express-rate-limit';
import { requireReferer, requireValidIP } from './common/guards.js';

// Backend API handlers live outside /api so Vercel bundles this Express app
// as one function instead of counting every handler as a separate function.
import mapHandler from './server/handlers/google-map.js';
// IP Info
import ipinfoHandler from './server/handlers/ipinfo-io.js';
import ipapicomHandler from './server/handlers/ipapi-com.js';
import elinksNetIpHandler from './server/handlers/elinksnet-ip.js';
import ipapiisHandler from './server/handlers/ipapi-is.js';
import ip2locationHandler from './server/handlers/ip2location-io.js';
import ipsbHandler from './server/handlers/ip-sb.js';
import ipWhoIsHandler from './server/handlers/ipwho-is.js';
import maxmindHandler from './server/handlers/maxmind.js';
// Others
import cfHander from './server/handlers/cf-radar.js';
import dnsResolver from './server/handlers/dns-resolver.js';
import getWhois from './server/handlers/get-whois.js';
import invisibilitytestHandler from './server/handlers/invisibility-test.js';
import macChecker from './server/handlers/mac-checker.js';
import aiSecurityAdvice from './server/handlers/ai-security-advice.js';
import { cliGeoHandler, cliIpHandler } from './server/handlers/cli-api.js';
// User
import validateConfigs from './server/handlers/configs.js';
import getUserinfo from './server/handlers/get-user-info.js';
import updateUserAchievement from './server/handlers/update-user-achievement.js';
import { reloadMaxMindDatabases, startMaxMindFileWatcher } from './common/maxmind-service.js';
import { startMaxMindAutoUpdate } from './common/maxmind-updater.js';

dotenv.config();

// File watchers and scheduled database updates belong to the long-running local
// server. Serverless instances must stay stateless and use bundled data only.
if (!process.env.VERCEL) {
    reloadMaxMindDatabases('startup').catch(() => {
        console.error('MaxMind API will return 503 until databases are loaded successfully');
    });
    startMaxMindFileWatcher();
    startMaxMindAutoUpdate({ reload: reloadMaxMindDatabases });
}

const app = express();
const blackListIPLogFilePath = process.env.SECURITY_BLACKLIST_LOG_FILE_PATH || 'logs/blacklist-ip.log';
const rateLimitSet = parseInt(process.env.SECURITY_RATE_LIMIT || 0, 10);
const speedLimitSet = parseInt(process.env.SECURITY_DELAY_AFTER || 0, 10);

app.set('trust proxy', 1);

// Helper function to get client IP
function getClientIp(req) {
    const cfIp = req.headers['cf-connecting-ip']; // Cloudflare IP
    const forwardedIps = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : null;
    const cfIpV6 = req.headers['cf-connecting-ipv6'];
    return cfIp || forwardedIps || cfIpV6 || req.ip;
}

// Format timestamp for rate limit log using Shanghai time zone
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
}

// Write IP that triggered the limit to the log and count the number of times the same IP was limited
function logLimitedIP(ip) {
    const logPath = path.join(__dirname, blackListIPLogFilePath);

    // If logs directory does not exist, create it
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log('Created log directory:', logDir);
    }

    // Read log file, update IP count, create new log file if it does not exist
    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading the log file:', err);
            return;
        }

        const now = Date.now();
        let newCount = 1;
        let logExists = false;
        let updatedData = '';

        if (data) {
            const lines = data.split('\n');
            updatedData = lines.map(line => {
                const [currentIp, count, timestamp] = line.split(',');
                if (currentIp === ip) {
                    newCount = parseInt(count, 10) + 1;
                    logExists = true;
                    console.log(`IP ${ip} has been limited ${newCount} times`);
                    return `${ip},${newCount},${timestamp}`;  // Update count but keep the original timestamp
                }
                return line;
            }).join('\n');
        }

        if (!logExists) {
            const newLine = `${ip},${newCount},${formatDate(now)}`;
            updatedData += (updatedData ? '\n' : '') + newLine;
            console.log(`IP ${ip} has been limited for the first time`);
        }

        fs.writeFile(logPath, updatedData, 'utf8', err => {
            if (err) {
                console.error('Failed to write to log file:', err);
            }
        });
    });
}

const rateLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: rateLimitSet,
    message: 'Too Many Requests',
    // Handle requests that exceed the rate limit threshold, and record the IP that triggered the limit as needed
    handler: (req, res, next) => {
        const ip = getClientIp(req);
        if (req.rateLimit.current === req.rateLimit.limit + 1 && blackListIPLogFilePath) {
            logLimitedIP(ip);
        }
        res.status(429).json({ message: 'Too Many Requests' });
    }
});

const speedLimiter = slowDown({
	windowMs: 60 * 60 * 1000,
	delayAfter: speedLimitSet,
    // Increase response delay gradually based on the number of hits
	delayMs: (hits) => hits * 400,
})

// If rateLimitSet is 0, do not enable rate limiting
if (rateLimitSet !== 0) {
    app.use('/api', rateLimiter);
    console.log('Rate limiter is enabled, limit:', rateLimitSet, 'requests per 60 minutes');
}

// If delayAfter is 0, do not enable delay
if (speedLimitSet !== 0) {
    app.use('/api', speedLimiter);
    console.log('Speed limiter is enabled, slowing down after:', speedLimitSet, 'requests');
}

app.use(express.json());

const cliRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).type('text/plain').send('Too Many Requests\n');
    },
});

// Public CLI endpoints intentionally work without a Referer or API key.
app.get('/api/cli/ip', cliRateLimiter, cliIpHandler);
app.get('/api/cli/geo', cliRateLimiter, cliGeoHandler);

// Global referer gate for all /api/* routes. Handlers no longer repeat this
// check individually — see common/guards.js.
app.use('/api', requireReferer);

// APIs. Routes that validate an `?ip=` param attach requireValidIP() so the
// handler body no longer repeats the check.
app.get('/api/map', mapHandler);
app.get('/api/ipinfo', requireValidIP(), ipinfoHandler);
app.get('/api/ipapicom', requireValidIP(), ipapicomHandler);
app.get('/api/elinksnet', requireValidIP(), elinksNetIpHandler);
// Compatibility alias for older clients.
app.get('/api/ipchecking', requireValidIP(), elinksNetIpHandler);
app.get('/api/ipsb', requireValidIP(), ipsbHandler);
app.get('/api/ipwhois', requireValidIP(), ipWhoIsHandler);
app.get('/api/cfradar', cfHander);
app.get('/api/dnsresolver', dnsResolver);
app.get('/api/whois', getWhois);
app.get('/api/ipapiis', requireValidIP(), ipapiisHandler);
app.get('/api/ip2location', requireValidIP(), ip2locationHandler);
app.get('/api/invisibility', invisibilitytestHandler);
app.get('/api/macchecker', macChecker);
app.get('/api/maxmind', requireValidIP(), maxmindHandler);
app.get('/api/getuserinfo', getUserinfo);
app.put('/api/updateuserachievement', updateUserAchievement);
app.post('/api/ai/security-advice', aiSecurityAdvice);

// Handle all configuration requests using query parameters
app.get('/api/configs', validateConfigs);

// Set static file server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, './dist')));


// Vercel detects this root-level Express export and deploys all routes as one
// function. backend-server.js adds the local listener for npm run dev/start.
export default app;
