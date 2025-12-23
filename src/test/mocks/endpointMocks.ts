import type { CryptocurrencyApiResponse } from '../../components/tile-implementations/cryptocurrency/types';
import type { EuriborRateApiResponse } from '../../components/tile-implementations/euribor-rate/types';
import type { FederalFundsRateApiResponse } from '../../components/tile-implementations/federal-funds-rate/types';
import type { GdxEtfApiResponse } from '../../components/tile-implementations/gdx-etf/types';
import type { PreciousMetalsApiResponse } from '../../components/tile-implementations/precious-metals/types';
import type { TimeApiResponse } from '../../components/tile-implementations/time/types';
import type { UraniumApiResponse } from '../../components/tile-implementations/uranium/types';
import type { WeatherApiResponse } from '../../components/tile-implementations/weather/types';

export type MockApiErrorType = 'network' | 'timeout' | 'api' | 'malformed';

export interface MockApiConfig {
  delay?: number;
  shouldFail?: boolean;
  errorType?: MockApiErrorType;
  status?: number;
  responseData?: unknown;
}

export interface EndpointMockConfig extends MockApiConfig {
  endpoint: string;
  responseData?: unknown;
}

// Mock response data generators
export class MockResponseData {
  static getCryptocurrencyData(): CryptocurrencyApiResponse[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        market_cap: 850000000000,
        market_cap_rank: 1,
        price_change_percentage_24h: 2.5,
        price_change_24h: 1100,
        total_volume: 25000000000,
        circulating_supply: 19000000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 69000,
        ath_change_percentage: -34.8,
        atl: 67.81,
        atl_change_percentage: 66234.5,
        last_updated: '2024-01-15T12:00:00.000Z',
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 2800,
        market_cap: 340000000000,
        market_cap_rank: 2,
        price_change_percentage_24h: 1.8,
        price_change_24h: 50,
        total_volume: 15000000000,
        circulating_supply: 120000000,
        total_supply: 120000000,
        max_supply: 0,
        ath: 4800,
        ath_change_percentage: -41.7,
        atl: 0.432979,
        atl_change_percentage: 646234.5,
        last_updated: '2024-01-15T12:00:00.000Z',
      },
    ];
  }

  static getWeatherData(): WeatherApiResponse {
    return {
      current: {
        temp: 22.5,
        feels_like: 24.0,
        humidity: 65,
        wind_speed: 12.5,
        wind_deg: 180,
        pressure: 1013,
        visibility: 10000,
        weather: [
          {
            main: 'Clouds',
            description: 'scattered clouds',
            icon: '03d',
          },
        ],
        dt: 1705312800,
      },
      daily: [
        {
          dt: 1705312800,
          temp: {
            min: 18.0,
            max: 25.0,
          },
          humidity: 65,
          wind_speed: 12.5,
          weather: [
            {
              main: 'Clouds',
              description: 'scattered clouds',
              icon: '03d',
            },
          ],
        },
      ],
      timezone: 'Europe/Berlin',
    };
  }

  static getFederalFundsRateData(): FederalFundsRateApiResponse {
    return {
      observations: [
        {
          realtime_start: '2024-01-15',
          realtime_end: '2024-01-15',
          date: '2024-01-15',
          value: '5.50',
        },
        {
          realtime_start: '2024-01-14',
          realtime_end: '2024-01-14',
          date: '2024-01-14',
          value: '5.50',
        },
      ],
    };
  }

  static getTimeData(): TimeApiResponse {
    return {
      status: 'OK',
      message: '',
      countryCode: 'DE',
      zoneName: 'Europe/Berlin',
      abbreviation: 'CET',
      gmtOffset: 3600,
      dst: '0',
      timestamp: 1705329025, // 2024-01-15T14:30:25+01:00
      formatted: '2024-01-15 14:30:25',
    };
  }

  static getUraniumData(): UraniumApiResponse {
    return {
      spotPrice: 85.5,
      history: [
        { date: '2024-01-15', price: 85.5 },
        { date: '2024-01-14', price: 84.2 },
      ],
      change: 1.3,
      changePercent: 1.54,
      lastUpdated: '2024-01-15T12:00:00.000Z',
      volume: 1500000,
      supply: 50000,
      demand: 48000,
      marketStatus: 'active',
    };
  }

  static getGdxEtfData(): GdxEtfApiResponse {
    return {
      symbol: 'GDX',
      name: 'VanEck Gold Miners ETF',
      currentPrice: 28.45,
      previousClose: 28.2,
      priceChange: 0.25,
      priceChangePercent: 0.89,
      volume: 25000000,
      marketCap: 8500000000,
      high: 28.75,
      low: 28.1,
      open: 28.25,
      lastUpdated: '2024-01-15T12:00:00.000Z',
      tradingStatus: 'open',
    };
  }

  static getEuriborRateData(): EuriborRateApiResponse {
    return {
      dataSets: [
        {
          series: {
            '0:0:0:0:0': {
              observations: {
                '0': [3.85],
                '1': [3.85],
              },
            },
          },
        },
      ],
      structure: {
        dimensions: {
          observation: [
            {
              values: [
                { id: '2024-01-15', name: { en: '2024-01-15' } },
                { id: '2024-01-14', name: { en: '2024-01-14' } },
              ],
            },
          ],
        },
      },
    };
  }

  static getWeatherAlertsData(): {
    alerts: Array<{
      sender_name: string;
      event: string;
      start: number;
      end: number;
      description: string;
      tags?: string[];
    }>;
  } {
    return {
      alerts: [
        {
          sender_name: 'CWA',
          event: 'Severe Weather Warning',
          start: 1721000000,
          end: 1721100000,
          description: 'A severe weather event is expected.',
          tags: ['weather', 'warning'],
        },
      ],
    };
  }

  static getEarthquakeData(): {
    type: string;
    metadata: {
      generated: number;
      url: string;
      title: string;
      status: number;
      api: string;
      count: number;
    };
    features: Array<{
      type: string;
      properties: {
        mag: number;
        place: string;
        time: number;
        updated: number;
        url: string;
        status: string;
        code: string;
        title: string;
        type: string;
      };
      geometry: { type: string; coordinates: number[] };
      id: string;
    }>;
    bbox: number[];
  } {
    return {
      type: 'FeatureCollection',
      metadata: {
        generated: 1234567890,
        url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
        title: 'USGS Earthquakes',
        status: 200,
        api: '1.10.3',
        count: 1,
      },
      features: [
        {
          type: 'Feature',
          properties: {
            mag: 5.2,
            place: '100km S of Randomville',
            time: 1620000000000,
            updated: 1620000001000,
            url: 'https://earthquake.usgs.gov/earthquakes/eventpage/abcd1234',
            status: 'reviewed',
            code: 'abcd1234',
            title: 'M 5.2 - 100km S of Randomville',
            type: 'earthquake',
          },
          geometry: {
            type: 'Point',
            coordinates: [140.123, 35.678, 10],
          },
          id: 'abcd1234',
        },
      ],
      bbox: [140.123, 35.678, 10, 140.123, 35.678, 10],
    };
  }

  static getPreciousMetalsData(symbol?: string): PreciousMetalsApiResponse {
    // Return data based on symbol if provided
    if (symbol === 'XAG') {
      return {
        gold: {
          price: 3350.699951,
          change_24h: 15.25,
          change_percentage_24h: 0.75,
        },
        silver: {
          price: 23.45,
          change_24h: -0.15,
          change_percentage_24h: -0.64,
        },
      };
    }
    return {
      gold: {
        price: 3350.699951,
        change_24h: 15.25,
        change_percentage_24h: 0.75,
      },
      silver: {
        price: 23.45,
        change_24h: -0.15,
        change_percentage_24h: -0.64,
      },
    };
  }
}

