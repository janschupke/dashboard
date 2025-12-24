import React, { useCallback, forwardRef, useMemo, useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { ERROR_MESSAGES } from '../../constants/errorMessages';
import { formatRelativeTime, now, fromISO } from '../../utils/luxonUtils';
import { minutesToMs } from '../../utils/timeUtils';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

import { LoadingComponent } from './LoadingComponent';
import { TileErrorBoundary } from './TileErrorBoundary';
import { TileStatus } from './useTileData';

import type { TileDataType } from '../../services/storageManager';
import type { TileCategory } from '../../types/tileCategories';
import type { DragboardTileData } from '../dragboard';

export interface TileMeta {
  title: string;
  icon: string;
  category?: TileCategory;
}

export interface GenericTileProps {
  tile: DragboardTileData;
  meta: TileMeta;
  children?: React.ReactNode;
  status?: TileStatus;
  lastUpdate?: string;
  data: TileDataType | null;
  onManualRefresh?: () => void;
  isLoading?: boolean;
  onRemove?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  className?: string;
}

const StatusBar = ({
  data,
  status,
  lastUpdate,
  onManualRefresh,
  isLoading,
}: {
  data: TileDataType | null;
  status?: TileStatus;
  lastUpdate?: string;
  onManualRefresh?: () => void;
  isLoading?: boolean;
}) => {
  const [currentTime, setCurrentTime] = useState(now());

  // Update current time every minute to keep elapsed time accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(now());
    }, minutesToMs(1)); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Determine status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case TileStatus.Stale:
        return { name: 'warning', className: 'text-theme-status-warning' };
      case TileStatus.Success:
        return { name: 'success', className: 'text-theme-status-success' };
      case TileStatus.Error:
        return { name: 'close', className: 'text-theme-status-error' };
      default:
        return null;
    }
  };

  const { t } = useTranslation();

  // Format last update time using Luxon and i18n
  const formatLastUpdate = (isLoading?: boolean, timestamp?: string) => {
    if (isLoading) return t('tile.pending');
    if (!timestamp) return t('tile.never');
    try {
      const date = fromISO(timestamp);
      if (!date.isValid) return t('tile.invalidDate');
      return formatRelativeTime(date, currentTime);
    } catch {
      return t('tile.invalidDate');
    }
  };

  const logTileState = () => {
    console.log('Tile state:', { data, status, lastUpdate });
  };

  const statusIcon = getStatusIcon();

  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs border-t border-theme-primary bg-surface-secondary text-secondary rounded-b-xl">
      <div className="flex items-center space-x-2">
        {onManualRefresh && (
          <button
            onClick={onManualRefresh}
            className="p-1 text-tertiary hover:text-primary hover:bg-surface-tertiary rounded transition-colors cursor-pointer"
            aria-label={t('tiles.refreshData')}
            title={t('tiles.refreshData')}
          >
            <Icon name={isLoading ? 'hourglass' : 'refresh'} size="sm" />
          </button>
        )}
        <span>Last request: {formatLastUpdate(isLoading, lastUpdate)}</span>
      </div>
      {statusIcon && (
        <span onClick={logTileState} className="cursor-pointer">
          <Icon name={statusIcon.name} size="sm" className={statusIcon.className} />
        </span>
      )}
    </div>
  );
};

const ErrorContent = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-full space-y-1">
    <div className="text-4xl mb-4">🍆</div>
    <p className="text-theme-status-error text-sm text-center">
      {ERROR_MESSAGES.TILE.DATA_FETCH_FAILED}
    </p>
  </div>
));

export const GenericTile = forwardRef<HTMLDivElement, GenericTileProps>(
  (
    {
      tile,
      meta,
      onRemove,
      dragHandleProps,
      className,
      children,
      status,
      lastUpdate,
      data,
      onManualRefresh,
      isLoading,
    },
    ref,
  ) => {
    const handleRemove = useCallback(async () => {
      try {
        onRemove?.(tile.id);
      } catch {
        // TODO: Optionally show a toast or error message
      }
    }, [tile.id, onRemove]);

    const getCardVariant = useCallback((): 'default' | 'elevated' | 'outlined' => {
      if (status === TileStatus.Error || status === TileStatus.Stale) {
        return 'outlined';
      }
      return 'elevated';
    }, [status]);

    const getBorderClass = useCallback(() => {
      if (status === TileStatus.Error) {
        return 'border-status-error';
      }
      if (status === TileStatus.Stale) {
        return 'border-status-warning';
      }
      return '';
    }, [status]);

    // Memoize the content based on status
    const content = useMemo(() => {
      if (status === TileStatus.Loading) {
        return <LoadingComponent />;
      }
      if (status === TileStatus.Error) {
        return <ErrorContent />;
      }
      // For stale and success states, render the children (tile-specific content)
      return children;
    }, [status, children]);

    // Memoize the header props to prevent re-renders
    const headerProps = useMemo(
      () => ({
        className:
          'flex items-center justify-between px-4 py-2 border-b border-theme-primary bg-surface-secondary text-primary cursor-grab active:cursor-grabbing relative min-h-[2.5rem] rounded-t-xl',
        ...dragHandleProps,
      }),
      [dragHandleProps],
    );

    return (
      <TileErrorBoundary>
        <Card
          ref={ref}
          variant={getCardVariant()}
          className={`relative h-full flex flex-col ${getBorderClass()} ${className ?? ''}`}
          data-tile-id={tile.id}
          data-tile-type={tile.type}
          role="gridcell"
          aria-label={`${meta.title} tile`}
          draggable={false}
        >
          {/* Tile Header - Grabbable */}
          <div {...headerProps} data-tile-drag-handle="true">
            <div className="flex items-center space-x-3">
              <Icon
                name={meta.icon}
                size="sm"
                className="text-theme-accent-primary"
                aria-hidden="true"
              />
              <h3 className="text-base font-semibold text-primary truncate">{meta.title}</h3>
            </div>
          </div>

          {/* Close Button - Positioned in top right corner */}
          {onRemove && (
            <button
              onClick={() => void handleRemove()}
              className="absolute top-1 right-1 p-1 text-tertiary hover:text-primary hover:bg-surface-tertiary rounded transition-colors cursor-pointer z-10"
              aria-label={`Remove ${meta.title} tile`}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Icon name="close" size="sm" />
            </button>
          )}

          {/* Tile Content */}
          <div className="flex-1 p-2" role="region" aria-label={`${meta.title} content`}>
            {content}
          </div>

          {/* Status Bar */}
          <StatusBar
            data={data}
            status={status}
            lastUpdate={lastUpdate}
            onManualRefresh={onManualRefresh}
            isLoading={isLoading}
          />
        </Card>
      </TileErrorBoundary>
    );
  },
);

GenericTile.displayName = 'GenericTile';
