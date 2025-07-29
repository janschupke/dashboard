/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
/* eslint-env node */
/* global process */
// Environment-agnostic healthcheck script for dashboard API endpoints
// Works with Vercel API functions across all environments (local, staging, production)
// Usage: node healthcheck.js
// Requires: npm install dotenv

const dotenv = require('dotenv');
dotenv.config();

// Environment-agnostic base URL - works with Vercel API functions
// For local development: http://localhost:3000 (Vercel dev server)
// For production: https://your-domain.vercel.app
// Usage examples:
//   - Local: BASE_URL=http://localhost:3000 node healthcheck.cjs
//   - Production: BASE_URL=https://your-app.vercel.app node healthcheck.cjs
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Build URL function that constructs the final URL from path and query parameters
function buildUrl(baseUrl, pathParams = {}, queryParams = {}) {
  let url = baseUrl;

  // Replace path parameters - use :param format
  Object.entries(pathParams).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  // Add query parameters
  const queryString = Object.entries(queryParams)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
}

const endpoints = [
  {
    name: 'CoinGecko Markets',
    pathParams: {},
    queryParams: {
      vs_currency: 'usd',
    },
    baseUrl: `${BASE_URL}/api/coingecko/api/v3/coins/markets`,
  },
  {
    name: 'OpenWeatherMap',
    pathParams: {},
    queryParams: {
      lat: '60.1699',
      lon: '24.9384',
    },
    baseUrl: `${BASE_URL}/api/openweathermap/data/3.0/onecall`,
  },
  {
    name: 'Alpha Vantage GDX',
    pathParams: {},
    queryParams: {
      function: 'GLOBAL_QUOTE',
      symbol: 'GDX',
    },
    baseUrl: `${BASE_URL}/api/alpha-vantage/query`,
  },
  {
    name: 'FRED Series Observations',
    pathParams: {},
    queryParams: {
      series_id: 'FEDFUNDS',
      file_type: 'json',
    },
    baseUrl: `${BASE_URL}/api/fred/fred/series/observations`,
  },
  // Precious Metals API
  {
    name: 'Precious Metals (Gold & Silver)',
    pathParams: {
      symbol: 'XAU',
    },
    queryParams: {},
    baseUrl: `${BASE_URL}/api/precious-metals/:symbol`,
  },
  {
    name: 'USGS Earthquake',
    pathParams: {},
    queryParams: {
      format: 'geojson',
      starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      endtime: new Date().toISOString().slice(0, 10),
    },
    baseUrl: `${BASE_URL}/api/usgs/fdsnws/event/1/query`,
  },
  {
    name: 'TimeZoneDB',
    pathParams: {},
    queryParams: {
      lat: '60.1699',
      lng: '24.9384',
      format: 'json',
      by: 'position',
    },
    baseUrl: `${BASE_URL}/api/timezonedb/v2.1/get-time-zone`,
  },
  {
    name: 'ECB Euribor 12M',
    pathParams: {
      flowRed: 'BSI',
      key: 'M.U2.EUR.R.IR12MM.R.A',
    },
    queryParams: {
      format: 'jsondata',
    },
    baseUrl: `${BASE_URL}/api/ecb/service/data/:flowRef.:key`,
  },
];

function pad(str, len) {
  return (str + ' '.repeat(len)).slice(0, len);
}

async function checkEndpoint(ep) {
  const url = buildUrl(ep.baseUrl, ep.pathParams, ep.queryParams);

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Dashboard-Healthcheck/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { name: ep.name, status: '❌', msg: `HTTP ${res.status}` };
    }

    // Check content length to avoid parsing very large responses
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50000) {
      return { name: ep.name, status: '✅', msg: 'OK' };
    }

    const data = await res.json().catch(() => null);
    if (data && (data.error || data['Error Message'])) {
      return { name: ep.name, status: '⚠️', msg: data.error || data['Error Message'] };
    }
    return { name: ep.name, status: '✅', msg: 'OK' };
  } catch (e) {
    if (e.name === 'AbortError') {
      return { name: ep.name, status: '❌', msg: 'Timeout (5s)' };
    }
    return { name: ep.name, status: '❌', msg: e.message };
  }
}

(async () => {
  console.log('\nAPI Endpoint Healthcheck\n------------------------');
  console.log(`Testing ${endpoints.length} endpoints...`);

  // Test endpoints one by one
  const results = [];
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const result = await checkEndpoint(endpoint);
    results.push(result);
  }

  console.log('Results received:', results.length);

  const namePad = Math.max(...endpoints.map((e) => e.name.length)) + 1;
  const baseUrlPad =
    Math.max(
      ...endpoints.map((e) => {
        const trimmedUrl = e.baseUrl.includes('/api/') ? e.baseUrl.split('/api/')[1] : e.baseUrl;
        return trimmedUrl.length;
      }),
    ) + 1;

  const statusColumnLength = 11;

  console.log(
    `${pad('Status', statusColumnLength)} ${pad('Endpoint', namePad)} ${pad('API Path', baseUrlPad)}`,
  );
  console.log('-'.repeat(8 + namePad + baseUrlPad + 4));

  results.forEach((r) => {
    const endpoint = endpoints.find((e) => e.name === r.name);
    // Trim baseUrl to only show the part after /api/
    const trimmedUrl = endpoint.baseUrl.includes('/api/')
      ? endpoint.baseUrl.split('/api/')[1]
      : endpoint.baseUrl;
    console.log(
      `${pad(r.status + ' ' + r.msg, statusColumnLength)} ${pad(r.name, namePad)} ${pad(trimmedUrl, baseUrlPad)}`,
    );
  });

  const failed = results.filter((r) => r.status !== '✅');
  if (failed.length) {
    console.log(`\n${failed.length} endpoint(s) need attention.`);
  } else {
    console.log('\nAll endpoints are healthy!');
  }

  if (BASE_URL.includes('localhost')) {
    console.log('\n💡 Local Development Tips:');
    console.log('- Make sure to run "vercel dev" to start the development server');
    console.log('- API functions will be available at http://localhost:3000/api/*');
  }
})().catch(console.error);
