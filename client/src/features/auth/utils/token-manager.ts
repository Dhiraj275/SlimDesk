/* =========================
   TYPES
========================= */

export type TokenPair = {
  accessToken: string;
  refreshToken?: string;
};

type JwtPayload = {
  exp?: number;
  [key: string]: any;
};

/* =========================
   CONSTANTS
========================= */

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

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
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);

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

  /* ---------- CHECK ---------- */

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return isExpired(token);
  }

  /* ---------- REFRESH ---------- */

  async refreshAccessToken(): Promise<string | null> {
    // Current backend JWTs are long-lived; refresh-token endpoint is not required.
    // If expired, clear tokens so user re-authenticates.
    this.clearTokens();
    return null;
  }
}

/* =========================
   SINGLETON
========================= */

const tokenManager = new TokenManager();
export default tokenManager;
