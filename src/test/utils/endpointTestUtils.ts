import { beforeEach, afterEach } from 'vitest';
import { EndpointMockService, MockResponseData } from '../mocks/endpointMocks';
import type { MockApiConfig } from '../mocks/endpointMocks';
import { storageManager } from '../../services/storageManager';

// API endpoint URLs from apiEndpoints.ts
export const API_ENDPOINTS = {
  COINGECKO_MARKETS: '/api/coingecko/api/v3/coins/markets',
  OPENWEATHERMAP_ONECALL: '/api/openweathermap/data/2.5/onecall',
  YAHOO_FINANCE_CHART: '/api/yahoo-finance/v8/finance/chart',
  FRED_SERIES_OBSERVATIONS: '/api/fred/fred/series/observations',
  EMMI_EURIBOR: '/api/emmi/euribor-rates',
  TRADINGECONOMICS_URANIUM: '/api/tradingeconomics/commodity/uranium',
  PRECIOUS_METALS: '/api/precious-metals',
  TIME_API: '/api/time',
} as const;

function normalizeUrl(url: string): string {
  if (url.startsWith('/')) {
    return `http://localhost:3000${url}`;
  }
  return url;
}

export class EndpointTestUtils {
  private static mockService = EndpointMockService.getInstance();
  private static originalFetch: typeof fetch;

  static setupMockEnvironment(): void {
    // Clear any cached data that might interfere with tests
    storageManager.setDashboardState({ tiles: [] });
    storageManager.clearTileState();

    // Store the current fetch (which may be the patched version from setup.ts)
    this.originalFetch = globalThis.fetch;

    // Override global fetch with our mock service (this takes precedence)
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let url: string;
      if (typeof input === 'string') {
        url = normalizeUrl(input);
      } else if (input instanceof URL) {
        url = normalizeUrl(input.toString());
      } else if (input instanceof Request) {
        url = normalizeUrl(input.url);
      } else {
        url = '';
      }
      // Check if we have a mock for this URL
      const mockConfig = this.mockService.getMockConfig(url);
      if (mockConfig) {
        return this.mockService.mockRequest(url);
      }

      // If no mock found, call the original fetch (which will be the patched version from setup.ts)
      return this.originalFetch(input, init);
    };
  }

  static restoreMockEnvironment(): void {
    if (this.originalFetch) {
      globalThis.fetch = this.originalFetch;
    }
    this.mockService.clearMocks();
  }

  static configureMock(endpoint: string, config: MockApiConfig): void {
    this.mockService.configureMock(endpoint, config);
  }

  static configureMocks(configs: Array<{ endpoint: string } & MockApiConfig>): void {
    this.mockService.configureMocks(configs);
  }

  static clearMocks(): void {
    this.mockService.clearMocks();
  }
}

// Test setup and teardown
beforeEach(() => {
  EndpointTestUtils.setupMockEnvironment();
});

afterEach(() => {
  EndpointTestUtils.restoreMockEnvironment();
});

// Helper methods for common test scenarios
export const setupSuccessMock = (endpoint: string, responseData?: unknown): void => {
  EndpointTestUtils.configureMock(endpoint, {
    responseData,
    shouldFail: false,
    status: 200,
  });
};

export const setupFailureMock = (
  endpoint: string,
  errorType: 'network' | 'timeout' | 'api' | 'malformed' = 'network',
): void => {
  EndpointTestUtils.configureMock(endpoint, {
    shouldFail: true,
    errorType,
    status: errorType === 'api' ? 500 : 200,
  });
};

export const setupDelayedMock = (endpoint: string, responseData?: unknown, delay = 100): void => {
  EndpointTestUtils.configureMock(endpoint, {
    responseData,
    delay,
    shouldFail: false,
    status: 200,
  });
};

// Pre-configured mock data for each endpoint
export const setupCryptocurrencySuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.COINGECKO_MARKETS, MockResponseData.getCryptocurrencyData());
};

export const setupWeatherSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, MockResponseData.getWeatherData());
};

export const setupFederalFundsRateSuccessMock = (): void => {
  setupSuccessMock(
    API_ENDPOINTS.FRED_SERIES_OBSERVATIONS,
    MockResponseData.getFederalFundsRateData(),
  );
};

export const setupTimeSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.TIME_API, MockResponseData.getTimeData());
};

export const setupUraniumSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.TRADINGECONOMICS_URANIUM, MockResponseData.getUraniumData());
};

export const setupPreciousMetalsSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.PRECIOUS_METALS, MockResponseData.getPreciousMetalsData());
};

export const setupGDXETFSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.YAHOO_FINANCE_CHART, MockResponseData.getGDXETFData());
};

export const setupEuriborRateSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.EMMI_EURIBOR, MockResponseData.getEuriborRateData());
};

// Setup all success mocks at once
export const setupAllSuccessMocks = (): void => {
  setupCryptocurrencySuccessMock();
  setupWeatherSuccessMock();
  setupFederalFundsRateSuccessMock();
  setupTimeSuccessMock();
  setupUraniumSuccessMock();
  setupPreciousMetalsSuccessMock();
  setupGDXETFSuccessMock();
  setupEuriborRateSuccessMock();
};

// Setup all failure mocks at once
export const setupAllFailureMocks = (
  errorType: 'network' | 'timeout' | 'api' | 'malformed' = 'network',
): void => {
  Object.values(API_ENDPOINTS).forEach((endpoint) => {
    setupFailureMock(endpoint, errorType);
  });
};

// Utility for building test URLs with query parameters
export const buildTestUrl = (
  baseUrl: string,
  params: Record<string, string | number | boolean>,
): string => {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
