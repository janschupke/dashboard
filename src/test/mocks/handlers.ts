import { http, HttpResponse, delay } from 'msw';

import { MockResponseData } from './endpointMocks';

// Base URL for API endpoints
const API_BASE = 'http://localhost:3000';

// Helper to create a response with optional delay
const createResponse = async (data: unknown, status = 200, delayMs = 0) => {
  if (delayMs > 0) {
    await delay(delayMs);
  }
  return HttpResponse.json(data as Record<string, unknown>, { status });
};

// Helper to create error responses
const createErrorResponse = async (
  errorType: 'network' | 'timeout' | 'api' | 'malformed',
  delayMs = 0,
) => {
  if (delayMs > 0) {
    await delay(delayMs);
  }

  switch (errorType) {
    case 'network':
      // Network error - throw to simulate network failure
      throw new Error('Failed to fetch');
    case 'timeout':
      // Timeout - throw immediately to simulate timeout error
      throw new Error('Request timeout');
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

// Default handlers - can be overridden in tests
export const handlers = [
  // Cryptocurrency (CoinGecko)
  http.get(`${API_BASE}/api/coingecko/api/v3/coins/markets`, async ({ request }) => {
    const url = new URL(request.url);
    // Check for custom delay or error in query params (for testing)
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    return createResponse(MockResponseData.getCryptocurrencyData(), 200, delayMs);
  }),

  // Weather (OpenWeatherMap) - handles both weather and weather alerts
  http.get(`${API_BASE}/api/openweathermap/data/3.0/onecall`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);
    // Check if this is a weather alerts request (has alerts in response or specific param)
    const isAlerts = url.searchParams.get('__alerts') === 'true';

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    // Return weather alerts data if requested, otherwise regular weather data
    if (isAlerts) {
      return createResponse(MockResponseData.getWeatherAlertsData(), 200, delayMs);
    }

    return createResponse(MockResponseData.getWeatherData(), 200, delayMs);
  }),

  // Weather Alerts (OpenWeatherMap) - same endpoint but with alerts
  // Note: This will match the same URL as weather, so we need to check query params or use a different approach
  // For now, we'll handle it in the weather handler by checking for alerts parameter

  // GDX ETF (Alpha Vantage)
  http.get(`${API_BASE}/api/alpha-vantage/query`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    return createResponse(MockResponseData.getGdxEtfData(), 200, delayMs);
  }),

  // Federal Funds Rate (FRED)
  http.get(`${API_BASE}/api/fred/fred/series/observations`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    return createResponse(MockResponseData.getFederalFundsRateData(), 200, delayMs);
  }),

  // Euribor Rate (ECB) - matches /api/ecb/service/data/BSI.M.U2.EUR.R.IR12MM.R.A
  http.get(`${API_BASE}/api/ecb/service/data/*`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    return createResponse(MockResponseData.getEuriborRateData(), 200, delayMs);
  }),

  // Uranium (HTML scraping)
  http.get(`${API_BASE}/api/uranium-html`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    // Return HTML content for scraping - convert JSON to HTML-like string
    const data = MockResponseData.getUraniumData();
    const htmlContent = `<html><body><div data-price="${data.spotPrice}">Uranium Price: ${data.spotPrice}</div></body></html>`;

    if (delayMs > 0) {
      await delay(delayMs);
    }

    return new HttpResponse(htmlContent, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }),

  // Precious Metals
  http.get(`${API_BASE}/api/precious-metals/:symbol`, async ({ request, params }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    const symbol = (params as { symbol?: string }).symbol ?? 'XAU';
    return createResponse(MockResponseData.getPreciousMetalsData(symbol), 200, delayMs);
  }),

  // Time (TimeZoneDB)
  http.get(`${API_BASE}/api/timezonedb/v2.1/get-time-zone`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    return createResponse(MockResponseData.getTimeData(), 200, delayMs);
  }),

  // Earthquake (USGS)
  http.get(`${API_BASE}/api/usgs/fdsnws/event/1/query`, async ({ request }) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('__error') as
      | 'network'
      | 'timeout'
      | 'api'
      | 'malformed'
      | null;
    const delayMs = parseInt(url.searchParams.get('__delay') ?? '0', 10);

    if (errorType) {
      return createErrorResponse(errorType, delayMs);
    }

    return createResponse(MockResponseData.getEarthquakeData(), 200, delayMs);
  }),

  // Auth endpoints
  http.post(`${API_BASE}/api/login`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { password } = body as { password?: string };

    if (password === 'correct-password') {
      return HttpResponse.json({ success: true }, { status: 200 });
    }

    return HttpResponse.json({ error: 'Invalid password' }, { status: 401 });
  }),

  http.get(`${API_BASE}/api/auth`, async () => {
    return HttpResponse.json({ authenticated: true }, { status: 200 });
  }),

  http.post(`${API_BASE}/api/logout`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
