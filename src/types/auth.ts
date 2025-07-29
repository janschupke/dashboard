// Auth response types for API endpoints
export interface AuthLoginResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  [key: string]: unknown;
}

export interface AuthLogoutResponse {
  success: boolean;
  [key: string]: unknown;
}

export interface AuthLoginData {
  success: boolean;
  error?: string;
}

export interface AuthCheckData {
  authenticated: boolean;
}

export interface AuthLogoutData {
  success: boolean;
}