function extractPath(url: string): string {
  try {
    const u = new URL(url, 'http://localhost:3000');
    return u.pathname;
  } catch {
    // If not a valid URL, return as is
    return url;
  }
}

// Enhanced mock API service
export class EndpointMockService {
  private static instance: EndpointMockService;
  private mockConfigs: Map<string, MockApiConfig> = new Map();

  private constructor() {}

  static getInstance(): EndpointMockService {
    if (!EndpointMockService.instance) {
      EndpointMockService.instance = new EndpointMockService();
    }
    return EndpointMockService.instance;
  }

  configureMock(endpoint: string, config: MockApiConfig): void {
    const normalizedPath = extractPath(endpoint);
    this.mockConfigs.set(normalizedPath, config);
  }

  configureMocks(configs: EndpointMockConfig[]): void {
    configs.forEach((config) => {
      const normalizedPath = extractPath(config.endpoint);
      this.mockConfigs.set(normalizedPath, config);
    });
  }

  async mockRequest(url: string): Promise<Response> {
    const config = this.getMockConfig(url);
    if (!config) {
      return Promise.reject(new Error(`No mock configured for ${url}`));
    }

    // Simulate network delay
    if (config.delay) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }

    // Simulate failures
    if (config.shouldFail) {
      throw this.createMockError(config.errorType ?? 'network');
    }

