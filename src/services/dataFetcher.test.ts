import { describe, it, expect, beforeEach } from 'vitest';

import { DataFetcher } from './dataFetcher';
import { DataMapperRegistry } from './dataMapper';
import { DataParserRegistry, BaseDataParser } from './dataParser';
import { storageManager } from './storageManager';

// Only keep tests for fetchAndParse and DataParserRegistry
// Note: This test doesn't make actual HTTP requests - it passes mock functions to fetchAndParse

describe('DataFetcher.fetchAndParse', () => {
  type RawData = { value: number };
  type TileData = { doubled: number };
  const tileType = 'test-tile';

  class MockParser extends BaseDataParser<RawData, TileData> {
    parse(rawData: RawData): TileData {
      return { doubled: rawData.value * 2 };
    }
    validate(rawData: unknown): rawData is RawData {
      return typeof rawData === 'object' && rawData !== null && 'value' in rawData;
    }
  }

  class ThrowingParser extends BaseDataParser<RawData, TileData> {
    parse(): TileData {
      throw new Error('Parse failed');
    }
    validate(_rawData: unknown): _rawData is RawData {
      return true;
    }
  }

  let parserRegistry: DataParserRegistry;
  let mapperRegistry: DataMapperRegistry;
  let fetcher: DataFetcher;

  beforeEach(() => {
    storageManager.init();
    storageManager.clearTileState();
    parserRegistry = new DataParserRegistry();
    mapperRegistry = new DataMapperRegistry();
    fetcher = new DataFetcher(mapperRegistry, parserRegistry);
    parserRegistry.register(tileType, new MockParser());
    parserRegistry.register('throw-tile', new ThrowingParser());
  });

  it('parses raw data successfully', async () => {
    const fetchFunction = async () => ({ data: { value: 5 }, status: 200 });
    const result = await fetcher.fetchAndParse(
      fetchFunction,
      'parse-success-key',
      tileType,
      undefined,
      '/mock-url',
    );
    expect(result.data).toEqual({ doubled: 10 });
    // No error or isCached fields anymore
    expect(result.lastDataRequestSuccessful).toBe(true);
    // Should save lastSuccessfulDataRequest timestamp
    expect(result.lastSuccessfulDataRequest).toBeTruthy();
    expect(typeof result.lastSuccessfulDataRequest).toBe('number');
  });

  it('saves lastSuccessfulDataRequest when data is successfully fetched', async () => {
    const fetchFunction = async () => ({ data: { value: 5 }, status: 200 });
    const beforeTime = Date.now();
    const result = await fetcher.fetchAndParse(
      fetchFunction,
      'success-timestamp-key',
      tileType,
      undefined,
      '/mock-url',
    );
    const afterTime = Date.now();

    expect(result.lastDataRequestSuccessful).toBe(true);
    expect(result.lastSuccessfulDataRequest).toBeTruthy();
    expect(result.lastSuccessfulDataRequest).toBeGreaterThanOrEqual(beforeTime);
    expect(result.lastSuccessfulDataRequest).toBeLessThanOrEqual(afterTime);

    // Verify it's saved in storage
    const storedState = storageManager.getTileState('success-timestamp-key');
    expect(storedState).toBeTruthy();
    expect(storedState?.lastSuccessfulDataRequest).toBe(result.lastSuccessfulDataRequest);
    expect(storedState?.lastDataRequestSuccessful).toBe(true);
  });

  it('preserves lastSuccessfulDataRequest when subsequent request fails', async () => {
    // First successful fetch
    const successFetch = async () => ({ data: { value: 10 }, status: 200 });
    const successResult = await fetcher.fetchAndParse(
      successFetch,
      'preserve-timestamp-key',
      tileType,
      undefined,
      '/mock-url',
    );
    const savedTimestamp = successResult.lastSuccessfulDataRequest;
    expect(savedTimestamp).toBeTruthy();

    // Second fetch fails but has cached data
    const failFetch = async () => {
      throw new Error('Network error');
    };
    // Now returns TileConfig instead of throwing
    const failResult = await fetcher.fetchAndParse(
      failFetch,
      'preserve-timestamp-key',
      tileType,
      undefined,
      '/mock-url',
    );

    // Should preserve the lastSuccessfulDataRequest from the successful fetch
    expect(failResult.lastSuccessfulDataRequest).toBe(savedTimestamp);
    expect(failResult.lastDataRequestSuccessful).toBe(false);
    expect(failResult.data).toEqual({ doubled: 20 }); // Cached data preserved

    // Verify storage is also updated
    const storedState = storageManager.getTileState('preserve-timestamp-key');
    expect(storedState).toBeTruthy();
    expect(storedState?.lastSuccessfulDataRequest).toBe(savedTimestamp);
    expect(storedState?.lastDataRequestSuccessful).toBe(false);
    expect(storedState?.data).toEqual({ doubled: 20 }); // Cached data preserved
  });

  it('returns error TileConfig when request fails with no cached data', async () => {
    const failFetch = async () => {
      throw new Error('Network error');
    };

    const beforeTime = Date.now();
    const result = await fetcher.fetchAndParse(
      failFetch,
      'error-no-cache-key',
      tileType,
      undefined,
      '/mock-url',
    );
    const afterTime = Date.now();

    // Should return TileConfig with error state (never throw)
    expect(result).toBeTruthy();
    expect(result.data).toBeNull();
    expect(result.lastDataRequestSuccessful).toBe(false);
    expect(result.lastSuccessfulDataRequest).toBeNull();
    expect(result.lastDataRequest).toBeGreaterThanOrEqual(beforeTime);
    expect(result.lastDataRequest).toBeLessThanOrEqual(afterTime);

    // Verify storage is updated with new timestamp
    const storedState = storageManager.getTileState('error-no-cache-key');
    expect(storedState).toBeTruthy();
    expect(storedState?.lastDataRequest).toBe(result.lastDataRequest);
    expect(storedState?.lastDataRequestSuccessful).toBe(false);
  });

  it('updates lastDataRequest timestamp on repeated error requests', async () => {
    const failFetch = async () => {
      throw new Error('Network error');
    };

    // First error request
    const firstResult = await fetcher.fetchAndParse(
      failFetch,
      'repeated-error-key',
      tileType,
      undefined,
      '/mock-url',
    );
    const firstTimestamp = firstResult.lastDataRequest;
    expect(firstTimestamp).toBeTruthy();

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Second error request
    const secondResult = await fetcher.fetchAndParse(
      failFetch,
      'repeated-error-key',
      tileType,
      undefined,
      '/mock-url',
    );
    const secondTimestamp = secondResult.lastDataRequest;

    // Should have updated timestamp
    expect(secondTimestamp).toBeGreaterThan(firstTimestamp);
    expect(secondResult.lastDataRequestSuccessful).toBe(false);
    expect(secondResult.data).toBeNull();

    // Verify storage is updated
    const storedState = storageManager.getTileState('repeated-error-key');
    expect(storedState?.lastDataRequest).toBe(secondTimestamp);
  });

  it('throws error if parser not found (configuration error, not data error)', async () => {
    // Parser not found is a configuration error, not a data fetch error
    // This should still throw because it's a programming error
    const fetchFunction = async () => ({ data: { value: 5 }, status: 200 });
    await expect(
      fetcher.fetchAndParse(
        fetchFunction,
        'parser-not-found-key',
        'unknown-tile',
        undefined,
        '/mock-url',
      ),
    ).rejects.toThrow(/api\.noParserFound|No parser/);
  });

  it('returns error TileConfig when parse throws', async () => {
    const fetchFunction = async () => ({ data: { value: 5 }, status: 200 });
    const result = await fetcher.fetchAndParse(
      fetchFunction,
      'parse-throws-key',
      'throw-tile',
      undefined,
      '/mock-url',
    );

    // Should return TileConfig with error state (never throw)
    expect(result).toBeTruthy();
    expect(result.data).toBeNull();
    expect(result.lastDataRequestSuccessful).toBe(false);
  });

  it('returns cached data if fresh', async () => {
    // First call to cache data
    const fetchFunction = async () => ({ data: { value: 7 }, status: 200 });
    await fetcher.fetchAndParse(
      fetchFunction,
      'cache-key',
      tileType,
      { apiCall: tileType },
      '/mock-url',
    );
    // Second call should return cached data
    const result = await fetcher.fetchAndParse(
      fetchFunction,
      'cache-key',
      tileType,
      undefined,
      '/mock-url',
    );
    expect(result.data).toEqual({ doubled: 14 });
    expect(result.lastDataRequestSuccessful).toBe(true);
  });

  it('returns cached data when fetch fails', async () => {
    // First call to cache data
    const fetchFunction = async () => ({ data: { value: 7 }, status: 200 });
    await fetcher.fetchAndParse(
      fetchFunction,
      'cache-fail-key',
      tileType,
      { apiCall: tileType },
      '/mock-url',
    );

    // Second call with failing fetch should return cached data
    const failingFetchFunction = async () => {
      throw new Error('Network error');
    };
    const result = await fetcher.fetchAndParse(
      failingFetchFunction,
      'cache-fail-key',
      tileType,
      { apiCall: tileType },
      '/mock-url',
    );
    expect(result.data).toEqual({ doubled: 14 });
    expect(result.lastDataRequestSuccessful).toBe(false);
  });
});

describe('DataParserRegistry', () => {
  type Raw = { foo: string };
  type Data = { bar: string };
  class TestParser extends BaseDataParser<Raw, Data> {
    parse(raw: Raw): Data {
      return { bar: raw.foo };
    }
    validate(raw: unknown): raw is Raw {
      return typeof raw === 'object' && raw !== null && 'foo' in raw;
    }
  }
  it('registers and retrieves a parser', () => {
    const registry = new DataParserRegistry();
    registry.register('test', new TestParser());
    const parser = registry.get<'test', Raw, Data>('test');
    expect(parser).toBeDefined();
    expect(parser?.parse({ foo: 'baz' })).toEqual({ bar: 'baz' });
  });
  it('returns undefined for unknown type', () => {
    const registry = new DataParserRegistry();
    expect(registry.get<'unknown', Raw, Data>('unknown')).toBeUndefined();
  });
});
