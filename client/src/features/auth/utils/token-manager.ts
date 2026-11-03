/* =========================
   TYPES
========================= */

export type TokenPair = {
  accessToken: string;
  refreshToken?: string;
};

type JwtPayload = {
  exp?: number;
  sub?: string;
  email?: string;
  tokenType?: string;
  [key: string]: any;
};

/* =========================
   CONSTANTS & CONFIG
========================= */

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';

/* =========================
   HELPERS
========================= */

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isExpired = (token: string, bufferSeconds = 30): boolean => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + bufferSeconds;
};

/* =========================
   TOKEN MANAGER
========================= */

class TokenManager {
  private refreshPromise: Promise<string | null> | null = null;

  /* ---------- GET ---------- */

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /* ---------- SET ---------- */

  setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;
    if (tokens.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    }

    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  /* ---------- CLEAR ---------- */

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /* ---------- CHECK EXPIRY ---------- */

  isAccessTokenExpired(bufferSeconds = 30): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return isExpired(token, bufferSeconds);
  }

  isRefreshTokenExpired(bufferSeconds = 30): boolean {
    const token = this.getRefreshToken();
    if (!token) return true;
    return isExpired(token, bufferSeconds);
  }

  /* ---------- NOTIFY ---------- */

  private notifySessionExpired(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
  }

  private notifyTokenRefreshed(newAccessToken: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', {
          detail: { accessToken: newAccessToken }
        })
      );
    }
  }

  /* ---------- REFRESH ACCESS TOKEN (DEDUPLICATED) ---------- */

  async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.executeRefresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async executeRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken || this.isRefreshTokenExpired()) {
      this.clearTokens();
      this.notifySessionExpired();
      return null;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        // If server explicitly rejected the refresh token (401 / 400), session is invalid
        if (response.status === 401 || response.status === 400) {
          this.clearTokens();
          this.notifySessionExpired();
        }
        return null;
      }

      const data = await response.json();
      const newAccessToken: string | undefined =
        data.accessToken || data.token || data.data?.accessToken || data.data?.token;
      const newRefreshToken: string | undefined =
        data.refreshToken || data.data?.refreshToken || refreshToken;

      if (!newAccessToken) {
        this.clearTokens();
        this.notifySessionExpired();
        return null;
      }

      this.setTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });

      this.notifyTokenRefreshed(newAccessToken);
      return newAccessToken;
    } catch {
      // Temporary network or connection failure: do not clear tokens prematurely
      return null;
    }
  }
}

/* =========================
   SINGLETON
========================= */

const tokenManager = new TokenManager();
export default tokenManager;
