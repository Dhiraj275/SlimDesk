'use client';

import { api } from '@/shared/utils/api-client';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { User } from '@/features/auth/types/user.types';
import { AuthResponse } from '@/features/auth/types/api.types';
import tokenManager from '../utils/token-manager';

/* =========================
   TYPES
========================= */

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (authResult: AuthResponse) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- SESSION RESTORE ---------- */

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const token = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();

        if (!token && !refreshToken) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // If access token is expired, attempt to refresh using the refresh token
        if (tokenManager.isAccessTokenExpired()) {
          if (refreshToken) {
            const refreshedToken = await tokenManager.refreshAccessToken();
            if (!refreshedToken) {
              if (isMounted) {
                setUser(null);
                setIsLoading(false);
              }
              return;
            }
          } else {
            tokenManager.clearTokens();
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
            return;
          }
        }

        const profile = await api.get<{
          userId?: string;
          _id?: string;
          displayName?: string;
          fullName?: string;
          name?: string;
          email: string;
          createdAt?: string;
          role?: string;
        }>('/auth/me');

        if (isMounted) {
          const mappedUser: User = {
            userId: profile.userId || profile._id || 'user',
            displayName: profile.displayName || profile.fullName || profile.name || 'User',
            name: profile.displayName || profile.fullName || profile.name || 'User',
            email: profile.email,
            createdAt: profile.createdAt,
            role: profile.role || 'user',
            isAuthenticated: true
          };

          setUser(mappedUser);
        }
      } catch {
        tokenManager.clearTokens();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    const handleSessionExpired = () => {
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  /* ---------- LOGIN ---------- */

  const login: AuthContextType['login'] = async (authResult): Promise<User> => {
    setIsLoading(true);

    try {
      const token =
        authResult.accessToken ||
        authResult.token ||
        authResult.data?.token ||
        authResult.data?.accessToken;

      const refreshToken =
        authResult.refreshToken ||
        authResult.data?.refreshToken;

      if (!token) {
        throw new Error('Authentication token missing from response');
      }

      tokenManager.setTokens({
        accessToken: token,
        refreshToken: refreshToken || token
      });

      let profile: any = null;
      try {
        profile = await api.get<{
          userId?: string;
          _id?: string;
          displayName?: string;
          fullName?: string;
          name?: string;
          email: string;
          createdAt?: string;
          role?: string;
        }>('/auth/me');
      } catch {
        // Fallback to response payload if /auth/me fails
      }

      const userSource = profile || authResult.user || authResult.data?.user;

      const mappedUser: User = {
        userId: userSource?.userId || userSource?._id || 'user',
        displayName: userSource?.displayName || userSource?.fullName || userSource?.name || 'User',
        name: userSource?.displayName || userSource?.fullName || userSource?.name || 'User',
        email: userSource?.email || '',
        createdAt: userSource?.createdAt,
        role: userSource?.role || 'user',
        isAuthenticated: true
      };

      setUser(mappedUser);
      return mappedUser;
    } catch (err) {
      tokenManager.clearTokens();
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- LOGOUT ---------- */

  const logout = async () => {
    tokenManager.clearTokens();
    setUser(null);
  };

  /* ---------- REFRESH USER ---------- */

  const refreshUser = async (): Promise<User | null> => {
    try {
      const profile = await api.get<{
        userId?: string;
        _id?: string;
        displayName?: string;
        email: string;
        createdAt?: string;
      }>('/auth/me');

      const mappedUser: User = {
        userId: profile.userId || profile._id || 'user',
        displayName: profile.displayName || 'User',
        name: profile.displayName || 'User',
        email: profile.email,
        createdAt: profile.createdAt,
        role: 'user',
        isAuthenticated: true
      };

      setUser(mappedUser);
      return mappedUser;
    } catch {
      return null;
    }
  };

  /* ---------- CONTEXT VALUE ---------- */

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
