export interface AuthUserPayload {
  userId: string;
  displayName: string;
  email: string;
  createdAt?: string | Date;
}

export interface AuthResponse {
  accessToken: string;
  token: string;
  refreshToken?: string;
  user: AuthUserPayload;
  data?: {
    token: string;
    accessToken: string;
    refreshToken?: string;
    user: AuthUserPayload;
  };
}

export interface SignupPayload {
  displayName: string;
  email: string;
  password: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export type AdminLoginResponse = AuthResponse;
