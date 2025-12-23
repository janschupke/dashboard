import { useMemo, useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { format } from 'date-fns';
import { DateTime } from 'luxon';

import { formatDateToISO } from '../../../utils/dateFormatters';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';

import { getWeatherCityConfig } from './config';
import { useWeatherApi } from './useWeatherApi';

import type { WeatherTileData } from './types';
import type { WeatherQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';

const WeatherIcon = memo(function WeatherIcon({
  icon,
  description,
  size = 'md',
}: {
  icon: string;
  description: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-3xl',
  };

  // Map OpenWeatherMap icon codes to emoji
  const getWeatherEmoji = (iconCode: string): string => {
    const iconMap: Record<string, string> = {
      // Clear sky
      '01d': '☀️',
      '01n': '🌙',
      // Few clouds
      '02d': '⛅',
      '02n': '☁️',
      // Scattered clouds
      '03d': '☁️',
      '03n': '☁️',
      // Broken clouds
      '04d': '☁️',
      '04n': '☁️',
      // Shower rain
      '09d': '🌦️',
      '09n': '🌧️',
      // Rain
      '10d': '🌦️',
      '10n': '🌧️',
      // Thunderstorm
      '11d': '⛈️',
      '11n': '⛈️',
      // Snow
      '13d': '🌨️',
      '13n': '🌨️',
      // Mist
      '50d': '🌫️',
      '50n': '🌫️',
    };

    return iconMap[iconCode] || '🌤️';
  };

  return (
    <span
      className={`${sizeClasses[size]} flex items-center justify-center text-center`}
      role="img"
      aria-label={description}
    >
      {getWeatherEmoji(icon)}
    </span>
  );
});

const WeatherMetrics = memo(function WeatherMetrics({ data }: { data: WeatherTileData }) {
  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-theme-tertiary">Feels like</span>
        <span className="text-theme-primary font-medium">
          {Math.round(data.temperature.feels_like)}°C
        </span>
      </div>
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-theme-tertiary">Humidity</span>
        <span className="text-theme-primary font-medium">{data.humidity}%</span>
      </div>
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-theme-tertiary">Wind</span>
        <span className="text-theme-primary font-medium">
          {data.wind.speed} m/s {getWindDirection(data.wind.direction)}
        </span>
      </div>
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-theme-tertiary">Pressure</span>
        <span className="text-theme-primary font-medium">{data.pressure} hPa</span>
      </div>
    </div>
  );
});

const WeatherForecast = memo(function WeatherForecast({
  daily,
  showForecast,
}: {
  daily: WeatherTileData['daily'];
  showForecast: boolean;
}) {
  if (!showForecast || daily.length === 0) return null;

  const formatDate = (dateString: string) => {
    const dt = DateTime.fromISO(dateString);
    return dt.isValid ? format(dt.toJSDate(), 'EEE') : dateString;
  };

  return (
    <div className="border-t border-theme-secondary pt-2">
      <div className="space-y-1">
        {daily.slice(1, 6).map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-1 border-b border-theme-secondary last:border-b-0"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs text-theme-tertiary w-8">{formatDate(day.date)}</span>
              <WeatherIcon
                icon={day.conditions.icon}
                description={day.conditions.description}
                size="sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-theme-primary font-medium">
                {Math.round(day.temperature.max)}°
              </span>
              <span className="text-xs text-theme-tertiary">
                {Math.round(day.temperature.min)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const WeatherTileContent = memo(function WeatherTileContent({
  data,
  cityConfig,
  showForecast,
  onToggleForecast,
}: {
  data: WeatherTileData | null;
  cityConfig: { city: string; country: string } | null;
  showForecast: boolean;
  onToggleForecast: () => void;
}) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-theme-tertiary text-sm">{t('tiles.noDataAvailable')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-2">
      {/* Current Weather Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <WeatherIcon
            icon={data.conditions.icon}
            description={data.conditions.description}
            size="xl"
          />
          <div>
            <div className="text-2xl font-bold text-theme-primary">
              {Math.round(data.temperature.current)}°C
            </div>
            <div className="text-xs text-theme-secondary capitalize">
              {data.conditions.description}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-theme-primary">
            {cityConfig ? `${cityConfig.city}, ${cityConfig.country}` : t('tiles.unknownLocation')}
          </div>
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="mb-3">
        <WeatherMetrics data={data} />
      </div>

      {/* Forecast Toggle */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-theme-tertiary">Forecast</span>
        <button
          onClick={onToggleForecast}
          className="text-xs text-theme-tertiary hover:text-theme-secondary"
        >
          {showForecast ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Forecast Section */}
      <div className="flex-1 overflow-y-auto">
        <WeatherForecast daily={data.daily} showForecast={showForecast} />
      </div>
    </div>
  );
});

export const WeatherTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const [showForecast, setShowForecast] = useState(false);
  const { getWeather } = useWeatherApi();

  // Get city configuration based on tile type
  const cityConfig = getWeatherCityConfig(tile.type);

  const pathParams = useMemo<PathParams>(() => ({}), []);
  const queryParams = useMemo<WeatherQueryParams>(
    () => ({
      lat: cityConfig.lat,
      lon: cityConfig.lon,
      units: 'metric',
    }),
    [cityConfig],
  );

  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getWeather,
    tile.id,
    pathParams,
    queryParams,
  );

  const handleToggleForecast = useCallback(() => {
    setShowForecast((prev) => !prev);
  }, []);

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={formatDateToISO(lastUpdated)}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <WeatherTileContent
        data={data}
        cityConfig={cityConfig}
        showForecast={showForecast}
        onToggleForecast={handleToggleForecast}
      />
    </GenericTile>
  );
};

WeatherTile.displayName = 'WeatherTile';
