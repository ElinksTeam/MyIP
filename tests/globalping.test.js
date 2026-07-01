import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GLOBALPING_LOCATIONS } from '../frontend/services/globalping.js';

describe('GLOBALPING_LOCATIONS', () => {
  it('contains 16 unique country probes', () => {
    assert.equal(GLOBALPING_LOCATIONS.length, 16);
    assert.equal(new Set(GLOBALPING_LOCATIONS.map(item => item.country)).size, 16);
  });
});
