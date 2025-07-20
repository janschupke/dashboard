/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
/* eslint-env node */
/* global process */
// Healthcheck script for dashboard API endpoints
// Usage: node healthcheck.js
// Requires: npm install dotenv

const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Generate dynamic date range for USGS earthquake API (last 7 days)
function getDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  return {
    starttime: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endtime: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
  };
}

const { starttime, endtime } = getDateRange();

// Build URL function that constructs the final URL from path and query parameters
function buildUrl(baseUrl, pathParams = {}, queryParams = {}) {
  let url = baseUrl;
  
  // Replace path parameters
  Object.entries(pathParams).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, value);
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
    key: null,
    required: false,
  },
  {
    name: 'OpenWeatherMap',
    pathParams: {},
    queryParams: {
      lat: '60.1699',
      lon: '24.9384',
      appid: process.env.OPENWEATHERMAP_API_KEY,
    },
    baseUrl: `${BASE_URL}/api/openweathermap/data/3.0/onecall`,
    key: 'OPENWEATHERMAP_API_KEY',
    required: true,
  },
  {
    name: 'Alpha Vantage GDX',
    pathParams: {},
    queryParams: {
      function: 'GLOBAL_QUOTE',
      symbol: 'GDX',
      apikey: process.env.ALPHA_VANTAGE_API_KEY,
    },
    baseUrl: `${BASE_URL}/api/alpha-vantage/query`,
    key: 'ALPHA_VANTAGE_API_KEY',
    required: true,
  },
  {
    name: 'FRED Series Observations',
    pathParams: {},
    queryParams: {
      series_id: 'FEDFUNDS',
      api_key: process.env.FRED_API_KEY,
      file_type: 'json',
    },
    baseUrl: `${BASE_URL}/api/fred/fred/series/observations`,
    key: 'FRED_API_KEY',
    required: true,
  },
  // Precious Metals API
  {
    name: 'Precious Metals (Gold & Silver)',
    pathParams: {},
    queryParams: {},
    baseUrl: `${BASE_URL}/api/precious-metals/XAU`,
    key: null,
    required: false,
  },
  {
    name: 'USGS Earthquake',
    pathParams: {},
    queryParams: {
      format: 'geojson',
      starttime,
      endtime,
    },
    baseUrl: `${BASE_URL}/api/usgs/fdsnws/event/1/query`,
    key: null,
    required: false,
  },
  {
    name: 'TimeZoneDB',
    pathParams: {},
    queryParams: {
      key: process.env.TIMEZONEDB_API_KEY,
      lat: '60.1699',
      lng: '24.9384',
      format: 'json',
      by: 'position',
    },
    baseUrl: `${BASE_URL}/api/timezonedb`,
    key: 'TIMEZONEDB_API_KEY',
    required: true,
  },
  {
    name: 'ECB Euribor 12M',
    pathParams: {
      series: 'BSI.M.U2.EUR.R.IR12MM.R.A',
    },
    queryParams: {
      format: 'json',
    },
    baseUrl: `${BASE_URL}/api/ecb/service/data/:series`,
    key: null,
    required: false,
  },
];

function pad(str, len) {
  return (str + ' '.repeat(len)).slice(0, len);
}

async function checkEndpoint(ep) {
  if (ep.required && (!ep.key || !process.env[ep.key])) {
    return { name: ep.name, status: '❌', msg: `Missing API key (${ep.key})` };
  }
  
  const url = buildUrl(ep.baseUrl, ep.pathParams, ep.queryParams);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { name: ep.name, status: '❌', msg: `HTTP ${res.status}` };
    }
    const data = await res.json().catch(() => null);
    if (data && (data.error || data['Error Message'])) {
      return { name: ep.name, status: '⚠️', msg: data.error || data['Error Message'] };
    }
    return { name: ep.name, status: '✅', msg: 'OK' };
  } catch (e) {
    return { name: ep.name, status: '❌', msg: e.message };
  }
}

(async () => {
  console.log('\nAPI Endpoint Healthcheck\n------------------------');
  const results = await Promise.all(endpoints.map(checkEndpoint));
  const namePad = Math.max(...endpoints.map((e) => e.name.length)) + 2;
  const baseUrlPad = Math.max(...endpoints.map((e) => e.baseUrl.length)) + 2;

  console.log(`${pad('Endpoint', namePad)} ${pad('Base URL', baseUrlPad)} Status`);
  console.log('-'.repeat(namePad + baseUrlPad + 10));

  results.forEach((r) => {
    const endpoint = endpoints.find((e) => e.name === r.name);
    console.log(
      `${pad(r.name, namePad)} ${pad(endpoint.baseUrl, baseUrlPad)} ${r.status}  ${r.msg}`,
    );
  });

  const failed = results.filter((r) => r.status !== '✅');
  if (failed.length) {
    console.log(`\n${failed.length} endpoint(s) need attention.`);
  } else {
    console.log('\nAll endpoints are healthy!');
  }
})();
