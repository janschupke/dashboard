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

const endpoints = [
  {
    name: 'CoinGecko Markets',
    url: `${BASE_URL}/api/coingecko/api/v3/coins/markets?vs_currency=usd`,
    baseUrl: 'https://api.coingecko.com',
    key: null,
    required: false,
  },
  {
    name: 'OpenWeatherMap',
    url: `${BASE_URL}/api/openweathermap/data/2.5/onecall?lat=60.1699&lon=24.9384&appid=${process.env.OPENWEATHERMAP_API_KEY}`,
    baseUrl: 'https://api.openweathermap.org',
    key: 'OPENWEATHERMAP_API_KEY',
    required: true,
  },
  {
    name: 'Alpha Vantage GDX',
    url: `${BASE_URL}/api/alpha-vantage/query?function=GLOBAL_QUOTE&symbol=GDX&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    baseUrl: 'https://www.alphavantage.co',
    key: 'ALPHA_VANTAGE_API_KEY',
    required: true,
  },
  {
    name: 'FRED Series Observations',
    url: `${BASE_URL}/api/fred/fred/series/observations?series_id=FEDFUNDS&api_key=${process.env.FRED_API_KEY}&file_type=json`,
    baseUrl: 'https://api.stlouisfed.org',
    key: 'FRED_API_KEY',
    required: true,
  },
  // Precious Metals API
  {
    name: 'Precious Metals (Gold & Silver)',
    url: 'http://localhost:5173/api/precious-metals/XAU',
    baseUrl: 'https://api.gold-api.com',
  },
  {
    name: 'USGS Earthquake',
    url: `${BASE_URL}/api/usgs/fdsnws/event/1/query?format=geojson&starttime=${starttime}&endtime=${endtime}`,
    baseUrl: 'https://earthquake.usgs.gov',
    key: null,
    required: false,
  },
  {
    name: 'CWB Typhoon',
    url: `${BASE_URL}/api/cwb/v1/rest/datastore/W-C0034-002?Authorization=${process.env.CWB_API_KEY}&format=JSON`,
    baseUrl: 'https://opendata.cwb.gov.tw',
    key: 'CWB_API_KEY',
    required: true,
  },
  {
    name: 'WorldTimeAPI',
    url: `${BASE_URL}/api/time/api/timezone/Europe/Helsinki`,
    baseUrl: 'https://worldtimeapi.org',
    key: null,
    required: false,
  },
  {
    name: 'ECB Euribor 12M',
    url: 'https://sdw-wsrest.ecb.europa.eu/service/data/BSI.M.U2.EUR.R.IR12MM.R.A?format=json',
    baseUrl: 'https://sdw-wsrest.ecb.europa.eu',
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
  try {
    const res = await fetch(ep.url);
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
