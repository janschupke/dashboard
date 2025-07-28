import React, { useState, useCallback } from 'react';

import { Icon } from '../ui/Icon';

import type { TileType } from '../../types/tile';

interface SidebarItemProps {
  tileType: TileType;
  name: string;
  description?: string;
  icon: string;
  isActive: boolean;
  isSelected?: boolean;
  onClick: () => Promise<void> | void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  tileType,
  name,
  icon,
  isActive,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  }, [onClick, disabled, isLoading]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onMouseEnter?.();
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onMouseLeave?.();
  }, [onMouseLeave]);

  const getStateClasses = () => {
    if (isSelected) {
      return 'border border-yellow-500 bg-surface-primary text-theme-primary';
    }
    return 'border border-theme-primary bg-surface-primary text-theme-primary';
  };

  const getHoverClasses = () => {
    if (isHovered && !disabled) {
      return 'bg-surface-secondary';
    }
    return '';
  };

  return (
    <button
      className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 rounded-lg ${getStateClasses()} ${getHoverClasses()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isLoading ? 'opacity-75' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || isLoading}
      aria-label={`${isActive ? 'Remove' : 'Add'} ${name} tile ${isActive ? 'from' : 'to'} dashboard`}
      aria-pressed={isActive}
      aria-busy={isLoading}
      data-tile-type={tileType}
      tabIndex={0}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/dashboard-tile-type', tileType);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onDragEnd={() => {}}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title={`${isActive ? 'Remove' : 'Add'} ${name} tile ${isActive ? 'from' : 'to'} dashboard`}
      aria-grabbed={false}
    >
      <span className="flex items-center flex-1 min-w-0">
        <Icon
          name={icon}
          size="sm"
          className="text-theme-secondary mr-2 flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-left text-sm font-medium truncate">{name}</span>
      </span>
      <span className="flex-shrink-0 flex items-center">
        {isLoading ? (
          <Icon
            name="loading"
            size="sm"
            className="animate-spin text-accent-primary"
            aria-hidden="true"
          />
        ) : isActive ? (
          <Icon name="success" size="sm" className="text-accent-primary" aria-hidden="true" />
        ) : null}
      </span>
    </button>
  );
};
