import { DateTime } from 'luxon';
import { describe, it, expect } from 'vitest';

import { TileStatus } from '../components/tile/useTileData';

import { calculateTileStatus } from './statusCalculator';

import type { TileConfig, TileState } from '../services/storageManager';

type Data = { v: number } | null;

const makeCached = (
  overrides: Partial<TileState<NonNullable<Data>>> = {},
): TileState<NonNullable<Data>> => {
  const now = DateTime.utc().toMillis();
  return {
    data: (overrides.data as NonNullable<Data>) ?? { v: 1 },
    lastDataRequest: overrides.lastDataRequest ?? now,
    lastDataRequestSuccessful: overrides.lastDataRequestSuccessful ?? true,
    lastSuccessfulDataRequest: overrides.lastSuccessfulDataRequest ?? (overrides.lastDataRequestSuccessful !== false ? now : null),
  };
};

const makeResult = (
  overrides: Partial<TileConfig<NonNullable<Data>>> = {},
): TileConfig<NonNullable<Data>> => {
  const now = DateTime.utc().toMillis();
  return {
    data: (overrides.data as NonNullable<Data>) ?? { v: 2 },
    lastDataRequest: overrides.lastDataRequest ?? now,
    lastDataRequestSuccessful: overrides.lastDataRequestSuccessful ?? true,
    lastSuccessfulDataRequest: overrides.lastSuccessfulDataRequest ?? (overrides.lastDataRequestSuccessful !== false ? now : null),
  };
};

describe('statusCalculator.calculateTileStatus', () => {
  it('returns Loading when showLoading', () => {
    const res = calculateTileStatus({
      showLoading: true,
      error: null,
      result: null,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res).toEqual({ status: TileStatus.Loading, data: null, lastUpdated: null });
  });

  it('returns Stale from cache when error and cached exists', () => {
    const cached = makeCached({});
    const res = calculateTileStatus({
      showLoading: false,
      error: new Error('x'),
      result: null,
      tileId: 't1',
      getCachedData: () => cached,
    });
    expect(res.status).toBe(TileStatus.Stale);
    expect(res.data).toEqual(cached.data);
    expect(res.lastUpdated).toBeTruthy();
  });

  it('returns Error when error and no cache', () => {
    const res = calculateTileStatus({
      showLoading: false,
      error: new Error('x'),
      result: null,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res).toEqual({ status: TileStatus.Error, data: null, lastUpdated: null });
  });

  it('returns Success when lastDataRequestSuccessful with data', () => {
    const result = makeResult({ lastDataRequestSuccessful: true });
    const res = calculateTileStatus({
      showLoading: false,
      error: null,
      result,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res.status).toBe(TileStatus.Success);
    expect(res.data).toEqual(result.data);
    expect(res.lastUpdated).toBeTruthy();
  });

  it('returns Stale when not successful but has data', () => {
    const now = DateTime.utc().toMillis();
    const lastSuccessfulTime = now - 3600000; // 1 hour ago
    const result = makeResult({
      lastDataRequest: now,
      lastDataRequestSuccessful: false,
      lastSuccessfulDataRequest: lastSuccessfulTime,
    });
    const res = calculateTileStatus({
      showLoading: false,
      error: null,
      result,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res.status).toBe(TileStatus.Stale);
    expect(res.data).toEqual(result.data);
    // Should use lastSuccessfulDataRequest for stale status
    expect(res.lastUpdated).toBeTruthy();
    expect(res.lastUpdated?.toMillis()).toBe(lastSuccessfulTime);
  });

  it('uses lastSuccessfulDataRequest for stale status when available', () => {
    const baseTime = DateTime.utc().toMillis();
    const lastRequestTime = baseTime;
    const lastSuccessfulTime = baseTime - 7200000; // 2 hours ago (successful)
    const result = makeResult({
      lastDataRequest: lastRequestTime,
      lastDataRequestSuccessful: false,
      lastSuccessfulDataRequest: lastSuccessfulTime,
    });
    const res = calculateTileStatus({
      showLoading: false,
      error: null,
      result,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res.status).toBe(TileStatus.Stale);
    // Should use lastSuccessfulDataRequest, not lastDataRequest
    expect(res.lastUpdated).toBeTruthy();
    expect(res.lastUpdated?.toMillis()).toBe(lastSuccessfulTime);
  });

  it('uses lastSuccessfulDataRequest from cache when error occurs', () => {
    const baseTime = DateTime.utc().toMillis();
    const lastSuccessfulTime = baseTime - 1800000; // 30 minutes ago
    const cachedData = makeCached({
      lastDataRequest: baseTime,
      lastDataRequestSuccessful: false,
      lastSuccessfulDataRequest: lastSuccessfulTime,
    });
    const res = calculateTileStatus({
      showLoading: false,
      error: new Error('Network error'),
      result: null,
      tileId: 't1',
      getCachedData: () => cachedData,
    });
    expect(res.status).toBe(TileStatus.Stale);
    expect(res.data).toEqual(cachedData.data);
    // Should use lastSuccessfulDataRequest from cache
    expect(res.lastUpdated).toBeTruthy();
    expect(res.lastUpdated?.toMillis()).toBe(lastSuccessfulTime);
  });

  it('returns Error when no data but includes lastDataRequest timestamp', () => {
    const now = DateTime.utc().toMillis();
    // Create a result with null data explicitly
    const result: TileConfig<NonNullable<Data>> = {
      data: null as unknown as NonNullable<Data>,
      lastDataRequest: now,
      lastDataRequestSuccessful: false,
      lastSuccessfulDataRequest: null,
    };
    const res = calculateTileStatus({
      showLoading: false,
      error: null,
      result,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res.status).toBe(TileStatus.Error);
    expect(res.data).toBeNull();
    // Should include lastDataRequest timestamp (shows when the failed request was made)
    expect(res.lastUpdated).toBeTruthy();
    expect(res.lastUpdated?.toMillis()).toBe(now);
  });
});
