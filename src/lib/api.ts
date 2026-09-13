import { Listing, Rental, Project, AnalyticsSummary, AuthSession, User } from '@/types';

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
  private tokenExpiresAt: number = 0;
  private guestToken: string = '';
  private guestTokenExpiresAt: number = 0;
  private refreshPromise: Promise<AuthSession | null> | null = null;
  private loginPromise: Promise<string> | null = null;

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

  setAuthToken(token: string, expiresAt: number = 0) {
    this.authToken = token;
    this.tokenExpiresAt = expiresAt;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  getSessionFromStorage(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('ivy_session');
      if (stored) {
        return JSON.parse(stored) as AuthSession;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  getTokenFromStorage(): string {
    const session = this.getSessionFromStorage();
    if (!session) return '';
    if (session.expires_at && session.expires_at <= Date.now()) {
      return '';
    }
    return session.token || '';
  }

  getRefreshTokenFromStorage(): string {
    const session = this.getSessionFromStorage();
    return session?.refresh_token || '';
  }

  private isTokenExpired(expiresAt: number, bufferSeconds = 60): boolean {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - bufferSeconds * 1000;
  }

  private async ensureToken(): Promise<string> {
    const existing = this.authToken || this.getTokenFromStorage();
    if (existing && !this.isTokenExpired(this.tokenExpiresAt, 30)) {
      return existing;
    }

    if (this.guestToken && !this.isTokenExpired(this.guestTokenExpiresAt, 30)) {
      return this.guestToken;
    }

    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'c1625cd9e8';
    if (!demoPassword) return '';

    if (this.loginPromise) return this.loginPromise;

    this.loginPromise = (async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          headers['X-API-Key'] = this.apiKey;
        }

        const res = await fetch(this.buildUrl('/auth/login'), {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: 'demo1@ivy.homes', password: demoPassword }),
        });
        if (!res.ok) return '';
        const data = await res.json();
        const token = data.access_token || data.token || '';
        if (token) {
          this.guestToken = token;
          this.guestTokenExpiresAt = Date.now() + (data.expires_in || 900) * 1000;
        }
        return token;
      } catch (e) {
        return '';
      } finally {
        this.loginPromise = null;
      }
    })();

    return this.loginPromise;
  }

  async getHeaders(token?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    }

    const session = this.getSessionFromStorage();
    if (session) {
      if (session.refresh_token && this.isTokenExpired(session.expires_at, 60)) {
        try {
          const refreshed = await this.refresh(session.refresh_token);
          if (refreshed?.token) {
            headers['Authorization'] = `Bearer ${refreshed.token}`;
            return headers;
          }
        } catch (e) {
          // fallback
        }
      }
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
        return headers;
      }
    }

    if (this.authToken && !this.isTokenExpired(this.tokenExpiresAt, 30)) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
      return headers;
    }

    const guestBearer = await this.ensureToken();
    if (guestBearer) {
      headers['Authorization'] = `Bearer ${guestBearer}`;
    }

    return headers;
  }

  async fetchWithAuth(url: string, options: RequestInit = {}, retryOn401 = true): Promise<Response> {
    const headers = await this.getHeaders();
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (res.status === 401 && retryOn401) {
      const session = this.getSessionFromStorage();
      if (session?.refresh_token) {
        const refreshed = await this.refresh(session.refresh_token);
        if (refreshed?.token) {
          const retryHeaders = await this.getHeaders(refreshed.token);
          return fetch(url, {
            ...options,
            headers: {
              ...retryHeaders,
              ...(options.headers as Record<string, string> || {}),
            },
          });
        }
      } else {
        this.guestToken = '';
        this.guestTokenExpiresAt = 0;
        const newGuestToken = await this.ensureToken();
        if (newGuestToken) {
          const retryHeaders = await this.getHeaders(newGuestToken);
          return fetch(url, {
            ...options,
            headers: {
              ...retryHeaders,
              ...(options.headers as Record<string, string> || {}),
            },
          });
        }
      }
    }

    return res;
  }

  buildUrl(path: string, params: Record<string, any> = {}): string {
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
      const res = await this.fetchWithAuth(this.buildUrl('/health'));
      return await res.json();
    } catch (e) {
      return { status: 'offline', error: String(e) };
    }
  }

  async getCurrentUser(token?: string): Promise<User | null> {
    try {
      const headers = await this.getHeaders(token);
      const res = await fetch(this.buildUrl('/v1/me'), { headers });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        email: data.user?.email || '',
        name: (data.user?.email || '').split('@')[0],
        city: data.city,
        assigned_locality: data.assigned_locality,
        city_id: data.city_id,
      };
    } catch (e) {
      return null;
    }
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const cleanEmail = email.trim();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const res = await fetch(this.buildUrl('/auth/login'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    const token = data.access_token || data.token;
    const expiresIn = data.expires_in || 900;
    const expiresAt = Date.now() + expiresIn * 1000;

    this.authToken = token;
    this.tokenExpiresAt = expiresAt;

    let userProfile: User = {
      email: data.user?.email || cleanEmail,
      name: data.user?.name || (data.user?.email || cleanEmail).split('@')[0],
    };

    // Enrich user profile from /v1/me
    try {
      const meRes = await fetch(this.buildUrl('/v1/me'), {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        userProfile = {
          ...userProfile,
          city: meData.city,
          assigned_locality: meData.assigned_locality,
          city_id: meData.city_id,
        };
      }
    } catch (e) {
      // non-fatal
    }

    const session: AuthSession = {
      token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: expiresIn,
      expires_at: expiresAt,
      user: userProfile,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('ivy_session', JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('ivy_auth_changed', { detail: session }));
    }

    return session;
  }

  async refresh(refreshToken?: string): Promise<AuthSession | null> {
    const rToken = refreshToken || this.getRefreshTokenFromStorage();
    if (!rToken) return null;

    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          headers['X-API-Key'] = this.apiKey;
        }

        const res = await fetch(this.buildUrl('/auth/refresh'), {
          method: 'POST',
          headers,
          body: JSON.stringify({ refresh_token: rToken }),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 400) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('ivy_session');
              window.dispatchEvent(new CustomEvent('ivy_auth_changed', { detail: null }));
            }
          }
          return null;
        }

        const data = await res.json();
        const token = data.access_token || data.token;
        const expiresIn = data.expires_in || 900;
        const expiresAt = Date.now() + expiresIn * 1000;

        this.authToken = token;
        this.tokenExpiresAt = expiresAt;

        const currentStored = this.getSessionFromStorage();
        let userProfile: User = {
          email: data.user?.email || currentStored?.user?.email || 'user',
          name: data.user?.name || currentStored?.user?.name || (data.user?.email || currentStored?.user?.email || 'user').split('@')[0],
          city: currentStored?.user?.city,
          assigned_locality: currentStored?.user?.assigned_locality,
          city_id: currentStored?.user?.city_id,
        };

        if (!userProfile.assigned_locality) {
          try {
            const meRes = await fetch(this.buildUrl('/v1/me'), {
              headers: {
                ...headers,
                'Authorization': `Bearer ${token}`,
              },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              userProfile = {
                ...userProfile,
                city: meData.city,
                assigned_locality: meData.assigned_locality,
                city_id: meData.city_id,
              };
            }
          } catch (e) {}
        }

        const session: AuthSession = {
          token,
          refresh_token: data.refresh_token || rToken,
          token_type: data.token_type || 'Bearer',
          expires_in: expiresIn,
          expires_at: expiresAt,
          user: userProfile,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('ivy_session', JSON.stringify(session));
          window.dispatchEvent(new CustomEvent('ivy_auth_changed', { detail: session }));
        }
        return session;
      } catch (e) {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async logout(token?: string): Promise<void> {
    try {
      const session = this.getSessionFromStorage();
      const bearer = token || session?.token || this.authToken;
      if (bearer) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          headers['X-API-Key'] = this.apiKey;
        }
        headers['Authorization'] = `Bearer ${bearer}`;

        await fetch(this.buildUrl('/auth/logout'), {
          method: 'POST',
          headers,
        });
      }
    } catch (e) {
      console.warn('Logout request failed', e);
    } finally {
      this.authToken = '';
      this.tokenExpiresAt = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ivy_session');
        window.dispatchEvent(new CustomEvent('ivy_auth_changed', { detail: null }));
      }
    }
  }

  async getListings(params: QueryParams = {}): Promise<{ total: number; page: number; page_size: number; results: Listing[] }> {
    try {
      const query: Record<string, any> = { ...params };
      if (query.page && query.offset === undefined) {
        const limit = query.limit || 20;
        query.offset = (query.page - 1) * limit;
      }
      const res = await this.fetchWithAuth(this.buildUrl('/v1/listings', query));
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
        const res = await this.fetchWithAuth(this.buildUrl(path));
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
        const res = await this.fetchWithAuth(this.buildUrl(path));
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
      const res = await this.fetchWithAuth(this.buildUrl('/v1/rentals', query));
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
        const res = await this.fetchWithAuth(this.buildUrl(path));
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
      const res = await this.fetchWithAuth(this.buildUrl('/v1/projects', query));
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
        const res = await this.fetchWithAuth(this.buildUrl(path));
        if (res.ok) return await res.json();
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    try {
      const res = await this.fetchWithAuth(this.buildUrl('/v1/analytics/summary'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async getFavourites(token?: string): Promise<Listing[]> {
    try {
      const headers = await this.getHeaders(token);
      const res = await fetch(this.buildUrl('/v1/saved'), { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (e) {
      return [];
    }
  }

  async addFavourite(listingId: string, token?: string): Promise<boolean> {
    try {
      const headers = await this.getHeaders(token);
      const res = await fetch(this.buildUrl('/v1/saved'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ listing_id: listingId }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async removeFavourite(listingId: string, token?: string): Promise<boolean> {
    try {
      const headers = await this.getHeaders(token);
      const res = await fetch(this.buildUrl(`/v1/saved/${listingId}`), {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

export const api = new ApiClient();
