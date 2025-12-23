import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';

import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { setupPreciousMetalsSuccessMock } from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { PreciousMetalsDataMapper } from './dataMapper';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';

import type { QueryParams } from '../../../services/apiEndpoints';

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
  const mockParams: QueryParams = {};

  it('should successfully fetch precious metals data', async () => {
    setupPreciousMetalsSuccessMock();

    const { result } = renderHook(() => usePreciousMetalsApi(), { wrapper });
    const fetchResult = await result.current.getPreciousMetals(
      mockTileId,
      { symbol: 'XAU' },
      mockParams,
    );
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('lastDataRequest');
    expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
    expect(typeof fetchResult.lastDataRequest).toBe('number');

    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.gold?.price).toBe(3350.699951);
    expect(data?.silver?.price).toBe(23.45); // Silver price from mock data
  });
});
