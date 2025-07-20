import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';

const TimeTileContent = ({ data }: { data: TimeTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.currentTime}</div>
        <div className="text-sm text-theme-text-secondary">{data.date}</div>
      </div>
    );
  }
  return null;
};

const CITY_COORDS = {
  helsinki: { lat: 60.1699, lng: 24.9384 },
  prague: { lat: 50.0755, lng: 14.4378 },
  taipei: { lat: 25.033, lng: 121.5654 },
} as const;

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getTime } = useTimeApi();
  const apiKeys = getApiKeys();
  // Get city from tile.config.city, fallback to 'helsinki'
  const city = (tile.config && typeof tile.config.city === 'string' && CITY_COORDS[tile.config.city.toLowerCase() as keyof typeof CITY_COORDS])
    ? tile.config.city.toLowerCase() as keyof typeof CITY_COORDS
    : 'helsinki';
  const coords = CITY_COORDS[city];
  const params = useMemo(
    () => ({ lat: coords.lat, lng: coords.lng, by: 'position' as const, format: 'json' as const, ...(apiKeys.TIMEZONEDB_API_KEY && { key: apiKeys.TIMEZONEDB_API_KEY }) }),
    [coords.lat, coords.lng, apiKeys.TIMEZONEDB_API_KEY]
  );
  const { data, status, lastUpdated } = useTileData(getTime, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <TimeTileContent data={data} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
