import { transformDataFromIPapi } from './transform-ip-data.js';

const SOURCE_PRIORITY = new Map([4, 3, 7, 1, 5, 2, 6, 0].map((id, index) => [id, index]));
const MERGE_FIELDS = [
  'country_name', 'country_code', 'region', 'city', 'district', 'postalCode',
  'timezone', 'continent', 'latitude', 'longitude', 'isp', 'networkOrganization',
  'networkClass', 'asn', 'asnlink', 'type', 'isProxy', 'isNativeIP', 'qualityScore',
  'proxyProtocol', 'proxyOperator',
];

const hasValue = value =>
  value !== undefined && value !== null && value !== '' && value !== 'N/A'
  && value !== 'unknown' && value !== 'sign_in_required';

export function mergeIpSourceResults(results) {
  const ordered = [...results].sort((a, b) =>
    (SOURCE_PRIORITY.get(a.source.id) ?? 99) - (SOURCE_PRIORITY.get(b.source.id) ?? 99)
  );
  const merged = {};

  for (const { data } of ordered) {
    for (const field of MERGE_FIELDS) {
      if (!hasValue(merged[field]) && hasValue(data[field])) {
        merged[field] = data[field];
      }
    }
  }

  merged.dataSources = ordered.map(item => item.source.text);
  merged.sourceCount = ordered.length;
  return merged;
}

export async function fetchMergedIpDetails({ store, ip, language, t }) {
  const { authenticatedFetch } = await import('./authenticated-fetch.js');
  const providers = store.ipDBs.filter(source => source.enabled);
  const locale = language === 'zh' ? 'zh-CN' : language;
  const settled = await Promise.allSettled(providers.map(async source => {
    const response = await authenticatedFetch(store.getDbUrl(source.id, ip, locale));
    return {
      source,
      data: transformDataFromIPapi(response, source.id, t, language),
    };
  }));
  const results = settled
    .filter(item => item.status === 'fulfilled' && item.value?.data)
    .map(item => item.value);

  if (!results.length) {
    throw new Error(`No IP data provider returned usable data for ${ip}`);
  }
  return mergeIpSourceResults(results);
}