    // Handle empty/null/undefined responseData cases:
    //   - undefined: use default mock response
    //   - null: return JSON null
    //   - empty array: return as is
    let mockData;
    if (config.responseData === undefined) {
      mockData = { data: 'mock response' };
    } else if (config.responseData === null) {
      mockData = null;
    } else {
      mockData = config.responseData;
    }
    const status = config.status ?? 200;

    return new Response(JSON.stringify(mockData), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private createMockError(errorType: MockApiErrorType): Error {
    switch (errorType) {
      case 'network':
        return new Error('Network error: Failed to fetch');
      case 'timeout':
        return new Error('Request timeout');
      case 'api':
        return new Error('API error: 500 Internal Server Error');
      case 'malformed':
        return new Error('Invalid JSON response');
      default:
        return new Error('Unknown error');
    }
  }

  clearMocks(): void {
    this.mockConfigs.clear();
  }

  getMockConfig(url: string): MockApiConfig | undefined {
    const normalizedPath = extractPath(url);
    const config = this.mockConfigs.get(normalizedPath);
    return config;
  }

  // Setup global fetch mock
  setupGlobalMock(): void {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();

      // Check if we have a mock for this endpoint
      const config = this.getMockConfig(url);
      if (config) {
        return this.mockRequest(url);
      }

      // Fallback to original fetch for unmocked endpoints
      return originalFetch(input, init);
    };
  }

  // Restore original fetch
  restoreGlobalMock(): void {
    // This would need to be called with the original fetch reference
    // For now, we'll rely on test setup to handle this
  }
}

// Predefined mock configurations for common scenarios
export const MockScenarios = {
  success: (endpoint: string, responseData?: unknown): EndpointMockConfig => ({
    endpoint,
    responseData,
    shouldFail: false,
    status: 200,
  }),

  networkError: (endpoint: string): EndpointMockConfig => ({
    endpoint,
    shouldFail: true,
    errorType: 'network',
  }),

  timeoutError: (endpoint: string): EndpointMockConfig => ({
    endpoint,
    shouldFail: true,
    errorType: 'timeout',
  }),

  apiError: (endpoint: string): EndpointMockConfig => ({
    endpoint,
    shouldFail: true,
    errorType: 'api',
    status: 500,
  }),

  malformedResponse: (endpoint: string): EndpointMockConfig => ({
    endpoint,
    shouldFail: true,
    errorType: 'malformed',
  }),

  delayedSuccess: (endpoint: string, responseData?: unknown, delay = 100): EndpointMockConfig => ({
    endpoint,
    responseData,
    delay,
    shouldFail: false,
    status: 200,
  }),
};
