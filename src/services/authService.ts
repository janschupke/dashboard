import {
  AUTH_CHECK_ENDPOINT,
  AUTH_LOGIN_ENDPOINT,
  AUTH_LOGOUT_ENDPOINT,
  buildApiUrl,
} from './apiEndpoints';
import { fetchWithError } from './fetchWithError';

import type { AuthLoginBodyParams } from './apiEndpoints';
import type { AuthLoginData, AuthCheckData, AuthLogoutData } from '../types/auth';

export function useAuthService() {
  const login = async (password: string): Promise<AuthLoginData> => {
    const url = buildApiUrl(AUTH_LOGIN_ENDPOINT, {}, {});

    try {
      const response = await fetchWithError(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password } as AuthLoginBodyParams),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Login failed: API endpoint not available');
        return { success: false, error: 'API endpoint not available' };
      }

      const data = await response.json();
      return {
        success: data.success || false,
        error: data.error,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const checkAuth = async (): Promise<AuthCheckData> => {
    const url = buildApiUrl(AUTH_CHECK_ENDPOINT, {}, {});

    try {
      const response = await fetchWithError(url);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Auth check failed: API endpoint not available');
        return { authenticated: false };
      }

      const data = await response.json();
      return {
        authenticated: data.authenticated || false,
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return { authenticated: false };
    }
  };

  const logout = async (): Promise<AuthLogoutData> => {
    const url = buildApiUrl(AUTH_LOGOUT_ENDPOINT, {}, {});

    try {
      const response = await fetchWithError(url, {
        method: 'POST',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Logout failed: API endpoint not available');
        return { success: false };
      }

      const data = await response.json();
      return {
        success: data.success || false,
      };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  };

  return {
    login,
    checkAuth,
    logout,
  };
}
