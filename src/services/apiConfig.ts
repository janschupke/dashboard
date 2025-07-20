import { isLocalhost } from '../utils/isLocalhost';

export interface ApiKeyConfig {
  alphaVantage?: string;
  openWeatherMap?: string;
  fred?: string;
  cwb?: string;
  TIMEZONEDB_API_KEY?: string;
}

export function getApiKeys(): ApiKeyConfig {
  if (isLocalhost()) {
    return {
      alphaVantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
      openWeatherMap: import.meta.env.VITE_OPENWEATHERMAP_API_KEY,
      fred: import.meta.env.VITE_FRED_API_KEY,
      cwb: import.meta.env.VITE_CWB_API_KEY,
      TIMEZONEDB_API_KEY: import.meta.env.VITE_TIMEZONEDB_API_KEY,
    };
  }
  return {};
}
