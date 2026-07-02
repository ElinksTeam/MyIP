// Centralized configuration for ElinksNet's optional private API integration.
// Legacy IPCHECKING_* names remain as read-only fallbacks for existing deployments.
export function getElinksNetApiConfig() {
    return {
        endpoint: process.env.ELINKSNET_API_ENDPOINT || process.env.IPCHECKING_API_ENDPOINT || '',
        key: process.env.ELINKSNET_API_KEY || process.env.IPCHECKING_API_KEY || '',
    };
}
