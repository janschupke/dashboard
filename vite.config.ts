import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // CoinGecko API
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
      },
      // OpenWeatherMap API
      '/api/openweathermap': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openweathermap/, ''),
      },
      // Alpha Vantage API
      '/api/alpha-vantage': {
        target: 'https://www.alphavantage.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alpha-vantage/, ''),
      },
      // FRED API
      '/api/fred': {
        target: 'https://api.stlouisfed.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fred/, ''),
      },
      // USGS API
      '/api/usgs': {
        target: 'https://earthquake.usgs.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/usgs/, ''),
      },
      // Precious Metals API
      '/api/precious-metals': {
        target: 'https://api.gold-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/precious-metals\//, ''),
      },
      // TimeZoneDB API (official, not RapidAPI)
      '/api/timezonedb': {
        target: 'https://api.timezonedb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/timezonedb/, ''),
      },
      // ECB Euribor API
      '/api/ecb': {
        target: 'https://sdw-wsrest.ecb.europa.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ecb/, ''),
      },
    },
  },
});
