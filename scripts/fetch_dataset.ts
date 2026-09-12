import fs from 'fs';
import path from 'path';

const API_BASE = process.env.NEXT_PUBLIC_IVY_API_BASE || process.env.IVY_API_BASE || 'https://solve.ivy.homes';
const API_KEY = process.env.NEXT_PUBLIC_IVY_API_KEY || process.env.IVY_API_KEY || '';

const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchAll(endpoint: string, resourceName: string) {
  console.log(`\nFetching all records for ${resourceName} from ${endpoint}...`);
  let page = 1;
  const limit = 100;
  let allResults: any[] = [];
  let totalReported = 0;

  while (true) {
    const url = new URL(`${API_BASE}${endpoint}`);
    if (API_KEY) {
      url.searchParams.set('api_key', API_KEY);
    }
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.error(`Error fetching page ${page} of ${resourceName}: HTTP ${res.status}`);
        break;
      }
      const data = await res.json();
      totalReported = data.total ?? totalReported;
      const results = data.results || [];
      if (results.length === 0) {
        break;
      }

      allResults.push(...results);
      console.log(`  Page ${page}: got ${results.length} records (cumulative: ${allResults.length}/${totalReported})`);

      if (results.length < limit || allResults.length >= totalReported) {
        break;
      }
      page++;
    } catch (err) {
      console.error(`Network error on page ${page}:`, err);
      break;
    }
  }

  const outPath = path.join(DATA_DIR, `${resourceName}.json`);
  fs.writeFileSync(outPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`Saved ${allResults.length} records to ${outPath}`);
  return allResults;
}

async function fetchAnalytics() {
  console.log(`\nFetching /v1/analytics/summary...`);
  const url = new URL(`${API_BASE}/v1/analytics/summary`);
  if (API_KEY) url.searchParams.set('api_key', API_KEY);

  try {
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      const outPath = path.join(DATA_DIR, 'analytics.json');
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Saved analytics summary to ${outPath}`);
      return data;
    }
  } catch (err) {
    console.error('Failed to fetch analytics summary:', err);
  }
}

async function main() {
  console.log(`=== Ivy Homes Data Ingestion ===`);
  console.log(`API Base: ${API_BASE}`);
  console.log(`API Key: ${API_KEY ? `${API_KEY.slice(0, 8)}...` : 'NONE PROVIDED'}`);

  if (!API_KEY || API_KEY.includes('DEMO-KEY')) {
    console.warn(`\n[WARNING] No valid API key configured! Please set IVY_API_KEY in .env.local.`);
  }

  await fetchAll('/v1/listings', 'listings');
  await fetchAll('/v1/rentals', 'rentals');
  await fetchAll('/v1/projects', 'projects');
  await fetchAnalytics();

  console.log('\nDataset ingestion complete!');
}

main().catch(console.error);
