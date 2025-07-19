import {
  APILogLevel,
  storageManager,
  type APILogDetails,
  type TileDataType,
  type TileConfig,
  type TileState,
} from './storageManager';
import { type BaseApiResponse, DataMapperRegistry } from './dataMapper';
import { DataParserRegistry } from './dataParser';

export const DATA_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface FetchResponse {
  data: unknown;
  status: number;
}

export interface FetchOptions {
  forceRefresh?: boolean;
  apiCall: string;
}

export class DataFetcher {
  private mapperRegistry: DataMapperRegistry;
  private parserRegistry: DataParserRegistry;

  constructor(mapperRegistry: DataMapperRegistry, parserRegistry: DataParserRegistry) {
    this.mapperRegistry = mapperRegistry;
    this.parserRegistry = parserRegistry;
  }

  // Helper to handle fetch, status extraction, mapping/parsing, and error logging
  private async handleFetchAndTransform<TTileData extends TileDataType>(
    fetchFunction: () => Promise<FetchResponse>,
    storageKey: string,
    apiCall: string,
    transform: (input: unknown) => TTileData,
    forceRefresh = false,
  ): Promise<TileConfig<TTileData>> {
    const cachedTileState = storageManager.getTileState<TTileData>(storageKey);
    const now = Date.now();
    const isRefreshNeeded =
      cachedTileState && now - cachedTileState.lastDataRequest > DATA_REFRESH_INTERVAL;

    // Return cached data, no API call performed
    if (!forceRefresh && cachedTileState && !isRefreshNeeded) {
      return {
        data: cachedTileState.data,
        lastDataRequest: cachedTileState.lastDataRequest,
        lastDataRequestSuccessful: cachedTileState.lastDataRequestSuccessful,
      };
    }

    let httpStatus: number | undefined;
    try {
      let apiResponse: unknown = await fetchFunction();
      // If fetchFunction returns a Response, extract status and data
      if (apiResponse instanceof Response) {
        httpStatus = apiResponse.status;
        const contentType = apiResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
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
          new Error(((apiResponse as Record<string, unknown>).error as string) || 'API error'),
          { status: httpStatus },
        );
      }
      // Alpha Vantage and similar APIs: treat 'Information', 'Error Message', 'Note' as errors
      if (apiResponse && typeof apiResponse === 'object') {
        const avErrorFields = ['Information', 'Error Message', 'Note'];
        const responseObj = apiResponse as Record<string, unknown>;
        for (const field of avErrorFields) {
          if (field in responseObj && typeof responseObj[field] === 'string') {
            const error = new Error(responseObj[field] as string);
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
      };

      storageManager.setTileState<TTileData>(storageKey, tileState);
      return tileState;
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
      };
      storageManager.addLog({
        level: APILogLevel.ERROR,
        apiCall,
        reason: errorMessage,
        details: logDetails,
      });

      const tileState: TileState<TTileData> = {
        data: cachedTileState?.data || null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
      };
      storageManager.setTileState<TTileData>(storageKey, tileState);
      return tileState;
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
  ): Promise<TileConfig<TTileData>> {
    const { forceRefresh = false, apiCall = tileType } = options;
    const mapper = this.mapperRegistry.get<TTileType, TApiResponse, TTileData>(tileType);
    if (!mapper) {
      throw new Error(`No data mapper found for tile type: ${tileType}`);
    }
    return this.handleFetchAndTransform(
      fetchFunction,
      storageKey,
      apiCall,
      (input) => mapper.safeMap(input) as unknown as TTileData,
      forceRefresh,
    );
  }

  async fetchAndParse<TTileType extends string, TRawData, TTileData extends TileDataType>(
    fetchFunction: () => Promise<FetchResponse>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
  ): Promise<TileConfig<TTileData>> {
    const { forceRefresh = false, apiCall = tileType } = options;
    const parser = this.parserRegistry.get<TTileType, TRawData, TTileData>(tileType);
    if (!parser) {
      throw new Error(`No parser registered for tile type: ${tileType}`);
    }
    return this.handleFetchAndTransform(
      fetchFunction,
      storageKey,
      apiCall,
      (input) => parser.safeParse(input) as unknown as TTileData,
      forceRefresh,
    );
  }
}
