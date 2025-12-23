import { http, HttpResponse, delay } from 'msw';

import { server } from '../mocks/server';
import { MockResponseData } from '../mocks/endpointMocks';

import type { MockApiErrorType } from '../mocks/endpointMocks';

// API endpoint URLs from apiEndpoints.ts
export const API_ENDPOINTS = {
  COINGECKO_MARKETS: '/api/coingecko/api/v3/coins/markets',
  OPENWEATHERMAP_ONECALL: '/api/openweathermap/data/3.0/onecall',
  YAHOO_FINANCE_CHART: '/api/yahoo-finance/v8/finance/chart',
  FRED_SERIES_OBSERVATIONS: '/api/fred/fred/series/observations',
  ECB_EURIBOR_12M: '/api/ecb/euribor-12m',
  URANIUM_HTML: '/api/uranium-html',
  PRECIOUS_METALS: '/api/precious-metals',
  TIME_API: '/api/timezonedb/v2.1/get-time-zone',
  USGS_EARTHQUAKE: '/api/usgs/fdsnws/event/1/query',
} as const;

const API_BASE = 'http://localhost:3000';

// Helper to create error responses
const createErrorResponse = async (errorType: MockApiErrorType, delayMs = 0) => {
  if (delayMs > 0) {
    await delay(delayMs);
  }

  switch (errorType) {
    case 'network':
      // Network error - throw to simulate network failure
      throw new Error('Failed to fetch');
    case 'timeout':
      // Timeout - delay longer than timeout
      await delay(20000);
      return HttpResponse.json({ error: 'Request timeout' }, { status: 408 });
    case 'api':
      return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    case 'malformed':
      // Return invalid JSON
      return new HttpResponse('invalid json {', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    default:
      return HttpResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
};

// Override a handler for a specific endpoint
export const overrideHandler = (
  endpoint: string,
  handler: (request: Request) => Promise<Response> | Response,
) => {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  server.use(
    http.get(fullUrl, async ({ request }) => {
      return handler(request);
    }),
  );
};

// Setup success mock for an endpoint
export const setupSuccessMock = (endpoint: string, responseData?: unknown, delayMs = 0): void => {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  server.use(
    http.get(fullUrl, async () => {
      if (delayMs > 0) {
        await delay(delayMs);
      }
      return HttpResponse.json(responseData, { status: 200 });
    }),
  );
};

// Setup failure mock for an endpoint
export const setupFailureMock = (
  endpoint: string,
  errorType: MockApiErrorType = 'network',
  delayMs = 0,
): void => {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  server.use(
    http.get(fullUrl, async () => {
      return createErrorResponse(errorType, delayMs);
    }),
  );
};

// Setup delayed mock for an endpoint
export const setupDelayedMock = (endpoint: string, responseData?: unknown, delayMs = 100): void => {
  setupSuccessMock(endpoint, responseData, delayMs);
};

// Pre-configured mock data for each endpoint
export const setupCryptocurrencySuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.COINGECKO_MARKETS, MockResponseData.getCryptocurrencyData());
};

export const setupWeatherSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, MockResponseData.getWeatherData());
};

export const setupWeatherAlertsSuccessMock = (): void => {
  // Weather alerts use the same endpoint, so we need to distinguish them
  // We'll use a query parameter or override the handler to return alerts data
  const fullUrl = `${API_BASE}${API_ENDPOINTS.OPENWEATHERMAP_ONECALL}`;
  server.use(
    http.get(fullUrl, async ({ request }) => {
      const url = new URL(request.url);
      // Check if this is an alerts request (you can customize this logic)
      const isAlerts = url.searchParams.get('__alerts') === 'true';
      if (isAlerts) {
        return HttpResponse.json(MockResponseData.getWeatherAlertsData(), { status: 200 });
      }
      // Default to regular weather data
      return HttpResponse.json(MockResponseData.getWeatherData(), { status: 200 });
    }),
  );
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
  const fullUrl = `${API_BASE}${API_ENDPOINTS.URANIUM_HTML}`;
  server.use(
    http.get(fullUrl, async () => {
      const data = MockResponseData.getUraniumData();
      const htmlContent = `<html><body><div data-price="${data.spotPrice}">Uranium Price: ${data.spotPrice}</div></body></html>`;
      return new HttpResponse(htmlContent, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }),
  );
};

export const setupPreciousMetalsSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.PRECIOUS_METALS, MockResponseData.getPreciousMetalsData());
};

export const setupGdxEtfSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.YAHOO_FINANCE_CHART, MockResponseData.getGdxEtfData());
};

export const setupEuriborRateSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.ECB_EURIBOR_12M, MockResponseData.getEuriborRateData());
};

export const setupEarthquakeSuccessMock = (): void => {
  setupSuccessMock(API_ENDPOINTS.USGS_EARTHQUAKE, MockResponseData.getEarthquakeData());
};

// Setup all success mocks at once
export const setupAllSuccessMocks = (): void => {
  setupCryptocurrencySuccessMock();
  setupWeatherSuccessMock();
  setupFederalFundsRateSuccessMock();
  setupTimeSuccessMock();
  setupUraniumSuccessMock();
  setupPreciousMetalsSuccessMock();
  setupGdxEtfSuccessMock();
  setupEuriborRateSuccessMock();
  setupEarthquakeSuccessMock();
};

// Setup all failure mocks at once
export const setupAllFailureMocks = (errorType: MockApiErrorType = 'network'): void => {
  Object.values(API_ENDPOINTS).forEach((endpoint) => {
    setupFailureMock(endpoint, errorType);
  });
};

// Utility for building test URLs with path and query parameters
export const buildTestUrl = (
  baseUrl: string,
  pathParams: Record<string, string | number> = {},
  queryParams: Record<string, string | number | boolean> = {},
): string => {
  let url = baseUrl;

  // Handle path parameters - replace :param with actual values
  for (const [paramName, value] of Object.entries(pathParams)) {
    if (value !== undefined && value !== null) {
      const placeholder = `:${paramName}`;
      url = url.replace(placeholder, String(value));
    }
  }

  // Handle query parameters
  const queryString = Object.entries(queryParams)
    .filter((entry) => entry[1] !== undefined && entry[1] !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryString ? `${url}?${queryString}` : url;
};

