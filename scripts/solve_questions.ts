import fs from 'fs';
import path from 'path';
import { AnswerKey, Finding, SubmissionData } from '../src/types';
import { runAudit } from './audit_api';

const DATA_DIR = path.join(__dirname, '../data');
const ASSIGNED_LOCALITY = (process.env.IVY_ASSIGNED_LOCALITY || 'koramangala').toLowerCase().trim();
const API_KEY = process.env.NEXT_PUBLIC_IVY_API_KEY || process.env.IVY_API_KEY || 'IVY26-DEMO-KEY';
const CANDIDATE_NAME = process.env.CANDIDATE_NAME || 'Candidate Name';
const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL || 'candidate@example.com';
const REPO_URL = process.env.REPO_URL || 'https://github.com/candidate/ivy-assignment';
const DEMO_URL = process.env.DEMO_URL || 'https://ivy-assignment.vercel.app';

// REFERENCE = 2026-09-10T00:00:00+05:30 (IST)
const REF_TIMESTAMP = new Date('2026-09-10T00:00:00+05:30').getTime();
const REF_MINUS_7_DAYS = REF_TIMESTAMP - 7 * 24 * 60 * 60 * 1000;

function loadData(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return [];
}

export function computeAnswers(): AnswerKey {
  const listings = loadData('listings.json');
  const rentals = loadData('rentals.json');
  const projects = loadData('projects.json');

  // 1. total_listing_records
  const total_listing_records = listings.length;

  // 4. corrupt_listing_ids (A small number of listing records describe something that cannot exist)
  const corruptSet = new Set<string>();
  listings.forEach((item) => {
    const isCorrupt =
      (item.carpet_area !== undefined && item.carpet_area <= 0) ||
      (item.price !== undefined && item.price <= 0) ||
      (item.bedroom !== undefined && item.bedroom <= 0) ||
      (item.floor !== undefined && item.total_floors !== undefined && item.floor > item.total_floors && item.total_floors > 0);
    if (isCorrupt) {
      corruptSet.add(item.listing_id);
    }
  });
  const corrupt_listing_ids = Array.from(corruptSet).sort();

  // 9. fake_listing_ids (Listings that exist purely to generate enquiries)
  const fakeSet = new Set<string>();
  // Analyze seller contacts or placeholder patterns
  const contactMap = new Map<string, any[]>();
  listings.forEach((item) => {
    if (item.posted_by_contact) {
      const list = contactMap.get(item.posted_by_contact) || [];
      list.push(item);
      contactMap.set(item.posted_by_contact, list);
    }
  });

  for (const [_, items] of contactMap.entries()) {
    // If an agent posts an excessive number of identical price/specs across different areas
    if (items.length >= 8) {
      items.forEach((item) => fakeSet.add(item.listing_id));
    }
  }
  const fake_listing_ids = Array.from(fakeSet).sort();

  // 2. unique_properties (deduplicated distinct properties)
  const propertyKeySet = new Set<string>();
  listings.forEach((item) => {
    const key = `${(item.apartment_name || item.locality).toLowerCase().trim()}_${item.bedroom}_${item.floor || 0}_${item.carpet_area || 0}`;
    propertyKeySet.add(key);
  });
  const unique_properties = propertyKeySet.size;

  // 3. active_listings (is_live === true)
  const active_listings = listings.filter((item) => item.is_live === true).length;

  // 5. total_monthly_rent (across assigned locality)
  const total_monthly_rent = rentals
    .filter((item) => (item.locality || '').toLowerCase().trim() === ASSIGNED_LOCALITY)
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // 6. avg_price_per_sqft_2bhk
  // Across live 2bhk listings, leaving out records in 4 and 9: mean of price / carpet_area, to 2 decimals
  const excludedSet = new Set([...corrupt_listing_ids, ...fake_listing_ids]);
  const eligible2bhk = listings.filter((item) => {
    return (
      item.is_live === true &&
      item.bedroom === 2 &&
      !excludedSet.has(item.listing_id) &&
      item.carpet_area > 0 &&
      item.price > 0
    );
  });

  const avg_price_per_sqft_2bhk =
    eligible2bhk.length > 0
      ? Number(
          (
            eligible2bhk.reduce((sum, item) => sum + item.price / item.carpet_area, 0) /
            eligible2bhk.length
          ).toFixed(2)
        )
      : 0;

  // 7. costliest_project: project with highest maximum price as { project_id: ..., price_max_inr: ... }
  let costliest: { project_id: string; price_max_inr: number } = { project_id: '', price_max_inr: 0 };
  projects.forEach((proj) => {
    const maxPrice = Number(proj.price_max) || 0;
    if (maxPrice > costliest.price_max_inr) {
      costliest = {
        project_id: proj.project_id,
        price_max_inr: maxPrice,
      };
    }
  });

  // 8. listings_last_7_days: posted in [REFERENCE - 7 days, REFERENCE) in IST
  const listings_last_7_days = listings.filter((item) => {
    if (!item.posted_at) return false;
    const postTime = new Date(item.posted_at).getTime();
    return postTime >= REF_MINUS_7_DAYS && postTime < REF_TIMESTAMP;
  }).length;

  // 10. projects_with_wrong_listing_count
  const projectListingCounts = new Map<string, number>();
  listings.forEach((item) => {
    if (item.project_id) {
      projectListingCounts.set(item.project_id, (projectListingCounts.get(item.project_id) || 0) + 1);
    }
  });

  let wrongCount = 0;
  projects.forEach((proj) => {
    const actualCount = projectListingCounts.get(proj.project_id) || 0;
    if (proj.total_listings !== undefined && proj.total_listings !== actualCount) {
      wrongCount++;
    }
  });

  return {
    total_listing_records,
    unique_properties,
    active_listings,
    corrupt_listing_ids,
    total_monthly_rent,
    avg_price_per_sqft_2bhk,
    costliest_project: costliest,
    listings_last_7_days,
    fake_listing_ids,
    projects_with_wrong_listing_count: wrongCount,
  };
}

export async function generateSubmission(): Promise<SubmissionData> {
  const answers = computeAnswers();
  const findings = await runAudit();

  const submission: SubmissionData = {
    api_key: API_KEY,
    candidate: {
      name: CANDIDATE_NAME,
      email: CANDIDATE_EMAIL,
      repo_url: REPO_URL,
      demo_url: DEMO_URL,
    },
    answers,
    findings,
  };

  const outPath = path.join(__dirname, '../submission.json');
  fs.writeFileSync(outPath, JSON.stringify(submission, null, 2), 'utf-8');
  console.log(`Generated submission file at ${outPath}`);
  return submission;
}

if (require.main === module) {
  generateSubmission().then((sub) => {
    console.log('Submission calculated successfully:');
    console.log(JSON.stringify(sub.answers, null, 2));
  });
}
