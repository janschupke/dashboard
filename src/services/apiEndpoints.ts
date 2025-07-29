// Base interfaces for API parameters - no index signatures to prevent invalid parameters
// This ensures that only explicitly defined properties are allowed in parameter objects.
// Invalid properties will cause TypeScript compilation errors.
export type PathParams = Record<never, never>;

export type QueryParams = Record<never, never>;

export interface ApiEndpoint<
  TPathParams extends PathParams = PathParams,
  TQueryParams extends QueryParams = QueryParams,
> {
  url: string;
  pathParams: TPathParams;
  queryParams: TQueryParams;
}

// --- Cryptocurrency (CoinGecko) ---
export interface CryptoMarketsQueryParams extends QueryParams {
  vs_currency: string;
  ids?: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
}

export const COINGECKO_MARKETS_ENDPOINT: ApiEndpoint<PathParams, CryptoMarketsQueryParams> = {
  url: '/api/coingecko/api/v3/coins/markets',
  pathParams: {},
  queryParams: {} as CryptoMarketsQueryParams,
};

// --- Weather (OpenWeatherMap) ---
export interface WeatherQueryParams extends QueryParams {
  lat: number; // required
  lon: number; // required
  units?: 'metric' | 'imperial' | 'kelvin';
  exclude?: string;
}

export const OPENWEATHERMAP_ONECALL_ENDPOINT: ApiEndpoint<PathParams, WeatherQueryParams> = {
  url: '/api/openweathermap/data/3.0/onecall',
  pathParams: {},
  queryParams: {} as WeatherQueryParams,
};

export const OPENWEATHERMAP_ALERTS_ENDPOINT: ApiEndpoint<PathParams, WeatherQueryParams> = {
  url: '/api/openweathermap/data/3.0/onecall',
  pathParams: {},
  queryParams: {} as WeatherQueryParams,
};

// --- GDX ETF (Alpha Vantage) ---
export interface AlphaVantageQueryParams extends QueryParams {
  function: string;
  symbol: string;
  observation_start?: string;
  observation_end?: string;
  frequency?: string;
  aggregation_method?: string;
}

export const ALPHA_VANTAGE_GDX_ENDPOINT: ApiEndpoint<PathParams, AlphaVantageQueryParams> = {
  url: '/api/alpha-vantage/query',
  pathParams: {},
  queryParams: {} as AlphaVantageQueryParams,
};

// --- FRED (Federal Funds Rate) ---
export interface FredQueryParams extends QueryParams {
  series_id: string; // required, e.g. 'FEDFUNDS'
  file_type: 'json'; // required
}

export const FRED_SERIES_OBSERVATIONS_ENDPOINT: ApiEndpoint<PathParams, FredQueryParams> = {
  url: '/api/fred/fred/series/observations',
  pathParams: {},
  queryParams: {} as FredQueryParams,
};

// --- Euribor Rate (ECB, 12M) ---
export interface EuriborQueryParams extends QueryParams {
  format?: 'json' | 'xml';
}

export const ECB_EURIBOR_12M_ENDPOINT: ApiEndpoint<PathParams, EuriborQueryParams> = {
  // TODO: this is a direct URL, not an API endpoint
  url: '/api/ecb/service/data/BSI.M.U2.EUR.R.IR12MM.R.A',
  pathParams: {},
  queryParams: {} as EuriborQueryParams,
};

// --- Uranium Price (HTML Scraping) ---
export interface UraniumHtmlQueryParams extends QueryParams {
  range?: string; // optional, e.g. '1Y'
}

export const URANIUM_HTML_ENDPOINT: ApiEndpoint<PathParams, UraniumHtmlQueryParams> = {
  url: '/api/uranium-html',
  pathParams: {},
  queryParams: {} as UraniumHtmlQueryParams,
};

// --- Precious Metals ---
export interface GoldApiPathParams extends PathParams {
  symbol: 'XAU' | 'XAG';
}

export const PRECIOUS_METALS_ENDPOINT: ApiEndpoint<GoldApiPathParams, QueryParams> = {
  url: '/api/precious-metals/:symbol',
  pathParams: { symbol: 'XAU' },
  queryParams: {},
};

// --- Time (TimeZoneDB) ---
export interface TimeQueryParams extends QueryParams {
  lat: number;
  lng: number;
  by?: 'position' | 'zone';
  format?: 'json';
}

export const TIME_API_ENDPOINT: ApiEndpoint<PathParams, TimeQueryParams> = {
  url: '/api/timezonedb/v2.1/get-time-zone',
  pathParams: {},
  queryParams: {} as TimeQueryParams,
};

// --- Earthquake (USGS) ---
export interface UsgsEarthquakeQueryParams extends QueryParams {
  format: 'geojson';
  starttime: string;
  endtime: string;
  minmagnitude?: number;
  maxmagnitude?: number;
  latitude?: number;
  longitude?: number;
  maxradiuskm?: number;
}

export const USGS_EARTHQUAKE_ENDPOINT: ApiEndpoint<PathParams, UsgsEarthquakeQueryParams> = {
  url: '/api/usgs/fdsnws/event/1/query',
  pathParams: {},
  queryParams: {} as UsgsEarthquakeQueryParams,
};

// Union types for all parameter types
export type TileApiPathParams = PathParams | GoldApiPathParams;

export type TileApiQueryParams =
  | CryptoMarketsQueryParams
  | WeatherQueryParams
  | AlphaVantageQueryParams
  | FredQueryParams
  | TimeQueryParams
  | UsgsEarthquakeQueryParams
  | EuriborQueryParams
  | UraniumHtmlQueryParams
  | QueryParams;

// --- Endpoint Parser ---
export function buildApiUrl<TPathParams extends PathParams, TQueryParams extends QueryParams>(
  endpoint: ApiEndpoint<TPathParams, TQueryParams>,
  pathParams: TPathParams,
  queryParams: TQueryParams,
): string {
  let url = endpoint.url;

  // Handle path parameters - replace :param with actual values
  for (const [paramName, value] of Object.entries(pathParams)) {
    if (value !== undefined && value !== null) {
      const placeholder = `:${paramName}`;
      url = url.replace(placeholder, String(value));
    }
  }

  // Handle query parameters
  const query = Object.entries(queryParams)
    .filter((entry) => entry[1] !== undefined && entry[1] !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return query ? `${url}?${query}` : url;
}
