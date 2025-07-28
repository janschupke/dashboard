import { BusinessStatus } from './constants';

import type { TimeTileData } from './types';

export interface TimeTileContentProps {
  data: TimeTileData | null;
  city: string;
}

export const TimeTileContent = ({ data, city }: TimeTileContentProps) => {
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
            data.businessStatus === BusinessStatus.OPEN
              ? 'text-xs font-semibold text-status-success'
              : data.businessStatus === BusinessStatus.CLOSED
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

TimeTileContent.displayName = 'TimeTileContent';
