import React, { useCallback, forwardRef, useMemo, useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

import { now } from '../../utils/luxonUtils';
import { minutesToMs } from '../../utils/timeUtils';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

import { LoadingComponent } from './LoadingComponent';
import { TileErrorBoundary } from './TileErrorBoundary';
import {
  formatLastUpdate,
  getStatusIcon,
  getStatusTooltipText,
  getLastRequestTooltipContent,
  getLastRequestTooltipHtml,
  getCardVariant,
  getBorderClass,
} from './tileUtils';
import { TileStatus } from './useTileData';

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
  lastSuccessfulDataUpdate?: string; // Timestamp of last successful data fetch
  onManualRefresh?: () => void;
  isLoading?: boolean;
  onRemove?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  className?: string;
  data?: unknown; // Optional data prop for tiles that need it
}

const StatusBar = ({
  status,
  lastUpdate,
  lastSuccessfulDataUpdate,
  onManualRefresh,
  isLoading,
  tileId,
}: {
  status?: TileStatus;
  lastUpdate?: string;
  lastSuccessfulDataUpdate?: string;
  onManualRefresh?: () => void;
  isLoading?: boolean;
  tileId: string;
}): React.ReactNode => {
  const [currentTime, setCurrentTime] = useState(now());

  // Update current time every minute to keep elapsed time accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(now());
    }, minutesToMs(1)); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const { t } = useTranslation();
  const statusIcon = getStatusIcon(status);

  const lastRequestTooltipId = `tile-last-request-tooltip-${tileId}`;
  const statusTooltipId = `tile-status-tooltip-${tileId}`;

  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs border-t border-primary bg-surface-secondary text-secondary rounded-b-xl">
      <div className="flex items-center space-x-2">
        {onManualRefresh && (
          <>
            <button
              onClick={onManualRefresh}
              className="p-1 text-tertiary hover:text-primary hover:bg-surface-tertiary rounded transition-colors cursor-pointer"
              aria-label={t('tiles.refreshData')}
              data-tooltip-id="tile-refresh-tooltip"
              data-tooltip-content={t('tiles.refreshData')}
            >
              <Icon name={isLoading ? 'hourglass' : 'refresh'} size="sm" />
            </button>
            <Tooltip id="tile-refresh-tooltip" />
          </>
        )}
        <span
          data-tooltip-id={lastRequestTooltipId}
          {...(getLastRequestTooltipHtml(status, lastUpdate, lastSuccessfulDataUpdate, t)
            ? {
                'data-tooltip-html':
                  getLastRequestTooltipHtml(status, lastUpdate, lastSuccessfulDataUpdate, t) ??
                  null,
              }
            : {
                'data-tooltip-content': getLastRequestTooltipContent(status, lastUpdate, t) ?? null,
              })}
          className="cursor-help"
        >
          {t('tile.lastRequest')}: {formatLastUpdate(isLoading, lastUpdate, currentTime, t)}
        </span>
        <Tooltip id={lastRequestTooltipId} />
      </div>
      {statusIcon && (
        <>
          <span
            className="cursor-pointer"
            data-tooltip-id={statusTooltipId}
            data-tooltip-content={getStatusTooltipText(status, t)}
          >
            <Icon name={statusIcon.name} size="sm" className={statusIcon.className} />
          </span>
          <Tooltip id={statusTooltipId} />
        </>
      )}
    </div>
  );
};

const ErrorContent = React.memo(() => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-1">
      <div className="text-4xl mb-4">🍆</div>
      <p className="text-theme-status-error text-sm text-center">{t('errors.dataFetchFailed')}</p>
    </div>
  );
});

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
      lastSuccessfulDataUpdate,
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
          'flex items-center justify-between px-4 py-2 border-b border-primary bg-surface-secondary text-primary cursor-grab active:cursor-grabbing relative min-h-[2.5rem] rounded-t-xl',
        ...dragHandleProps,
      }),
      [dragHandleProps],
    );

    const { t } = useTranslation();
    return (
      <TileErrorBoundary>
        <Card
          ref={ref}
          variant={getCardVariant(status)}
          className={`relative h-full flex flex-col ${getBorderClass(status)} ${className ?? ''}`}
          data-tile-id={tile.id}
          data-tile-type={tile.type}
          role="gridcell"
          aria-label={`${meta.title} tile`}
          draggable={false}
        >
          {/* Tile Header - Grabbable */}
          <div {...headerProps} data-tile-drag-handle="true">
            <div className="flex items-center space-x-3">
              <Icon name={meta.icon} size="sm" className="text-accent-primary" aria-hidden="true" />
              <h3 className="text-base font-semibold text-primary truncate">{meta.title}</h3>
            </div>
          </div>

          {/* Close Button - Positioned in top right corner */}
          {onRemove && (
            <>
              <button
                onClick={() => void handleRemove()}
                className="absolute top-1 right-1 p-1 text-tertiary hover:text-primary hover:bg-surface-secondary rounded transition-colors cursor-pointer z-10"
                aria-label={`Remove ${meta.title} tile`}
                data-tooltip-id={`tile-close-tooltip-${tile.id}`}
                data-tooltip-content={`Remove ${meta.title} tile`}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Icon name="close" size="sm" />
              </button>
              <Tooltip id={`tile-close-tooltip-${tile.id}`} />
            </>
          )}

          {/* Tile Content */}
          <div
            className="flex-1 p-2"
            role="region"
            aria-label={`${meta.title} ${t('tile.content')}`}
          >
            {content}
          </div>

          {/* Status Bar */}
          <StatusBar
            {...(status !== undefined && { status })}
            {...(lastUpdate !== undefined && { lastUpdate })}
            {...(lastSuccessfulDataUpdate !== undefined && { lastSuccessfulDataUpdate })}
            {...(onManualRefresh !== undefined && { onManualRefresh })}
            {...(isLoading !== undefined && { isLoading })}
            tileId={tile.id}
          />
        </Card>
      </TileErrorBoundary>
    );
  },
);

GenericTile.displayName = 'GenericTile';
