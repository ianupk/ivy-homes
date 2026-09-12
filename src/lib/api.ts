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
  private authToken: string = '';

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

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  private getTokenFromStorage(): string {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem('ivy_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.token || parsed.access_token || '';
      }
    } catch (e) {
      // ignore
    }
    return '';
  }

  private getRefreshTokenFromStorage(): string {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem('ivy_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.refresh_token || '';
      }
    } catch (e) {
      // ignore
    }
    return '';
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    const bearer = token || this.authToken || this.getTokenFromStorage();
    if (bearer) {
      headers['Authorization'] = `Bearer ${bearer}`;
    }
    return headers;
  }

  private buildUrl(path: string, params: Record<string, any> = {}): string {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async healthCheck(): Promise<any> {
    try {
      const res = await fetch(this.buildUrl('/health'), {
        headers: this.getHeaders(),
      });
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
    const token = data.access_token || data.token;
    this.authToken = token;

    const session: AuthSession = {
      token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 900,
      expires_at: Date.now() + (data.expires_in || 900) * 1000,
      user: {
        email: data.user?.email || email,
        name: data.user?.name || (data.user?.email || email).split('@')[0],
      },
    };
    return session;
  }

  async refresh(refreshToken?: string): Promise<AuthSession | null> {
    const rToken = refreshToken || this.getRefreshTokenFromStorage();
    if (!rToken) return null;

    try {
      const res = await fetch(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refresh_token: rToken }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      const token = data.access_token || data.token;
      this.authToken = token;

      const session: AuthSession = {
        token,
        refresh_token: data.refresh_token || rToken,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 900,
        expires_at: Date.now() + (data.expires_in || 900) * 1000,
        user: {
          email: data.user?.email || 'user',
          name: data.user?.name || (data.user?.email || 'user').split('@')[0],
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ivy_session', JSON.stringify(session));
      }
      return session;
    } catch (e) {
      return null;
    }
  }

  async logout(token?: string): Promise<void> {
    try {
      await fetch(this.buildUrl('/auth/logout'), {
        method: 'POST',
        headers: this.getHeaders(token),
      });
    } catch (e) {
      console.warn('Logout request failed', e);
    } finally {
      this.authToken = '';
    }
  }

  async getListings(params: QueryParams = {}): Promise<{ total: number; page: number; page_size: number; results: Listing[] }> {
    try {
      const query: Record<string, any> = { ...params };
      if (query.page && query.offset === undefined) {
        const limit = query.limit || 20;
        query.offset = (query.page - 1) * limit;
      }
      const res = await fetch(this.buildUrl('/v1/listings', query), {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];
      const total = data.total ?? results.length;
      const page = params.page || (data.offset !== undefined && data.limit ? Math.floor(data.offset / data.limit) + 1 : 1);
      const page_size = data.limit || params.limit || 20;
      return { total, page, page_size, results };
    } catch (e) {
      console.warn('Falling back to empty listings:', e);
      return { total: 0, page: 1, page_size: 20, results: [] };
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    const paths = [`/v1/listings/${id}`, `/v1/listing/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path), {
          headers: this.getHeaders(),
        });
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
        const res = await fetch(this.buildUrl(path), {
          headers: this.getHeaders(),
        });
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
      const query: Record<string, any> = { ...params };
      if (query.page && query.offset === undefined) {
        const limit = query.limit || 20;
        query.offset = (query.page - 1) * limit;
      }
      const res = await fetch(this.buildUrl('/v1/rentals', query), {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];
      const total = data.total ?? results.length;
      const page = params.page || 1;
      const page_size = data.limit || params.limit || 20;
      return { total, page, page_size, results };
    } catch (e) {
      return { total: 0, page: 1, page_size: 20, results: [] };
    }
  }

  async getRentalById(id: string): Promise<Rental | null> {
    const paths = [`/v1/rentals/${id}`, `/v1/rental/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path), {
          headers: this.getHeaders(),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  async getProjects(params: QueryParams = {}): Promise<{ total: number; page: number; page_size: number; results: Project[] }> {
    try {
      const query: Record<string, any> = { ...params };
      if (query.page && query.offset === undefined) {
        const limit = query.limit || 20;
        query.offset = (query.page - 1) * limit;
      }
      const res = await fetch(this.buildUrl('/v1/projects', query), {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];
      const total = data.total ?? results.length;
      const page = params.page || 1;
      const page_size = data.limit || params.limit || 20;
      return { total, page, page_size, results };
    } catch (e) {
      return { total: 0, page: 1, page_size: 20, results: [] };
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    const paths = [`/v1/projects/${id}`, `/v1/project/${id}`];
    for (const path of paths) {
      try {
        const res = await fetch(this.buildUrl(path), {
          headers: this.getHeaders(),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    try {
      const res = await fetch(this.buildUrl('/v1/analytics/summary'), {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async getFavourites(token?: string): Promise<Listing[]> {
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
