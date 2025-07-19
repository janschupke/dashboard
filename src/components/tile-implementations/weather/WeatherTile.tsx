import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useWeatherApi } from './useWeatherApi';
import type { WeatherTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import type { WeatherParams } from '../../../services/apiEndpoints';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';

const WeatherTileContent = ({ data }: { data: WeatherTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          {data.temperature.current}°C
        </div>
        <div className="text-sm text-theme-text-secondary">{data.conditions.description}</div>
      </div>
    );
  }
  return null;
};

export const WeatherTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getWeather } = useWeatherApi();
  const apiKeys = getApiKeys();

  const params = useMemo<WeatherParams>(
    () => ({
      lat: 60.1699,
      lon: 24.9384,
      ...(apiKeys.openWeatherMap && { appid: apiKeys.openWeatherMap }),
      units: 'metric',
    }),
    [apiKeys.openWeatherMap],
  );

  const { data, status, lastUpdated } = useTileData(getWeather, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <WeatherTileContent data={data} />
    </GenericTile>
  );
};

WeatherTile.displayName = 'WeatherTile';
