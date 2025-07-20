import { useMemo, memo } from 'react';
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

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Max';

export interface ChartDataPoint {
  date: string | Date;
  value: number;
  label?: string;
}

export interface MarketChartProps {
  data: ChartDataPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  title?: string;
  valueLabel?: string;
  valueFormatter?: (value: number) => string;
  height?: string;
  showTimeRangeControls?: boolean;
  className?: string;
}

export const MarketChart = memo<MarketChartProps>(
  ({
    data,
    timeRange,
    onTimeRangeChange,
    title,
    valueLabel = 'Value',
    valueFormatter = (value) => `${value}`,
    height = '180px',
    showTimeRangeControls = true,
    className = '',
  }) => {
    const chartData = useMemo(() => {
      if (!data || data.length === 0) return [];

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
          return data.map((entry) => ({
            date: entry.label || format(new Date(entry.date), 'MMM dd'),
            value: entry.value,
          }));
      }

      return data
        .filter((entry) => new Date(entry.date) >= filterDate)
        .map((entry) => ({
          date: entry.label || format(new Date(entry.date), 'MMM dd'),
          value: entry.value,
        }));
    }, [data, timeRange]);

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
            <p className="text-theme-secondary">{`${valueLabel}: ${valueFormatter(payload[0].value)}`}</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Time Range Controls */}
        {showTimeRangeControls && (
          <div className="flex items-center justify-between p-2 border-b border-border-secondary">
            <span className="text-xs text-theme-tertiary">{title || 'Time Range'}</span>
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
        )}

        {/* Chart */}
        <div className="flex-1 p-2">
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height }}>
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
                    dataKey="value"
                    stroke="var(--color-primary-500)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-primary-500)', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: 'var(--color-primary-500)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-theme-tertiary text-sm">No data available</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

MarketChart.displayName = 'MarketChart';
