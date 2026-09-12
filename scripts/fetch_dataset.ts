import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const API_BASE = (process.env.NEXT_PUBLIC_IVY_API_BASE || process.env.IVY_API_BASE || 'https://solve.ivy.homes').replace(/\/$/, '');
const API_KEY = process.env.IVY_API_KEY || process.env.NEXT_PUBLIC_IVY_API_KEY || '';
const DEMO_PASSWORD = process.env.IVY_DEMO_PASSWORD || process.env.NEXT_PUBLIC_DEMO_PASSWORD || '';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let authToken = '';

async function login(): Promise<string> {
  console.log(`Authenticating with Ivy Homes API...`);
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        email: 'demo1@ivy.homes',
        password: DEMO_PASSWORD,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(`Login failed: ${res.status} - ${err.detail || JSON.stringify(err)}`);
    }

    const data = await res.json();
    const token = data.access_token || data.token;
    console.log(`Authentication successful! Bearer token obtained.`);
    return token;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function fetchAll(endpoint: string, resourceName: string) {
  console.log(`\nFetching all records for ${resourceName} from ${endpoint}...`);
  let offset = 0;
  const limit = 50;
  let allResults: any[] = [];
  let totalReported = 0;

  while (true) {
    const url = new URL(`${API_BASE}${endpoint}`);
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));

    try {
      const res = await fetch(url.toString(), {
        headers: getHeaders(),
      });
      if (!res.ok) {
        console.error(`Error fetching offset ${offset} of ${resourceName}: HTTP ${res.status}`);
        break;
      }
      const data = await res.json();
      totalReported = data.total ?? totalReported;
      const results = data.results || [];
      if (results.length === 0) {
        break;
      }

      allResults.push(...results);
      console.log(`  Offset ${offset}: got ${results.length} records (cumulative: ${allResults.length}, reported total: ${totalReported})`);

      if (data.has_more === false) {
        break;
      }
      offset += results.length;
    } catch (err) {
      console.error(`Network error at offset ${offset}:`, err);
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

  try {
    const res = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const outPath = path.join(DATA_DIR, 'analytics.json');
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Saved analytics summary to ${outPath}`);
      return data;
    } else {
      console.error(`Analytics summary error: HTTP ${res.status}`);
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

  authToken = await login();

  await fetchAll('/v1/listings', 'listings');
  await fetchAll('/v1/rentals', 'rentals');
  await fetchAll('/v1/projects', 'projects');
  await fetchAnalytics();

  console.log('\nDataset ingestion complete!');
}

main().catch(console.error);
