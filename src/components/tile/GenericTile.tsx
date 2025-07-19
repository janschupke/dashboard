import React, { useCallback, forwardRef, useMemo } from 'react';
import type { DragboardTileData, DraggableTileProps } from '../dragboard';
import { Icon } from '../ui/Icon';
import { TileErrorBoundary } from './TileErrorBoundary';
import { LoadingComponent } from './LoadingComponent';
import type { TileCategory } from '../../types/tileCategories';
import { TileStatus } from './useTileData';
import type { TileDataType } from '../../services/storageManager';

export interface TileMeta {
  title: string;
  icon: string;
  category?: TileCategory;
}

export interface GenericTileProps extends DraggableTileProps {
  tile: DragboardTileData;
  meta: TileMeta;
  children?: React.ReactNode;
  status?: TileStatus;
  lastUpdate?: string;
  data: TileDataType | null;
}

const StatusBar = ({
  data,
  status,
  lastUpdate,
}: {
  data: TileDataType | null;
  status?: TileStatus;
  lastUpdate?: string;
}) => {
  // Determine status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case TileStatus.Stale:
        return { name: 'warning', className: 'text-theme-status-warning' };
      case TileStatus.Success:
        return { name: 'check', className: 'text-theme-status-success' };
      case TileStatus.Error:
        return { name: 'close', className: 'text-theme-status-error' };
      default:
        return null;
    }
  };

  // Format last update time
  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const logTileState = () => {
    console.log('Tile state:', { data, status, lastUpdate });
  };

  const statusIcon = getStatusIcon();

  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs border-t border-surface-primary bg-surface-secondary text-secondary rounded-b-xl">
      <span>Last request: {formatLastUpdate(lastUpdate)}</span>
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
    <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
  </div>
));

export const GenericTile = forwardRef<HTMLDivElement, GenericTileProps>(
  (
    { tile, meta, onRemove, dragHandleProps, className, children, status, lastUpdate, data },
    ref,
  ) => {
    const handleRemove = useCallback(async () => {
      try {
        onRemove?.(tile.id);
      } catch {
        // TODO: Optionally show a toast or error message
      }
    }, [tile.id, onRemove]);

    const getTileClasses = useCallback(() => {
      // Unified tile styling using Tailwind theme classes for theme support
      const borderStatusClass =
        status === TileStatus.Error
          ? 'border-status-error'
          : status === TileStatus.Stale
            ? 'border-status-warning'
            : 'border-surface-primary';
      const baseClasses = [
        'bg-surface-primary',
        'text-primary',
        'rounded-xl',
        'shadow-md',
        'hover:shadow-lg',
        'transition-shadow',
        'duration-200',
        'relative',
        'border',
        borderStatusClass,
        className || '',
      ].join(' ');
      return baseClasses;
    }, [status, className]);

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
          'flex items-center justify-between px-4 py-2 border-b border-surface-primary bg-surface-secondary text-primary cursor-grab active:cursor-grabbing relative min-h-[2.5rem] rounded-t-xl',
        style: { minHeight: '2.5rem' },
        ...dragHandleProps,
      }),
      [dragHandleProps],
    );

    return (
      <TileErrorBoundary>
        <div
          ref={ref}
          className={getTileClasses()}
          data-tile-id={tile.id}
          data-tile-type={tile.type}
          role="gridcell"
          aria-label={`${meta.title} tile`}
        >
          {/* Tile Header - Grabbable */}
          <div {...headerProps}>
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
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 text-theme-text-tertiary hover:text-primary hover:bg-theme-text-tertiary rounded transition-colors cursor-pointer z-10"
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
          <StatusBar data={data} status={status} lastUpdate={lastUpdate} />
        </div>
      </TileErrorBoundary>
    );
  },
);

GenericTile.displayName = 'GenericTile';
