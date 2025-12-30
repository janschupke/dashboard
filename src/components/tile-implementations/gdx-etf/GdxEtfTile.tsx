import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { REFRESH_INTERVALS } from '../../../contexts/constants';
import { formatDateToISO } from '../../../utils/dateFormatters';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';
import { DataRow } from '../../ui/DataRow';

import { useGdxEtfApi } from './useGdxEtfApi';

import type { GdxEtfTileData } from './types';
import type { AlphaVantageQueryParams } from '../../../services/apiEndpoints';
import type { DragboardTileData } from '../../dragboard';

const GdxEtfTileContent = ({ data }: { data: GdxEtfTileData | null }) => {
  const { t } = useTranslation();

  // Check if data is null or contains only default/empty values
  const hasValidData = data && data.currentPrice > 0 && data.symbol && data.symbol.length > 0;

  if (!hasValidData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-sm text-theme-tertiary">{t('tiles.noDataAvailable')}</div>
      </div>
    );
  }

  // Ensure all required values are numbers
  const currentPrice = data.currentPrice || 0;
  const priceChange = data.priceChange || 0;
  const priceChangePercent = data.priceChangePercent || 0;
  const symbol = data.symbol || 'GDX';
  const name = data.name || t('tiles.gdxEtfName');

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          <DataRow
            index={1}
            name={name}
            code={symbol}
            price={currentPrice}
            priceChange={priceChange}
            priceChangePercent={priceChangePercent}
            showBorder={false}
          />
        </div>
      </div>
    </div>
  );
};

export const GdxEtfTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const { getGdxEtf } = useGdxEtfApi();

  const params = useMemo<AlphaVantageQueryParams>(
    () => ({
      function: 'GLOBAL_QUOTE',
      symbol: 'GDX',
    }),
    [],
  );

  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.GDX_ETF,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, lastSuccessfulDataUpdate, manualRefresh, isLoading } = useTileData(
    getGdxEtf,
    tile.id,
    {},
    params,
    refreshConfig,
  );

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={formatDateToISO(lastUpdated)}
      lastSuccessfulDataUpdate={lastSuccessfulDataUpdate}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <GdxEtfTileContent data={data} />
    </GenericTile>
  );
};

GdxEtfTile.displayName = 'GdxEtfTile';
