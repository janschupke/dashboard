import type { WeatherAlertsTileData } from './types';

export const WeatherAlertsTileContent = ({
  alerts,
}: {
  alerts: WeatherAlertsTileData['alerts'];
}) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <span className="text-4xl" role="img" aria-label="typhoon">
          🌪️
        </span>
        <span className="text-theme-tertiary text-sm">No active weather alerts.</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-2 w-full">
      {alerts.map((alert, idx) => (
        <div key={idx} className="border rounded p-2 bg-theme-surface-secondary">
          <div className="font-bold text-theme-text-primary">{alert.event}</div>
          <div className="text-xs text-theme-text-secondary">{alert.sender_name}</div>
          <div className="text-xs text-theme-text-secondary">
            {new Date(alert.start * 1000).toLocaleString()} -{' '}
            {new Date(alert.end * 1000).toLocaleString()}
          </div>
          <div className="text-sm mt-1">{alert.description}</div>
          {alert.tags && alert.tags.length > 0 && (
            <div className="text-xs mt-1 text-theme-text-tertiary">
              Tags: {alert.tags.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

WeatherAlertsTileContent.displayName = 'WeatherAlertsTileContent';
