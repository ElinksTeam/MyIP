import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergeIpSourceResults } from '../frontend/utils/merge-ip-sources.js';

describe('mergeIpSourceResults', () => {
  it('fuses complementary fields and records every successful source', () => {
    const merged = mergeIpSourceResults([
      { source: { id: 1, text: 'IPinfo.io' }, data: { country_name: 'Thailand', asn: 'AS133481' } },
      { source: { id: 4, text: 'IP2Location.io' }, data: { city: 'Bangkok', region: 'Bangkok', isp: 'AIS Fibre' } },
      { source: { id: 3, text: 'IPAPI.is' }, data: { type: 'Residential', isProxy: 'No' } },
    ]);
    assert.equal(merged.country_name, 'Thailand');
    assert.equal(merged.city, 'Bangkok');
    assert.equal(merged.isp, 'AIS Fibre');
    assert.equal(merged.type, 'Residential');
    assert.deepEqual(merged.dataSources, ['IP2Location.io', 'IPAPI.is', 'IPinfo.io']);
    assert.equal(merged.sourceCount, 3);
  });

  it('uses the configured quality priority when sources disagree', () => {
    const merged = mergeIpSourceResults([
      { source: { id: 7, text: 'IPWho.is' }, data: { city: 'Old city' } },
      { source: { id: 4, text: 'IP2Location.io' }, data: { city: 'Preferred city' } },
    ]);
    assert.equal(merged.city, 'Preferred city');
  });
});
