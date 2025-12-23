import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { setupUraniumSuccessMock } from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { UraniumHtmlDataParser } from './dataParser';
import { useUraniumApi } from './useUraniumApi';

import type { UraniumTileData } from './types';
import type { UraniumHtmlQueryParams } from '../../../services/apiEndpoints';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ parserRegistry }) => {
      parserRegistry.register(TileType.URANIUM, new UraniumHtmlDataParser());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

describe('useUraniumApi', () => {
  const mockTileId = 'test-uranium-tile';
  const mockParams: UraniumHtmlQueryParams = {
    range: '1Y',
  };
  const expectedData: UraniumTileData = {
    spotPrice: 85.5,
    change: 0,
    changePercent: 0,
    lastUpdated: expect.any(String),
    history: [],
  };

  beforeEach(() => {
    setupUraniumSuccessMock();
  });

  it('should successfully fetch uranium data (HTML scraping)', async () => {
    const { result } = renderHook(() => useUraniumApi(), { wrapper });
    const fetchResult = await result.current.getUraniumPrice(mockTileId, {}, mockParams);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('lastDataRequest');
    expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');

    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.spotPrice).toBe(expectedData.spotPrice);
    expect(data?.history).toEqual(expectedData.history);
  });
});
