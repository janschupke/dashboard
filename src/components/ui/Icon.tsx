interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Icon({ name, size = 'md', className = '' }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconMap: Record<string, string> = {
    // Cryptocurrency icons
    bitcoin: '₿',
    ethereum: 'Ξ',
    crypto: '💎',

    // Precious metals icons
    gold: '🥇',
    silver: '🥈',
    metals: '🏆',

    // UI icons
    close: '✕',
    add: '+',
    menu: '☰',
    drag: '⋮⋮',
    resize: '⤡',
    settings: '⚙',
    refresh: '↻',
    error: '⚠',
    success: '✓',
    check: '✓',
    loading: '⟳',
    hourglass: '⏳',
    sun: '☀',
    moon: '🌙',
    chart: '📊',
    weather: '🌤',
    clock: '🕐',
    database: '💾',
    'alert-circle': '⚠',

    // Log view icons
    'clipboard-list': '📋',
    'exclamation-triangle': '⚠',
    'exclamation-circle': '⚠',
    'check-circle': '✓',
    'information-circle': 'ℹ',
    trash: '🗑',
    x: '✕',

    // Weather/geo icons
    earthquake: '🌎',
    'weather-alerts': '🌪️',
  };

  const icon = iconMap[name] || '?';
  const classes = `${sizeClasses[size]} flex items-center justify-center ${className}`;

  return (
    <span className={classes} role="img" aria-label={name}>
      {icon}
    </span>
  );
}
