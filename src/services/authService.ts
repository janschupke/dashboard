import { AUTH_API_CALL, AUTH_STORAGE_KEY } from '../contexts/constants';
import { useDataServices } from '../contexts/DataServicesContext';

import {
  AUTH_CHECK_ENDPOINT,
  AUTH_LOGIN_ENDPOINT,
  AUTH_LOGOUT_ENDPOINT,
  buildApiUrl,
} from './apiEndpoints';
import { storageManager, APILogLevel } from './storageManager';

import type { AuthLoginBodyParams } from './apiEndpoints';
import type { DataFetcher } from './dataFetcher';
import type { AuthLoginData, AuthCheckData, AuthLogoutData } from '../types/auth';

// Helper function to create a fetch function for auth endpoints
const createAuthFetchFunction = (dataFetcher: DataFetcher, url: string, options?: RequestInit) => {
  return async () => {
    const response = await dataFetcher.fetchWithError(url, options);
    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { data, status: response.status };
  };
};

// Helper function to handle auth API calls with proper error logging
const handleAuthApiCall = async (
  fetchFunction: () => Promise<{ data: unknown; status: number }>,
  storageKey: string,
  apiCall: string,
  requestUrl: string,
): Promise<{ data: unknown; success: boolean }> => {
  try {
    const result = await fetchFunction();
    return { data: result.data, success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const logDetails = {
      storageKey,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage,
      requestUrl,
    };

    storageManager.addLog({
      level: APILogLevel.ERROR,
      apiCall,
      reason: errorMessage,
      details: logDetails,
    });

    return { data: null, success: false };
  }
};

export function useAuthService() {
  const { dataFetcher } = useDataServices();

  const login = async (password: string): Promise<AuthLoginData> => {
    const url = buildApiUrl(AUTH_LOGIN_ENDPOINT, {}, {});

    const fetchFunction = createAuthFetchFunction(dataFetcher, url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password } as AuthLoginBodyParams),
    });

    const result = await handleAuthApiCall(
      fetchFunction,
      AUTH_STORAGE_KEY.LOGIN,
      AUTH_API_CALL.LOGIN,
      url,
    );

    if (!result.success) {
      return { success: false, error: 'Login failed' };
    }

    const data = result.data as { success?: boolean; error?: string };
    return {
      success: data.success || false,
      error: data.error,
    };
  };

  const checkAuth = async (): Promise<AuthCheckData> => {
    const url = buildApiUrl(AUTH_CHECK_ENDPOINT, {}, {});

    const fetchFunction = createAuthFetchFunction(dataFetcher, url);
    const result = await handleAuthApiCall(
      fetchFunction,
      AUTH_STORAGE_KEY.CHECK,
      AUTH_API_CALL.CHECK,
      url,
    );

    if (!result.success) {
      return { authenticated: false };
    }

    const data = result.data as { authenticated?: boolean };
    return {
      authenticated: data.authenticated || false,
    };
  };

  const logout = async (): Promise<AuthLogoutData> => {
    const url = buildApiUrl(AUTH_LOGOUT_ENDPOINT, {}, {});

    const fetchFunction = createAuthFetchFunction(dataFetcher, url, {
      method: 'POST',
    });

    const result = await handleAuthApiCall(
      fetchFunction,
      AUTH_STORAGE_KEY.LOGOUT,
      AUTH_API_CALL.LOGOUT,
      url,
    );

    if (!result.success) {
      return { success: false };
    }

    const data = result.data as { success?: boolean };
    return {
      success: data.success || false,
    };
  };

  return {
    login,
    checkAuth,
    logout,
  };
}
