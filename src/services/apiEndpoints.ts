export interface ApiEndpoint<TParams extends object> {
  url: string;
  queryParams: TParams;
  pathParams?: Record<string, string>; // Add path parameters support
}

// --- Cryptocurrency (CoinGecko) ---
export interface CryptoMarketsParams {
  vs_currency: string;
  order?: string;
  per_page?: number;
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
}
export const OPENWEATHERMAP_ONECALL_ENDPOINT: ApiEndpoint<WeatherParams> = {
  url: '/api/openweathermap/data/3.0/onecall',
  queryParams: {} as WeatherParams,
};

export const OPENWEATHERMAP_ALERTS_ENDPOINT: ApiEndpoint<WeatherParams> = {
  url: '/api/openweathermap/data/3.0/onecall',
  queryParams: {} as WeatherParams,
};

// --- GDX ETF (Alpha Vantage) ---
export interface AlphaVantageParams {
  function: string; // e.g. 'GLOBAL_QUOTE'
  symbol: string; // e.g. 'GDX'
  apikey?: string; // API key, set from process.env.ALPHA_VANTAGE_API_KEY
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
}
export const FRED_SERIES_OBSERVATIONS_ENDPOINT: ApiEndpoint<FredParams> = {
  url: '/api/fred/fred/series/observations',
  queryParams: {} as FredParams,
};

// --- Euribor Rate (ECB, 12M) ---
export interface EuriborParams {
  format?: 'json' | 'xml';
}
export const ECB_EURIBOR_12M_ENDPOINT: ApiEndpoint<EuriborParams> = {
  // TODO: this is a direct URL, not an API endpoint
  url: '/api/ecb/service/data/BSI.M.U2.EUR.R.IR12MM.R.A',
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


export interface GoldApiParams {
  symbol: 'XAU' | 'XAG';
}
export const PRECIOUS_METALS_ENDPOINT: ApiEndpoint<GoldApiParams> = {
  url: '/api/precious-metals/price/{symbol}',
  queryParams: {} as GoldApiParams,
  pathParams: { symbol: '{symbol}' },
};

// --- Time (TimeZoneDB) ---
export interface TimeParams {
  lat: number;
  lng: number;
  by?: 'position' | 'zone'; 
  format?: 'json'; 
  key?: string; // API key, set from env or config
}

export const TIME_API_ENDPOINT: ApiEndpoint<TimeParams> = {
  url: '/api/timezonedb/v2.1/get-time-zone',
  queryParams: {} as TimeParams,
};

// --- Earthquake (USGS) ---
export interface UsgsEarthquakeParams {
  format: 'geojson';
  starttime: string;
  endtime: string;
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
  | UsgsEarthquakeParams
  | EuriborParams
  | UraniumHtmlParams;

// --- Endpoint Parser ---
export function buildApiUrl<TParams extends TileApiParams>(
  endpoint: ApiEndpoint<TParams>,
  params: TParams,
): string {
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
