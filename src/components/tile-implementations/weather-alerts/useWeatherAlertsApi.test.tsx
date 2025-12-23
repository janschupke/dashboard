import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { setupWeatherAlertsSuccessMock } from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { WeatherAlertsDataMapper } from './dataMapper';
import { useWeatherAlertsApi } from './useWeatherAlertsApi';

import type { WeatherQueryParams } from '../../../services/apiEndpoints';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.WEATHER_ALERTS, new WeatherAlertsDataMapper());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

describe('useWeatherAlertsApi', () => {
  it('fetches and maps weather alerts data successfully', async () => {
    setupWeatherAlertsSuccessMock();
    const { result } = renderHook(() => useWeatherAlertsApi(), { wrapper });
    const params: WeatherQueryParams = { lat: 23.7, lon: 121.0 };
    const fetchResult = await result.current.getWeatherAlerts('test-tile', {}, params);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    if (fetchResult.data) {
      expect(fetchResult.data).toHaveProperty('alerts');
      expect(Array.isArray(fetchResult.data.alerts)).toBe(true);
      expect(fetchResult.data.alerts.length).toBe(1);
      expect(fetchResult.data.alerts[0]!.event).toBe('Severe Weather Warning');
    }
  });
});
