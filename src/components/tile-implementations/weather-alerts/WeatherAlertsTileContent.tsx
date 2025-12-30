import React from 'react';

import { useTranslation } from 'react-i18next';

import { fromUnixTimestamp, toLocaleString } from '../../../utils/luxonUtils';

import type { WeatherAlertsTileData } from './types';

export const WeatherAlertsTileContent = ({
  alerts,
}: {
  alerts: WeatherAlertsTileData['alerts'];
}): React.ReactNode => {
  const { t } = useTranslation();

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <span className="text-4xl" role="img" aria-label="typhoon">
          🌪️
        </span>
        <span className="text-tertiary text-sm">{t('weatherAlerts.noActiveAlerts')}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-2 w-full">
      {alerts.map((alert, idx) => (
        <div key={idx} className="border rounded p-2 bg-surface-secondary border-primary">
          <div className="font-bold text-primary">{alert.event}</div>
          <div className="text-xs text-secondary">{alert.sender_name}</div>
          <div className="text-xs text-secondary">
            {toLocaleString(fromUnixTimestamp(alert.start))} -{' '}
            {toLocaleString(fromUnixTimestamp(alert.end))}
          </div>
          <div className="text-sm mt-1">{alert.description}</div>
          {alert.tags && alert.tags.length > 0 && (
            <div className="text-xs mt-1 text-tertiary">Tags: {alert.tags.join(', ')}</div>
          )}
        </div>
      ))}
    </div>
  );
};

WeatherAlertsTileContent.displayName = 'WeatherAlertsTileContent';
