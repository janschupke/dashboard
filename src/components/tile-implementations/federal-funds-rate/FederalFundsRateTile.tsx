import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';
import type { FederalFundsRateTileData, TimeRange } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo, useState, useCallback, memo } from 'react';
import type { FredParams } from '../../../services/apiEndpoints';
import { getApiKeys } from '../../../services/apiConfig';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const FederalFundsRateChart = memo(function FederalFundsRateChart({
  data,
  timeRange,
  onTimeRangeChange,
}: {
  data: FederalFundsRateTileData | null;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  const chartData = useMemo(() => {
    if (!data?.historicalData) return [];

    // Filter data based on time range
    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case '1M':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5Y':
        filterDate.setFullYear(now.getFullYear() - 5);
        break;
      case 'Max':
      default:
        return data.historicalData.map((entry) => ({
          date: format(entry.date, 'MMM dd'),
          rate: entry.rate,
        }));
    }

    return data.historicalData
      .filter((entry) => entry.date >= filterDate)
      .map((entry) => ({
        date: format(entry.date, 'MMM dd'),
        rate: entry.rate,
      }));
  }, [data?.historicalData, timeRange]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-primary border border-border-primary rounded-lg p-2 shadow-lg">
          <p className="text-theme-primary font-medium">{`Date: ${label}`}</p>
          <p className="text-theme-secondary">{`Rate: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Time Range Controls */}
      <div className="flex items-center justify-between p-2 border-b border-border-secondary">
        <span className="text-xs text-theme-tertiary">Time Range</span>
        <div className="flex space-x-1">
          {(['1M', '3M', '6M', '1Y', '5Y', 'Max'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-2 py-1 text-xs rounded ${
                timeRange === range
                  ? 'bg-interactive-primary text-theme-inverse'
                  : 'bg-surface-secondary text-theme-secondary hover:bg-interactive-hover'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                stroke="var(--border-secondary)"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                stroke="var(--border-secondary)"
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-primary-500)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary-500)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'var(--color-primary-500)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-theme-tertiary text-sm">No data available</span>
          </div>
        )}
      </div>
    </div>
  );
});

const FederalFundsRateTileContent = memo(function FederalFundsRateTileContent({
  data,
  timeRange,
  onTimeRangeChange,
}: {
  data: FederalFundsRateTileData | null;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
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
        <FederalFundsRateChart
          data={data}
          timeRange={timeRange}
          onTimeRangeChange={onTimeRangeChange}
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
  const isForceRefresh = useForceRefreshFromKey();
  const { getFederalFundsRate } = useFederalFundsApi();
  const apiKeys = getApiKeys();

  const params = useMemo<FredParams>(
    () => ({
      series_id: 'FEDFUNDS',
      file_type: 'json',
      ...(apiKeys.fred && { api_key: apiKeys.fred }),
    }),
    [apiKeys.fred],
  );

  const { data, status, lastUpdated } = useTileData(
    getFederalFundsRate,
    tile.id,
    params,
    isForceRefresh,
  );

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  let lastUpdate: string | undefined = undefined;
  if (data?.lastUpdate) {
    lastUpdate =
      typeof data.lastUpdate === 'string' ? data.lastUpdate : data.lastUpdate.toISOString();
  } else if (lastUpdated) {
    lastUpdate = lastUpdated.toISOString();
  }

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdate}
      data={data}
      {...rest}
    >
      <FederalFundsRateTileContent
        data={data}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </GenericTile>
  );
};

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
