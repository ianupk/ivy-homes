import { Listing, Rental, Project, AnalyticsSummary, AuthSession } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_IVY_API_BASE || 'https://solve.ivy.homes';
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_IVY_API_KEY || '';

export interface QueryParams {
  page?: number;
  limit?: number;
  locality?: string;
  bhk?: number;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  furnishing?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl = API_BASE, apiKey = DEFAULT_API_KEY) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildUrl(path: string, params: Record<string, any> = {}): string {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    if (this.apiKey) {
      url.searchParams.set('api_key', this.apiKey);
    }
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async healthCheck(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', error: String(e) };
    }
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const res = await fetch(this.buildUrl('/auth/login'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    const session: AuthSession = {
      token: data.token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 86400,
      expires_at: Date.now() + (data.expires_in || 86400) * 1000,
      user: data.user,
    };
    return session;
  }

  async logout(token: string): Promise<void> {
    try {
      await fetch(this.buildUrl('/auth/logout'), {
        method: 'POST',
        headers: this.getHeaders(token),
      });
    } catch (e) {
      console.warn('Logout request failed', e);
    }
  }

  async getListings(params: QueryParams = {}): Promise<{ total: number; page: number; page_size: number; results: Listing[] }> {
    try {
      const res = await fetch(this.buildUrl('/v1/listings', params));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Falling back to empty/mock listings:', e);
      return { total: 0, page: 1, page_size: 20, results: [] };
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    // Attempt standard REST path /v1/listings/{id}, fallback to /v1/listing/{id}
    const paths = [`/v1/listings/${id}`, `/v1/listing/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path));
        if (res.ok) return await res.json();
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  async getSimilarListings(id: string): Promise<Listing[]> {
    const paths = [`/v1/listings/${id}/comparables`, `/v1/listings/comparable/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path));
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : data.results || [];
        }
      } catch (e) {
        // continue
      }
    }
    return [];
  }

  async getRentals(params: QueryParams = {}): Promise<{ total: number; page: number; page_size: number; results: Rental[] }> {
    try {
      const res = await fetch(this.buildUrl('/v1/rentals', params));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { total: 0, page: 1, page_size: 20, results: [] };
    }
  }

  async getRentalById(id: string): Promise<Rental | null> {
    const paths = [`/v1/rentals/${id}`, `/v1/rental/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path));
        if (res.ok) return await res.json();
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  async getProjects(params: QueryParams = {}): Promise<{ total: number; page: number; page_size: number; results: Project[] }> {
    try {
      const res = await fetch(this.buildUrl('/v1/projects', params));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { total: 0, page: 1, page_size: 20, results: [] };
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    const paths = [`/v1/projects/${id}`, `/v1/project/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path));
        if (res.ok) return await res.json();
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    try {
      const res = await fetch(this.buildUrl('/v1/analytics/summary'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async getFavourites(token?: string): Promise<Listing[]> {
    if (!token) return [];
    try {
      const res = await fetch(this.buildUrl('/v1/favourites'), {
        headers: this.getHeaders(token),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (e) {
      return [];
    }
  }

  async addFavourite(listingId: string, token?: string): Promise<boolean> {
    if (!token) return false;
    try {
      const res = await fetch(this.buildUrl('/v1/favourites'), {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ id: listingId, listing_id: listingId }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async removeFavourite(listingId: string, token?: string): Promise<boolean> {
    if (!token) return false;
    const paths = [`/v1/favourites/${listingId}`, `/v1/favourites`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path), {
          method: 'DELETE',
          headers: this.getHeaders(token),
          body: path.endsWith('/favourites') ? JSON.stringify({ id: listingId, listing_id: listingId }) : undefined,
        });
        if (res.ok) return true;
      } catch (e) {
        // continue
      }
    }
    return false;
  }
}

export const api = new ApiClient();
