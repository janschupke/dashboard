import { useMemo } from 'react';
import { DateTime } from 'luxon';

import { TileType } from '../../../types/tile';
import { formatDateToISO } from '../../../utils/dateFormatters';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';
import { useTilePeriodicUpdate } from '../../tile/useTilePeriodicUpdate';

import { CITY_CONFIG } from './config';
import { TimeTileContent } from './TimeTileContent';
import { useTimeApi } from './useTimeApi';

import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import type { TimeTileData } from './types';

// Helper functions to calculate business hours (extracted from dataMapper logic)
const isBusinessHours = (dt: DateTime): boolean => {
  const hour = dt.hour;
  return hour >= 9 && hour < 17; // 9 AM to 5 PM
};

const getBusinessStatus = (dt: DateTime): 'open' | 'closed' | 'opening soon' | 'closing soon' => {
  const hour = dt.hour;
  const minute = dt.minute;
  if (hour >= 9 && hour < 17) {
    if (hour === 16 && minute >= 45) {
      return 'closing soon';
    }
    return 'open';
  } else if (hour === 8 && minute >= 45) {
    return 'opening soon';
  } else {
    return 'closed';
  }
};

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { getTime } = useTimeApi();
  const cityConfig =
    CITY_CONFIG[tile.type as keyof typeof CITY_CONFIG] || CITY_CONFIG[TileType.TIME_TAIPEI];

  // Periodic UI update every second (does NOT fetch data)
  const updateCount = useTilePeriodicUpdate({
    interval: 1000, // 1 second
    enabled: true,
  });

  const params = useMemo(
    () => ({
      lat: cityConfig.lat,
      lng: cityConfig.lng,
      by: 'position' as const,
      format: 'json' as const,
    }),
    [cityConfig.lat, cityConfig.lng],
  );

  // API refresh every 5 minutes (for timezone/offset updates)
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getTime,
    tile.id,
    {},
    params,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      enableAutoRefresh: true,
    },
  );

  // Recalculate time display on each update (using updateCount as dependency)
  const currentTimeData = useMemo((): TimeTileData | null => {
    if (!data) return null;

    // Calculate current time in tile's timezone using current moment
    const now = DateTime.now().setZone(data.timezone);

    return {
      ...data,
      currentTime: now.toFormat('HH:mm:ss'),
      date: now.toISODate() ?? '',
      isBusinessHours: isBusinessHours(now),
      businessStatus: getBusinessStatus(now),
      lastUpdate: DateTime.now().toISO(),
    };
  }, [data, updateCount]); // updateCount triggers recalculation every second

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={formatDateToISO(lastUpdated)}
      data={currentTimeData}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <TimeTileContent data={currentTimeData} city={cityConfig.city} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
