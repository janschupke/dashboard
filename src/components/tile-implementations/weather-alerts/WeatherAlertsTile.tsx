import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useWeatherAlertsApi } from './useWeatherAlertsApi';
import type { WeatherAlertsTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';

const WeatherAlertsTileContent = ({ alerts }: { alerts: WeatherAlertsTileData['alerts'] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <span className="text-4xl" role="img" aria-label="typhoon">
          🌪️
        </span>
        <span className="text-theme-tertiary text-sm">No active weather alerts.</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-2 w-full">
      {alerts.map((alert, idx) => (
        <div key={idx} className="border rounded p-2 bg-theme-surface-secondary">
          <div className="font-bold text-theme-text-primary">{alert.event}</div>
          <div className="text-xs text-theme-text-secondary">{alert.sender_name}</div>
          <div className="text-xs text-theme-text-secondary">
            {new Date(alert.start * 1000).toLocaleString()} -{' '}
            {new Date(alert.end * 1000).toLocaleString()}
          </div>
          <div className="text-sm mt-1">{alert.description}</div>
          {alert.tags && alert.tags.length > 0 && (
            <div className="text-xs mt-1 text-theme-text-tertiary">
              Tags: {alert.tags.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const WeatherAlertsTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getWeatherAlerts } = useWeatherAlertsApi();
  const apiKeys = getApiKeys();
  const params = useMemo(
    () => ({
      lat: 23.7,
      lon: 121.0,
      ...(apiKeys.openWeatherMap && { appid: apiKeys.openWeatherMap }),
      units: 'metric' as const,
    }),
    [apiKeys.openWeatherMap],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getWeatherAlerts,
    tile.id,
    params,
    isForceRefresh,
  );

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <WeatherAlertsTileContent alerts={data?.alerts || []} />
    </GenericTile>
  );
};

WeatherAlertsTile.displayName = 'WeatherAlertsTile';
