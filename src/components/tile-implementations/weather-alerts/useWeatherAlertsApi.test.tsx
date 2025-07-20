import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWeatherAlertsApi } from './useWeatherAlertsApi';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import type { WeatherParams } from '../../../services/apiEndpoints';

const mockApiResponse = {
  alerts: [
    {
      sender_name: 'CWA',
      event: 'Severe Weather Warning',
      start: 1721000000,
      end: 1721100000,
      description: 'A severe weather event is expected in Taiwan.',
      tags: ['weather', 'warning'],
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(globalThis.fetch as any) = globalThis.vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider>{children}</MockDataServicesProvider>
);

describe('useWeatherAlertsApi', () => {
  it('fetches and maps weather alerts data successfully', async () => {
    (globalThis.fetch as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
      status: 200,
    });
    const { result } = renderHook(() => useWeatherAlertsApi(), { wrapper });
    const params: WeatherParams = { lat: 23.7, lon: 121.0 };
    const fetchResult = await result.current.getWeatherAlerts('test-tile', params);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    if (fetchResult.data) {
      expect(fetchResult.data).toHaveProperty('alerts');
      expect(Array.isArray(fetchResult.data.alerts)).toBe(true);
      expect(fetchResult.data.alerts.length).toBe(1);
      expect(fetchResult.data.alerts[0].event).toBe('Severe Weather Warning');
    }
  });
}); 
