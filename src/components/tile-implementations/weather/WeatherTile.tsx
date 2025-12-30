import { useMemo, useState, useCallback, memo } from 'react';

import { format } from 'date-fns';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { formatDateToISO } from '../../../utils/dateFormatters';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import { useTileData } from '../../tile/useTileData';

import { getWeatherCityConfig } from './config';
import { useWeatherApi } from './useWeatherApi';

import type { WeatherTileData } from './types';
import type { WeatherQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileType } from '../../../types/tile';
import type { DragboardTileData } from '../../dragboard';

const WeatherIcon = memo(({
  icon,
  description,
  size = 'md',
}: {
  icon: string;
  description: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
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

    return iconMap[iconCode] ?? '🌤️';
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
WeatherIcon.displayName = 'WeatherIcon';

const WeatherMetrics = memo(({ data }: { data: WeatherTileData }): JSX.Element => {
  const { t } = useTranslation();
  const getWindDirection = (degrees: number) => {
    const directions = [
      t('weather.N'),
      t('weather.NE'),
      t('weather.E'),
      t('weather.SE'),
      t('weather.S'),
      t('weather.SW'),
      t('weather.W'),
      t('weather.NW'),
    ];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-tertiary">{t('weather.feelsLike')}</span>
        <span className="text-primary font-medium">
          {Math.round(data.temperature.feels_like)}°C
        </span>
      </div>
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-tertiary">{t('weather.humidity')}</span>
        <span className="text-primary font-medium">{data.humidity}%</span>
      </div>
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-tertiary">{t('weather.wind')}</span>
        <span className="text-primary font-medium">
          {data.wind.speed} m/s {getWindDirection(data.wind.direction)}
        </span>
      </div>
      <div className="flex items-center justify-between p-1 bg-surface-secondary rounded">
        <span className="text-tertiary">{t('weather.pressure')}</span>
        <span className="text-primary font-medium">{data.pressure} hPa</span>
      </div>
    </div>
  );
});
WeatherMetrics.displayName = 'WeatherMetrics';

const WeatherForecast = memo(({
  daily,
  showForecast,
}: {
  daily: WeatherTileData['daily'];
  showForecast: boolean;
}) => {
  if (!showForecast || daily.length === 0) return null;

  const formatDate = (dateString: string) => {
    const dt = DateTime.fromISO(dateString);
    return dt.isValid ? format(dt.toJSDate(), 'EEE') : dateString;
  };

  return (
    <div className="border-t border-secondary pt-2">
      <div className="space-y-1">
        {daily.slice(1, 6).map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-1 border-b border-secondary last:border-b-0"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs text-tertiary w-8">{formatDate(day.date)}</span>
              <WeatherIcon
                icon={day.conditions.icon}
                description={day.conditions.description}
                size="sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-primary font-medium">
                {Math.round(day.temperature.max)}°
              </span>
              <span className="text-xs text-tertiary">
                {Math.round(day.temperature.min)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const WeatherTileContent = memo(({
  data,
  cityConfig,
  showForecast,
  onToggleForecast,
}: {
  data: WeatherTileData | null;
  cityConfig: { city: string; country: string } | null;
  showForecast: boolean;
  onToggleForecast: () => void;
}) => {
  const { t } = useTranslation();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-tertiary text-sm">{t('tiles.noDataAvailable')}</span>
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
            <div className="text-2xl font-bold text-primary">
              {Math.round(data.temperature.current)}°C
            </div>
            <div className="text-xs text-secondary capitalize">
              {data.conditions.description}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-primary">
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
        <span className="text-xs text-tertiary">{t('weather.forecast')}</span>
        <button
          onClick={onToggleForecast}
          className="text-xs text-tertiary hover:text-secondary"
        >
          {showForecast ? t('general.hide') : t('general.show')}
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
  const cityConfig = getWeatherCityConfig(tile.type as TileType);

  const pathParams = useMemo<PathParams>(() => ({}), []);
  const queryParams = useMemo<WeatherQueryParams>(
    () => ({
      lat: cityConfig.lat,
      lon: cityConfig.lon,
      units: 'metric',
    }),
    [cityConfig],
  );

  const { data, status, lastUpdated, lastSuccessfulDataUpdate, manualRefresh, isLoading } = useTileData(
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
      lastSuccessfulDataUpdate={lastSuccessfulDataUpdate}
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
WeatherTileContent.displayName = 'WeatherTileContent';

WeatherTile.displayName = 'WeatherTile';
