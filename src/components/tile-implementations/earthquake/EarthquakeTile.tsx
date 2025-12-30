import { useMemo, useState, useCallback, memo } from 'react';

import { DateTime } from 'luxon';

import { formatDateToISO } from '../../../utils/dateFormatters';
import {
  fromUnixTimestampMs,
  diffInHours,
  toLocaleDateString,
  now,
} from '../../../utils/luxonUtils';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';

import { useEarthquakeApi } from './useEarthquakeApi';

import type { EarthquakeTileDataArray } from './useEarthquakeApi';
import type { UsgsEarthquakeQueryParams } from '../../../services/apiEndpoints';
import type { DragboardTileData } from '../../dragboard';

const EarthquakeTileContent = memo(function EarthquakeTileContent({
  data,
  magnitudeThreshold,
  onThresholdChange,
}: {
  data: EarthquakeTileDataArray | null;
  magnitudeThreshold: number;
  onThresholdChange: (value: number) => void;
}) {
  // Handle the case where data might be an array directly or have items property
  const earthquakes = data?.items ?? (Array.isArray(data) ? data : []);

  // Filter earthquakes by magnitude threshold and sort by time (most recent first)
  const filteredEarthquakes = earthquakes
    .filter((quake) => quake.magnitude >= magnitudeThreshold)
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  const formatTime = (timestamp: number) => {
    const date = fromUnixTimestampMs(timestamp);
    const currentTime = now();
    const hours = diffInHours(date, currentTime);

    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.round(hours)}h ago`;
    } else {
      return toLocaleDateString(date);
    }
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 6.0) return 'text-status-error';
    if (magnitude >= 5.0) return 'text-status-warning';
    if (magnitude >= 4.0) return 'text-status-info';
    return 'text-theme-tertiary';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Magnitude Threshold Slider */}
      <div className="p-2 border-b border-theme-secondary">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-theme-tertiary">Magnitude ≥</span>
          <span className="text-xs font-medium text-theme-primary">{magnitudeThreshold}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={magnitudeThreshold}
          onChange={(e) => {
            onThresholdChange(parseFloat(e.target.value));
          }}
          className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Earthquake List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredEarthquakes.length > 0 ? (
          <div className="space-y-1">
            {filteredEarthquakes.map((quake, index) => (
              <div
                key={`${quake.id}-${index}`}
                className="flex items-center justify-between py-1 border-b border-theme-secondary last:border-b-0"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-xs text-theme-tertiary w-4 text-right">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-theme-primary">
                      {quake.place}
                    </div>
                    <div className="text-xs text-theme-tertiary">{formatTime(quake.time)}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className={`text-xs font-medium ${getMagnitudeColor(quake.magnitude)}`}>
                    M{quake.magnitude.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-theme-tertiary text-center">
              {earthquakes.length > 0
                ? `No earthquakes ≥ M${magnitudeThreshold}`
                : 'Loading earthquakes...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const EarthquakeTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const [magnitudeThreshold, setMagnitudeThreshold] = useState(4.0);
  const { getEarthquakes } = useEarthquakeApi();

  const params = useMemo<UsgsEarthquakeQueryParams>(() => {
    // Calculate start/end time for the last 7 days using Luxon
    const end = DateTime.now();
    const start = end.minus({ days: 7 });
    const starttime = start.toISODate() || '';
    const endtime = end.toISODate() || '';

    return {
      format: 'geojson',
      starttime,
      endtime,
    };
  }, []);

  const { data, status, lastUpdated, lastSuccessfulDataUpdate, manualRefresh, isLoading } = useTileData(
    getEarthquakes,
    tile.id,
    {},
    params,
  );

  const handleThresholdChange = useCallback((value: number) => {
    setMagnitudeThreshold(value);
  }, []);

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
      <EarthquakeTileContent
        data={data}
        magnitudeThreshold={magnitudeThreshold}
        onThresholdChange={handleThresholdChange}
      />
    </GenericTile>
  );
};

EarthquakeTile.displayName = 'EarthquakeTile';
