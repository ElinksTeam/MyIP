import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError, requestJson, withQuery } from '../frontend/services/api-client.js';

describe('withQuery()', () => {
  it('encodes values and omits empty parameters', () => {
    assert.equal(
      withQuery('/api/rdap', { query: 'AS 13335', empty: '', missing: undefined }),
      '/api/rdap?query=AS+13335'
    );
  });

  it('appends to an existing query string', () => {
    assert.equal(withQuery('/api/test?lang=zh', { ip: '1.1.1.1' }), '/api/test?lang=zh&ip=1.1.1.1');
  });
});

describe('requestJson()', () => {
  it('normalizes successful JSON responses', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
    try {
      assert.deepEqual(await requestJson('/api/test'), { ok: true });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('throws a structured ApiError for HTTP failures', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Unavailable' }), { status: 503 });
    try {
      await assert.rejects(
        requestJson('/api/test'),
        error => error instanceof ApiError && error.status === 503 && error.message === 'Unavailable'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
