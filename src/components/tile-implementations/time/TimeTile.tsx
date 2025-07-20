import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';
import { TileType } from '../../../types/tile';

const CITY_CONFIG = {
  [TileType.TIME_HELSINKI]: { city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
  [TileType.TIME_PRAGUE]: { city: 'Prague', lat: 50.0755, lng: 14.4378 },
  [TileType.TIME_TAIPEI]: { city: 'Taipei', lat: 25.033, lng: 121.5654 },
} as const;

const TimeTileContent = ({ data, city }: { data: TimeTileData | null; city: string }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-theme-tertiary text-sm">No time data available</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full p-2">
      {/* Header: City and Time */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-theme-primary">{data.currentTime}</div>
          <div className="text-xs text-theme-secondary capitalize">{city}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-theme-primary">{data.date}</div>
          <div className="text-xs text-theme-tertiary">{data.timezone}</div>
        </div>
      </div>
      {/* Timezone Details */}
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center text-xs text-theme-secondary">
          <span className="mr-2">Abbreviation:</span>
          <span className="font-mono text-theme-primary">{data.abbreviation}</span>
        </div>
        <div className="flex items-center text-xs text-theme-secondary">
          <span className="mr-2">UTC Offset:</span>
          <span className="font-mono text-theme-primary">{data.offset}</span>
        </div>
      </div>
      {/* Business Status */}
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-theme-tertiary">
        <span className="text-xs text-theme-tertiary">Business Hours</span>
        <span
          className={
            data.businessStatus === 'open'
              ? 'text-xs font-semibold text-status-success'
              : data.businessStatus === 'closed'
              ? 'text-xs font-semibold text-status-error'
              : 'text-xs font-semibold text-status-warning'
          }
        >
          {data.businessStatus.charAt(0).toUpperCase() + data.businessStatus.slice(1)}
        </span>
      </div>
    </div>
  );
};

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getTime } = useTimeApi();
  const apiKeys = getApiKeys();
  const cityConfig = CITY_CONFIG[tile.type as keyof typeof CITY_CONFIG] || CITY_CONFIG[TileType.TIME_TAIPEI];
  const params = useMemo(
    () => ({
      lat: cityConfig.lat,
      lng: cityConfig.lng,
      by: 'position' as const,
      format: 'json' as const,
      ...(apiKeys.TIMEZONEDB_API_KEY && { key: apiKeys.TIMEZONEDB_API_KEY }),
    }),
    [cityConfig.lat, cityConfig.lng, apiKeys.TIMEZONEDB_API_KEY],
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
      <TimeTileContent data={data} city={cityConfig.city} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
