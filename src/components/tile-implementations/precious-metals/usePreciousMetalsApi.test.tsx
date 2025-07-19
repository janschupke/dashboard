import { describe, it, expect, beforeAll } from 'vitest';
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import { PreciousMetalsDataMapper } from './dataMapper';
import { TileType } from '../../../types/tile';
import type { GoldApiParams } from '../../../services/apiEndpoints';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.PRECIOUS_METALS, new PreciousMetalsDataMapper());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

beforeAll(() => {
  // registerPreciousMetalsDataMapper(); // This line is removed as per the edit hint
});

describe('usePreciousMetalsApi', () => {
  const mockTileId = 'test-precious-metals-tile';
  const mockParams: GoldApiParams = { symbol: 'XAU' };

  it('should successfully fetch precious metals data', async () => {
    // Mock the gold API response (current actual behavior)
    const mockResponse = {
      name: 'Gold',
      price: 3350.699951,
      symbol: 'XAU',
      updatedAt: '2025-07-19T12:38:58Z',
      updatedAtReadable: 'a few seconds ago',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => usePreciousMetalsApi(), { wrapper });
    const fetchResult = await result.current.getPreciousMetals(mockTileId, mockParams);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('lastDataRequest');
    expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
    expect(typeof fetchResult.lastDataRequest).toBe('number');

    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.gold?.price).toBe(3350.699951);
    expect(data?.silver?.price).toBe(0); // Silver is set to 0 in current implementation
  });
});
