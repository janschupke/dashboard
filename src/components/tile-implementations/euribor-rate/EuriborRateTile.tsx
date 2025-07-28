import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useEuriborApi } from './useEuriborApi';
import type { EuriborRateTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

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
  const isForceRefresh = useForceRefreshFromKey();
  const { getEuriborRate } = useEuriborApi();
  const params = useMemo(() => ({}), []);
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: 60 * 60 * 1000, // 1 hour
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getEuriborRate,
    tile.id,
    params,
    isForceRefresh,
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
