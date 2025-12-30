import React, { useMemo } from 'react';

import { REFRESH_INTERVALS } from '../../../contexts/constants';
import { formatDateToISO } from '../../../utils/dateFormatters';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';

import { useEuriborApi } from './useEuriborApi';

import type { EuriborRateTileData } from './types';
import type { DragboardTileData } from '../../dragboard';

const EuriborRateTileContent = ({
  data,
}: {
  data: EuriborRateTileData | null;
}): React.ReactNode => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-primary">{data.currentRate}%</div>
        <div className="text-sm text-secondary">Euribor Rate</div>
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
}): React.ReactNode => {
  const { getEuriborRate } = useEuriborApi();
  const pathParams = useMemo(() => ({}), []);
  const queryParams = useMemo(() => ({ format: 'json' as const }), []);
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.EURIBOR_RATE,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, lastSuccessfulDataUpdate, manualRefresh, isLoading } =
    useTileData(getEuriborRate, tile.id, pathParams, queryParams, refreshConfig);
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
      <EuriborRateTileContent data={data} />
    </GenericTile>
  );
};

EuriborRateTile.displayName = 'EuriborRateTile';
