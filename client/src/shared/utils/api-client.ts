import tokenManager from '@/features/auth/utils/token-manager';
import { ApiError, ApiErrorPayload } from './api-error';

/* ============================
   CONFIG
============================ */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';

/* ============================
   TYPES
============================ */

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
  retry?: boolean;
  token?: string; // allow server injection or manual override
};

/* ============================
   CORE REQUEST
============================ */

async function request<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('/')
    ? `${BASE_URL}${endpoint}`
    : `${BASE_URL}/${endpoint}`;

  const isFormData = options.body instanceof FormData;

  /* ============================
     PROACTIVE TOKEN REFRESH
  ============================ */

  if (
    typeof window !== 'undefined' &&
    !options.skipAuth &&
    !options.token &&
    tokenManager.getRefreshToken() &&
    tokenManager.isAccessTokenExpired()
  ) {
    await tokenManager.refreshAccessToken();
  }

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>)
  };

  /* ============================
     AUTH HANDLING
  ============================ */

  let token: string | null | undefined = options.token;

  if (!token && !options.skipAuth) {
    token = tokenManager.getAccessToken();
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (err) {
    throw err;
  }

  /* ============================
     HANDLE 401 RETRY (CLIENT ONLY)
  ============================ */

  if (
    response.status === 401 &&
    typeof window !== 'undefined' &&
    !options.skipAuth &&
    !options.retry
  ) {
    const refreshedToken = await tokenManager.refreshAccessToken();

    if (refreshedToken) {
      const retryHeaders: Record<string, string> = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${refreshedToken}`
      };
      if (!isFormData) {
        retryHeaders['Content-Type'] = 'application/json';
      }

      return request<T>(endpoint, {
        ...options,
        token: refreshedToken,
        headers: retryHeaders,
        retry: true
      });
    }
  }

  /* ============================
     ERROR HANDLING
  ============================ */

  if (!response.ok) {
    let payload: ApiErrorPayload = {};

    try {
      payload = await response.json();
    } catch {}

    throw new ApiError(
      response.status,
      payload.message || 'Request failed',
      payload
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: ApiOptions
  ) => {
    let url = endpoint;

    if (params) {
      const query = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();

      if (query) url += `?${query}`;
    }

    return request<T>(url, { method: 'GET', ...options });
  },

  post: <T, B = unknown>(endpoint: string, body?: B, options?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: !(body instanceof FormData) ? JSON.stringify(body) : body,
      ...options
    }),

  put: <T, B = unknown>(endpoint: string, body?: B, options?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }),

  patch: <T, B = unknown>(endpoint: string, body?: B, options?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: !(body instanceof FormData) ? JSON.stringify(body) : body,
      ...options
    }),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'DELETE',
      ...options
    })
};
