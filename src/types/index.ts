export interface Listing {
  listing_id: string;
  listing_url?: string;
  website?: string;
  city_id?: number;
  apartment_name?: string;
  locality: string;
  property_type?: string;
  bedroom: number;
  bathroom?: number;
  balcony?: number;
  floor?: number;
  total_floors?: number;
  furnishing?: string;
  facing_direction?: string;
  covered_parking?: number;
  price: number;
  carpet_area: number;
  super_built_up_area?: number;
  latitude?: number;
  longitude?: number;
  posted_by?: string;
  posted_by_name?: string;
  posted_by_contact?: string;
  project_id?: string | null;
  description?: string;
  posted_at?: string;
  is_verified?: boolean;
  is_live?: boolean;
}

export interface Rental {
  listing_id: string;
  listing_url?: string;
  website?: string;
  city_id?: number;
  title?: string;
  apartment_name?: string;
  locality: string;
  property_type?: string;
  bedroom: number;
  bathroom?: number;
  floor?: number;
  total_floors?: number;
  furnishing?: string;
  facing_direction?: string;
  price: number; // monthly rent in rupees
  deposit?: number; // security deposit in rupees
  maintenance?: number;
  carpet_area: number;
  super_builtup_area?: number;
  latitude?: number;
  longitude?: number;
  posted_by?: string;
  posted_by_name?: string;
  posted_by_contact?: string;
  description?: string;
  posted_at?: string;
}

export interface Project {
  project_id: string;
  project_url?: string;
  city_id?: number;
  apartment_name?: string;
  developer_name?: string;
  locality: string;
  project_status?: string;
  total_units?: number;
  total_towers?: number;
  total_floors?: number;
  launch_date?: string;
  possession_date?: string;
  rera_number?: string;
  min_area_sqft?: number;
  max_area_sqft?: number;
  total_listings?: number;
  price_min: number;
  price_max: number;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
}

export interface AnalyticsSummary {
  city: string;
  total_listings: number;
  median_price: number;
  median_price_per_sqft: number;
  by_locality: Array<{
    locality: string;
    count: number;
    median_price: number;
  }>;
  by_bhk: Array<{
    bedroom: number;
    count: number;
  }>;
}

export interface User {
  email: string;
  name: string;
}

export interface AuthSession {
  token: string;
  token_type: string;
  expires_in: number;
  expires_at: number; // epoch timestamp in ms
  user: User;
}

export type FindingCategory =
  | 'auth'
  | 'pagination'
  | 'units'
  | 'filters'
  | 'sorting'
  | 'timestamps'
  | 'duplicates'
  | 'completeness'
  | 'data_quality'
  | 'fraud'
  | 'consistency'
  | 'missing_endpoint'
  | 'undocumented_endpoint';

export interface Finding {
  endpoint: string;
  category: FindingCategory;
  documented: string;
  actual: string;
  how_found: string;
  impact: string;
  evidence: string[];
}

export interface AnswerKey {
  total_listing_records: number;
  unique_properties: number;
  active_listings: number;
  corrupt_listing_ids: string[];
  total_monthly_rent: number;
  avg_price_per_sqft_2bhk: number;
  costliest_project: {
    project_id: string;
    price_max_inr: number;
  };
  listings_last_7_days: number;
  fake_listing_ids: string[];
  projects_with_wrong_listing_count: number;
}

export interface SubmissionData {
  api_key: string;
  candidate: {
    name: string;
    email: string;
    repo_url: string;
    demo_url: string;
  };
  answers: AnswerKey;
  findings: Finding[];
}
