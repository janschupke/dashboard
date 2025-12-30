import React from 'react';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Icon({ name, size = 'md', className = '' }: IconProps): React.ReactNode {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconMap: Record<string, string> = {
    crypto: '💎',
    metals: '🏆',

    // UI icons
    close: '✕',
    menu: '☰',
    refresh: '↻',
    error: '⚠',
    success: '✓',
    loading: '⟳',
    hourglass: '⏳',
    sun: '☀',
    moon: '🌙',
    warning: '⚠',
    chart: '📊',
    weather: '🌤',
    clock: '🕐',
    earthquake: '🌎',
    'weather-alerts': '🌪️',
    logout: '🚪',

    // Toast icons
    'toast-error': '⚠',
    'toast-success': '✓',
    'toast-warning': '⚠',
    'toast-info': 'ℹ',

    // Log view icons
    'clipboard-list': '📋',
    'exclamation-triangle': '⚠',
    'exclamation-circle': '⚠',
    'check-circle': '✓',
    trash: '🗑',
    x: '✕',
  };

  const icon = iconMap[name] ?? '?';
  const classes = `${sizeClasses[size]} flex items-center justify-center ${className}`;

  return (
    <span className={classes} role="img" aria-label={name}>
      {icon}
    </span>
  );
}
