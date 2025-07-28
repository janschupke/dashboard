import React from 'react';
import { Icon } from '../ui/Icon';

export interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  disabled?: boolean;
}

// TODO: Animated icon is small and ugly
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isRefreshing,
  disabled = false,
}) => (
  <button
    onClick={onRefresh}
    disabled={disabled || isRefreshing}
    className={`p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors ${
      disabled || isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    aria-label="Refresh all tiles"
    title="Refresh all tiles (R)"
    data-testid="refresh-button"
  >
    <Icon name={isRefreshing ? 'hourglass' : 'refresh'} size="md" />
  </button>
);
