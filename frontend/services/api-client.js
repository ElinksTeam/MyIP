export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function withQuery(path, params = {}) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => [key, String(value)]);
  if (!entries.length) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${new URLSearchParams(entries).toString()}`;
}

export async function requestJson(url, options = {}) {
  const {
    timeout = 10000,
    body,
    headers = {},
    signal,
    ...requestOptions
  } = options;
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });

  const timer = setTimeout(() => controller.abort(new Error('Request timed out')), timeout);
  try {
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }
    if (!response.ok) {
      const message = payload?.error || payload?.message || `Request failed with status ${response.status}`;
      throw new ApiError(message, {
        status: response.status,
        code: payload?.code || 'HTTP_ERROR',
        details: payload,
      });
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('Request was cancelled or timed out', {
        code: signal?.aborted ? 'CANCELLED' : 'TIMEOUT',
      });
    }
    throw new ApiError(error?.message || 'Network request failed', { code: 'NETWORK_ERROR' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export const api = {
  get: (url, options) => requestJson(url, options),
  configs: () => requestJson('/api/configs', { cache: 'no-store' }),
  aiAdvice: payload => requestJson('/api/ai/security-advice', {
    method: 'POST',
    body: payload,
    timeout: 30000,
  }),
  asn: asn => requestJson(withQuery('/api/cfradar', { asn })),
  dns: (hostname, type) => requestJson(withQuery('/api/dnsresolver', { hostname, type })),
  mac: mac => requestJson(withQuery('/api/macchecker', { mac })),
  proxyRisk: ip => requestJson(withQuery('/api/proxy-risk', { ip })),
  rdap: query => requestJson(withQuery('/api/rdap', { query })),
  whois: query => requestJson(withQuery('/api/whois', { q: query })),
};
