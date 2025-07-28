import { useMemo } from 'react';

import { REFRESH_INTERVALS } from '../../../contexts/constants';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';

import { useEuriborApi } from './useEuriborApi';

import type { EuriborRateTileData } from './types';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';

const EuriborRateTileContent = ({ data }: { data: EuriborRateTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.currentRate}%</div>
        <div className="text-sm text-theme-text-secondary">Euribor Rate</div>
      </div>
    );
  }
  return null;
};

export const EuriborRateTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const { getEuriborRate } = useEuriborApi();
  const pathParams = useMemo(() => ({}), []);
  const queryParams = useMemo(() => ({}), []);
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.EURIBOR_RATE,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getEuriborRate,
    tile.id,
    pathParams,
    queryParams,
    refreshConfig,
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
      <EuriborRateTileContent data={data} />
    </GenericTile>
  );
};

EuriborRateTile.displayName = 'EuriborRateTile';
