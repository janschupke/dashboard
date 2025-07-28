import { useMemo } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTileData } from '../../tile/useTileData';
import { useWeatherAlertsApi } from './useWeatherAlertsApi';
import { WeatherAlertsTileContent } from './WeatherAlertsTileContent';

export const WeatherAlertsTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const { getWeatherAlerts } = useWeatherAlertsApi();
  const params = useMemo(
    () => ({
      lat: 23.7,
      lon: 121.0,
      units: 'metric' as const,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getWeatherAlerts,
    tile.id,
    {},
    params,
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
