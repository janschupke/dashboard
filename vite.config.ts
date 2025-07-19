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
      // EMMI API
      '/api/emmi': {
        target: 'https://www.emmi-benchmarks.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/emmi/, ''),
      },
      // USGS API
      '/api/usgs': {
        target: 'https://earthquake.usgs.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/usgs/, ''),
      },
      // CWB API
      '/api/cwb': {
        target: 'https://opendata.cwb.gov.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cwb/, ''),
      },
      // WorldTime API
      '/api/time': {
        target: 'https://worldtimeapi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/time/, ''),
      },
      // Precious Metals API
      '/api/precious-metals': {
        target: 'https://api.gold-api.com',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract symbol from path like /api/precious-metals/XAU
          const match = path.match(/^\/api\/precious-metals\/([^/]+)/);
          if (match) {
            return `/price/${match[1]}`;
          }
          return '/price/XAU'; // fallback
        },
      },
    },
  },
});
