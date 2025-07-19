export interface ApiEndpoint<TParams extends object> {
  url: string;
  queryParams: TParams;
  pathParams?: Record<string, string>; // Add path parameters support
  broken?: boolean;
}

// --- Cryptocurrency (CoinGecko) ---
export interface CryptoMarketsParams {
  vs_currency: string; // required, e.g. 'usd'
  ids?: string; // optional, comma-separated coin ids
  order?: string; // optional, e.g. 'market_cap_desc'
  per_page?: number; // optional
  page?: number; // optional
  sparkline?: boolean; // optional
}

export const COINGECKO_MARKETS_ENDPOINT: ApiEndpoint<CryptoMarketsParams> = {
  url: '/api/coingecko/api/v3/coins/markets',
  queryParams: {} as CryptoMarketsParams,
};

// --- Weather (OpenWeatherMap) ---
export interface WeatherParams {
  lat: number; // required
  lon: number; // required
  appid?: string; // API key, set from process.env.OPENWEATHERMAP_API_KEY
  units?: 'metric' | 'imperial' | 'kelvin';
  exclude?: string;
  [key: string]: string | number | undefined;
}
export const OPENWEATHERMAP_ONECALL_ENDPOINT: ApiEndpoint<WeatherParams> = {
  url: '/api/openweathermap/data/2.5/onecall',
  queryParams: {} as WeatherParams,
};

// --- GDX ETF (Alpha Vantage) ---
export interface AlphaVantageParams {
  function: string; // e.g. 'GLOBAL_QUOTE'
  symbol: string; // e.g. 'GDX'
  apikey?: string; // API key, set from process.env.ALPHA_VANTAGE_API_KEY
  [key: string]: string | undefined;
}
export const ALPHA_VANTAGE_GDX_ENDPOINT: ApiEndpoint<AlphaVantageParams> = {
  url: '/api/alpha-vantage/query',
  queryParams: {} as AlphaVantageParams,
};

// --- FRED (Federal Funds Rate) ---
export interface FredParams {
  series_id: string; // required, e.g. 'FEDFUNDS'
  file_type: 'json'; // required
  api_key?: string; // API key, set from process.env.FRED_API_KEY
  observation_start?: string;
  observation_end?: string;
  frequency?: string;
  aggregation_method?: string;
  // TODO: comlletely useless...
  [key: string]: string | undefined;
}
export const FRED_SERIES_OBSERVATIONS_ENDPOINT: ApiEndpoint<FredParams> = {
  url: '/api/fred/fred/series/observations',
  queryParams: {} as FredParams,
};

// --- Euribor Rate (ECB, 12M) ---
export interface EuriborParams {
  format?: 'json' | 'xml';
  // ECB API doesn't require additional parameters
  [key: string]: string | undefined;
}
export const ECB_EURIBOR_12M_ENDPOINT: ApiEndpoint<EuriborParams> = {
  // TODO: this is a direct URL, not an API endpoint
  url: 'https://sdw-wsrest.ecb.europa.eu/service/data/BSI.M.U2.EUR.R.IR12MM.R.A',
  queryParams: {} as EuriborParams,
};

// --- Uranium Price (HTML Scraping) ---
export interface UraniumHtmlParams {
  range?: string; // optional, e.g. '1Y'
  // TODO: comlletely useless...
  [key: string]: string | undefined;
}
export const URANIUM_HTML_ENDPOINT: ApiEndpoint<UraniumHtmlParams> = {
  url: '/api/uranium-html',
  queryParams: {} as UraniumHtmlParams,
};

// --- Precious Metals (Gold & Silver Spot, gold-api.com via local proxy) ---
/**
 * Params for gold-api.com endpoints:
 * The API supports /price/{symbol} endpoints where symbol can be XAU, XAG, etc.
 * No query parameters are supported - prices are returned in USD
 *
 * Usage examples:
 * - buildApiUrl(PRECIOUS_METALS_ENDPOINT, { symbol: 'XAU' }) -> '/api/precious-metals/XAU'
 * - buildApiUrl(PRECIOUS_METALS_ENDPOINT, { symbol: 'XAG' }) -> '/api/precious-metals/XAG'
 */
export interface GoldApiParams {
  symbol: string; // required, e.g. 'XAU' for gold, 'XAG' for silver
}
export const PRECIOUS_METALS_ENDPOINT: ApiEndpoint<GoldApiParams> = {
  url: '/api/precious-metals/{symbol}',
  queryParams: {} as GoldApiParams,
  pathParams: { symbol: '{symbol}' },
};

// --- Time (WorldTimeAPI) ---
export interface TimeParams {
  city: string; // required, e.g. 'Europe/Berlin'
}
export const TIME_API_ENDPOINT: ApiEndpoint<TimeParams> = {
  url: '/api/time/api/timezone/{city}',
  queryParams: {} as TimeParams,
  pathParams: { city: '{city}' },
};

// --- Typhoon (CWB) ---
export interface TyphoonParams {
  Authorization: string; // API key, set from process.env.CWB_API_KEY
  format?: 'JSON' | 'XML'; // optional
  dataid?: string; // optional
}

export const CWB_TYPHOON_ENDPOINT: ApiEndpoint<TyphoonParams> = {
  url: '/api/cwb/v1/rest/datastore/W-C0034-002',
  queryParams: {} as TyphoonParams,
};

// --- Earthquake (USGS) ---
export interface UsgsEarthquakeParams {
  format: 'geojson';
  starttime: string; // YYYY-MM-DD
  endtime: string; // YYYY-MM-DD
  minmagnitude?: number;
  maxmagnitude?: number;
  latitude?: number;
  longitude?: number;
  maxradiuskm?: number;
  // TODO: comlletely useless...
  [key: string]: string | number | undefined;
}
export const USGS_EARTHQUAKE_ENDPOINT: ApiEndpoint<UsgsEarthquakeParams> = {
  url: '/api/usgs/fdsnws/event/1/query',
  queryParams: {} as UsgsEarthquakeParams,
};

export type TileApiParams =
  | CryptoMarketsParams
  | WeatherParams
  | AlphaVantageParams
  | FredParams
  | GoldApiParams
  | TimeParams
  | TyphoonParams
  | UsgsEarthquakeParams
  | EuriborParams
  | UraniumHtmlParams;

// --- Endpoint Parser ---
export function buildApiUrl<TParams extends TileApiParams>(
  endpoint: ApiEndpoint<TParams>,
  params: TParams,
): string {
  if (endpoint.broken) {
    throw new Error('This endpoint is currently broken or not implemented.');
  }

  let url = endpoint.url;

  // Handle path parameters
  if (endpoint.pathParams) {
    for (const [paramName, placeholder] of Object.entries(endpoint.pathParams)) {
      if (paramName in params) {
        const value = params[paramName as keyof TParams];
        if (value !== undefined && value !== null) {
          url = url.replace(placeholder, String(value));
        }
      }
    }
  }

  // Handle query parameters
  const queryParams = { ...params };

  // Remove path parameters from query params
  if (endpoint.pathParams) {
    for (const paramName of Object.keys(endpoint.pathParams)) {
      if (paramName in queryParams) {
        delete queryParams[paramName as keyof TParams];
      }
    }
  }

  const query = Object.entries(queryParams)
    .filter((entry) => entry[1] !== undefined && entry[1] !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return query ? `${url}?${query}` : url;
}
