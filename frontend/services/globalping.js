import { requestJson } from './api-client.js';

const BASE_URL = 'https://api.globalping.io/v1/measurements';

export const GLOBALPING_LOCATIONS = Object.freeze([
  'HK', 'TW', 'CN', 'JP', 'SG', 'IN', 'RU', 'US',
  'CA', 'AU', 'GB', 'DE', 'BR', 'ZA', 'KR', 'FR',
].map(country => ({ country })));

export async function createMeasurement(payload, options = {}) {
  return requestJson(BASE_URL, {
    method: 'POST',
    body: payload,
    timeout: 15000,
    ...options,
  });
}

export async function waitForMeasurement(id, {
  interval = 1000,
  maxAttempts = 5,
  onUpdate,
  signal,
} = {}) {
  let latest = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, interval);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(signal.reason || new Error('Cancelled'));
        }, { once: true });
      });
    }
    latest = await requestJson(`${BASE_URL}/${encodeURIComponent(id)}`, { signal, timeout: 15000 });
    onUpdate?.(latest);
    if (latest.status !== 'in-progress') return latest;
  }
  return latest;
}
