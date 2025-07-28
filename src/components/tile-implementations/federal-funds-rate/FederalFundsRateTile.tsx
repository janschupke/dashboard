import { useMemo, useState, memo } from 'react';

import { format } from 'date-fns';

import { REFRESH_INTERVALS } from '../../../contexts/constants';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';
import { MarketChart, type ChartDataPoint } from '../../ui/MarketChart';

import { useFederalFundsApi } from './useFederalFundsApi';

import type { FederalFundsRateTileData, TimeRange } from './types';
import type { FredQueryParams } from '../../../services/apiEndpoints';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';

const FederalFundsRateTileContent = memo(function FederalFundsRateTileContent({
  data,
  timeRange,
  onTimeRangeChange,
}: {
  data: FederalFundsRateTileData | null;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data?.historicalData) return [];

    return data.historicalData.map((entry) => ({
      date: entry.date,
      value: entry.rate,
    }));
  }, [data?.historicalData]);

  // TODO: fix the null data globally
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Current Rate Display */}
      <div className="flex flex-col items-center justify-center p-4 border-b border-border-secondary">
        <div className="text-3xl font-bold text-theme-primary">{data.currentRate}%</div>
        {data.lastUpdate && (
          <div className="text-xs text-theme-tertiary mt-1">
            Updated: {format(data.lastUpdate, 'MMM dd, yyyy')}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="flex-1">
        <MarketChart
          data={chartData}
          timeRange={timeRange}
          onTimeRangeChange={onTimeRangeChange}
          title="Time Range"
          valueLabel="Rate"
          valueFormatter={(value) => `${value}%`}
        />
      </div>
    </div>
  );
});

export const FederalFundsRateTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const { getFederalFundsRate } = useFederalFundsApi();

  const params = useMemo<FredQueryParams>(
    () => ({
      series_id: 'FEDFUNDS',
      file_type: 'json',
    }),
    [],
  );

  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.FEDERAL_FUNDS_RATE,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getFederalFundsRate,
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
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <FederalFundsRateTileContent
        data={data}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </GenericTile>
  );
};

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
