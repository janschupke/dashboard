import React, { useMemo } from 'react';

import { formatDateToISO } from '../../../utils/dateFormatters';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';

import { useWeatherAlertsApi } from './useWeatherAlertsApi';
import { WeatherAlertsTileContent } from './WeatherAlertsTileContent';

import type { DragboardTileData } from '../../dragboard';

export const WeatherAlertsTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}): React.ReactNode => {
  const { getWeatherAlerts } = useWeatherAlertsApi();
  const params = useMemo(
    () => ({
      lat: 23.7,
      lon: 121.0,
      units: 'metric' as const,
    }),
    [],
  );
  const { data, status, lastUpdated, lastSuccessfulDataUpdate, manualRefresh, isLoading } =
    useTileData(getWeatherAlerts, tile.id, {}, params);

  const lastUpdateStr = formatDateToISO(lastUpdated);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      {...(lastUpdateStr !== undefined && { lastUpdate: lastUpdateStr })}
      {...(lastSuccessfulDataUpdate !== undefined && { lastSuccessfulDataUpdate })}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <WeatherAlertsTileContent alerts={data?.alerts ?? []} />
    </GenericTile>
  );
};

WeatherAlertsTile.displayName = 'WeatherAlertsTile';
