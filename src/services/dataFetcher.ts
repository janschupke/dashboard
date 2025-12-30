import { DateTime } from 'luxon';

import { ALPHA_VANTAGE_ERROR_FIELDS } from '../constants/apiFields';
import i18n from '../i18n/config';
import { secondsToMs } from '../utils/timeUtils';

import { type BaseApiResponse, DataMapperRegistry } from './dataMapper';
import { DataParserRegistry } from './dataParser';
import {
  APILogLevel,
  storageManager,
  type APILogDetails,
  type TileDataType,
  type TileConfig,
  type TileState,
} from './storageManager';

const DATA_FETCH_TIMEOUT_MS = secondsToMs(15);

function timeoutPromise<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeout]);
}

export interface FetchResponse {
  data: unknown;
  status: number;
}

export interface FetchOptions {
  apiCall: string;
}

export class DataFetcher {
  private mapperRegistry: DataMapperRegistry;
  private parserRegistry: DataParserRegistry;

  constructor(mapperRegistry: DataMapperRegistry, parserRegistry: DataParserRegistry) {
    this.mapperRegistry = mapperRegistry;
    this.parserRegistry = parserRegistry;
  }

  /**
   * Fetches a resource with error handling for non-OK responses
   * @param input - The resource to fetch
   * @param init - Optional init object
   * @returns Promise that resolves to Response or throws an error for non-OK responses
   */
  async fetchWithError(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const response = await fetch(input, init);
    if (!response.ok) {
      throw Object.assign(new Error(`HTTP ${response.status}: ${response.statusText}`), {
        status: response.status,
      });
    }
    return response;
  }

  // Helper to handle fetch, status extraction, mapping/parsing, and error logging
  private async handleFetchAndTransform<TTileData extends TileDataType>(
    fetchFunction: () => Promise<FetchResponse>,
    storageKey: string,
    apiCall: string,
    transform: (input: unknown) => TTileData,
    requestUrl: string,
  ): Promise<TileConfig<TTileData>> {
    const now = DateTime.now().toMillis();
    let httpStatus: number | undefined;

    try {
      let apiResponse: unknown = await timeoutPromise(
        fetchFunction(),
        DATA_FETCH_TIMEOUT_MS,
        i18n.t('api.timeout', { seconds: 15 }),
      );
      // If fetchFunction returns a Response, extract status and data
      if (apiResponse instanceof Response) {
        httpStatus = apiResponse.status;
        const contentType = apiResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          apiResponse = await apiResponse.json();
        } else {
          apiResponse = await apiResponse.text();
        }
      } else if (
        apiResponse &&
        typeof apiResponse === 'object' &&
        'data' in apiResponse &&
        'status' in apiResponse &&
        typeof (apiResponse as { status?: unknown }).status === 'number'
      ) {
        httpStatus = (apiResponse as { status: number }).status;
        apiResponse = (apiResponse as { data: unknown }).data;
      }
      // If the API response contains an 'error' property, treat as error
      if (apiResponse && typeof apiResponse === 'object' && 'error' in apiResponse) {
        throw Object.assign(
          new Error(((apiResponse as Record<string, unknown>)['error'] as string) || 'API error'),
          { status: httpStatus },
        );
      }
      // Alpha Vantage and similar APIs: treat error fields as errors
      if (apiResponse && typeof apiResponse === 'object') {
        const responseObj = apiResponse as Record<string, unknown>;
        for (const field of ALPHA_VANTAGE_ERROR_FIELDS) {
          if (field in responseObj && typeof responseObj[field] === 'string') {
            const error = new Error(responseObj[field]);
            // Preserve the HTTP status code for logging
            Object.assign(error, { status: httpStatus });
            throw error;
          }
        }
      }

      const transformed = transform(apiResponse);
      const tileState: TileState<TTileData> = {
        data: transformed,
        lastDataRequest: now,
        lastDataRequestSuccessful: true,
        lastSuccessfulDataRequest: now, // Save timestamp of successful data fetch
      };

      storageManager.setTileState<TTileData>(storageKey, tileState);

      // Return TileConfig with all required fields
      return {
        ...transformed,
        data: transformed,
        lastDataRequest: now,
        lastDataRequestSuccessful: true,
        lastSuccessfulDataRequest: now,
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        typeof (error as { status?: unknown }).status === 'number'
      ) {
        httpStatus = (error as { status: number }).status;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      const logDetails: APILogDetails = {
        storageKey,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage,
        ...(httpStatus !== undefined ? { status: httpStatus } : {}),
        ...(requestUrl ? { requestUrl } : {}),
      };
      storageManager.addLog({
        level: APILogLevel.ERROR,
        apiCall,
        reason: errorMessage,
        details: logDetails,
      });

      // On error, always return a TileConfig (never throw)
      // This ensures React Query always gets a result, even on error
      const cachedState = storageManager.getTileState<TTileData>(storageKey);
      const tileState: TileState<TTileData> = {
        data: cachedState?.data ?? null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
        lastSuccessfulDataRequest: cachedState?.lastSuccessfulDataRequest ?? null, // Preserve last successful timestamp
      };
      storageManager.setTileState<TTileData>(storageKey, tileState);

      // Always return TileConfig, even if there's no cached data
      // This ensures React Query gets the updated lastDataRequest timestamp
      if (cachedState?.data) {
        return {
          ...cachedState.data,
          data: cachedState.data,
          lastDataRequest: now,
          lastDataRequestSuccessful: false,
          lastSuccessfulDataRequest: cachedState.lastSuccessfulDataRequest ?? null,
        };
      }

      // No cached data - return error TileConfig (never throw)
      // Create a minimal TileConfig with error state
      return {
        data: null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
        lastSuccessfulDataRequest: null,
      } as TileConfig<TTileData>;
    }
  }

  async fetchAndMap<
    TTileType extends string,
    TApiResponse extends BaseApiResponse | BaseApiResponse[],
    TTileData extends TileDataType,
  >(
    fetchFunction: () => Promise<FetchResponse>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
    requestUrl: string,
  ): Promise<TileConfig<TTileData>> {
    const { apiCall = tileType } = options;
    const mapper = this.mapperRegistry.get<TTileType, TApiResponse, TTileData>(tileType);
    if (!mapper) {
      throw new Error(i18n.t('api.noMapperFound', { tileType }));
    }
    return this.handleFetchAndTransform(
      fetchFunction,
      storageKey,
      apiCall,
      (input) => mapper.safeMap(input) as unknown as TTileData,
      requestUrl,
    );
  }

  async fetchAndParse<TTileType extends string, TRawData, TTileData extends TileDataType>(
    fetchFunction: () => Promise<FetchResponse>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
    requestUrl: string,
  ): Promise<TileConfig<TTileData>> {
    const { apiCall = tileType } = options;
    const parser = this.parserRegistry.get<TTileType, TRawData, TTileData>(tileType);
    if (!parser) {
      throw new Error(i18n.t('api.noParserFound', { tileType }));
    }
    return this.handleFetchAndTransform(
      fetchFunction,
      storageKey,
      apiCall,
      (input) => parser.safeParse(input) as unknown as TTileData,
      requestUrl,
    );
  }
}
