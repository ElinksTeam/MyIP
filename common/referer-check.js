// dotenv.config() is called once in backend-server.js before any handler
// imports this module, so process.env.ALLOWED_DOMAINS is already populated.
// Avoid the duplicate call to keep this a pure, fast function.

function refererCheck(referer) {
    if (!referer) return false;

    const configuredDomains = (process.env.ALLOWED_DOMAINS || '')
        .split(',')
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean);
    const allowedDomains = new Set(['localhost', '127.0.0.1', '::1', '[::1]', ...configuredDomains]);

    try {
        const domain = new URL(referer).hostname.toLowerCase();
        return allowedDomains.has(domain);
    } catch {
        return false;
    }
}

export { refererCheck };
