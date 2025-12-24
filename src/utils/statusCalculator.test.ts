import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { calculateTileStatus } from './statusCalculator';
import { TileStatus } from '../components/tile/useTileData';

const makeCached = (overrides: Partial<any> = {}) => ({
  data: overrides.data ?? { v: 1 },
  lastDataRequest: overrides.lastDataRequest ?? DateTime.utc().toMillis(),
  lastDataRequestSuccessful: overrides.lastDataRequestSuccessful ?? true,
});

const makeResult = (overrides: Partial<any> = {}) => ({
  data: overrides.data ?? { v: 2 },
  lastDataRequest: overrides.lastDataRequest ?? DateTime.utc().toMillis(),
  lastDataRequestSuccessful: overrides.lastDataRequestSuccessful ?? true,
});

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
    const result = makeResult({ lastDataRequestSuccessful: false });
    const res = calculateTileStatus({
      showLoading: false,
      error: null,
      result,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res.status).toBe(TileStatus.Stale);
    expect(res.data).toEqual(result.data);
  });

  it('returns Error when no data', () => {
    const result = makeResult({});
    // Explicitly set data to null to simulate no data
    (result as any).data = null;
    const res = calculateTileStatus({
      showLoading: false,
      error: null,
      result,
      tileId: 't1',
      getCachedData: () => null,
    });
    expect(res).toEqual({ status: TileStatus.Error, data: null, lastUpdated: null });
  });
});
