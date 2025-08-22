// Auth response types for API endpoints
export interface AuthLoginResponse {
  success: boolean;
  error?: string;
}

export interface AuthCheckResponse {
  authenticated: boolean;
}

export interface AuthLogoutResponse {
  success: boolean;
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
