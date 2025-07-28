/**
 * Global API Configuration
 * Contains timeout, retry, and delay settings for API requests
 */
export const API_CONFIG = {
  /** Default timeout for API requests in milliseconds */
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  /** Maximum number of retry attempts for failed requests */
  MAX_RETRIES: 3,
  /** Delay between retry attempts in milliseconds */
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Global UI Configuration
 * Contains animation durations, spacing, font sizes, and other UI constants
 */
export const UI_CONFIG = {
  /** Animation duration for smooth transitions in milliseconds */
  ANIMATION_DURATION: 200, // milliseconds
  /** Transition duration for UI state changes in milliseconds */
  TRANSITION_DURATION: 300, // milliseconds
  /** Focus ring offset for accessibility in pixels */
  FOCUS_RING_OFFSET: 2,
  /** Border radius values for different component sizes in pixels */
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
  },
  /** Spacing values for consistent layout in pixels */
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  /** Font sizes for consistent typography in pixels */
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
  },
  /** Chart height values for different tile sizes in pixels */
  CHART_HEIGHTS: {
    LARGE: 300,
    MEDIUM: 200,
    SMALL: 150,
  },
  /** Refresh interval values for data updates in milliseconds */
  REFRESH_INTERVALS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  /** Volatility settings for precious metals in percentage points */
  VOLATILITY: {
    GOLD: 50,
    SILVER: 2,
  },
} as const;

/**
 * Theme Classes for consistent styling
 * Contains Tailwind CSS class names for theme-based styling
 */
export const THEME_CLASSES = {
  /** Text color classes for different theme contexts */
  TEXT: {
    PRIMARY: 'text-theme-primary',
    SECONDARY: 'text-theme-secondary',
    MUTED: 'text-theme-muted',
    INVERSE: 'text-theme-inverse',
  },
  /** Background color classes for different surface types */
  BACKGROUND: {
    PRIMARY: 'bg-surface-primary',
    SECONDARY: 'bg-surface-secondary',
    TERTIARY: 'bg-surface-tertiary',
    MUTED: 'bg-surface-muted',
  },
  /** Border color classes for different theme contexts */
  BORDER: {
    PRIMARY: 'border-theme-primary',
    SECONDARY: 'border-theme-secondary',
    MUTED: 'border-theme-muted',
  },
  /** Interactive element classes for buttons and clickable elements */
  INTERACTIVE: {
    BUTTON_PRIMARY: 'bg-accent-primary text-accent-inverse hover:bg-accent-hover',
    BUTTON_SECONDARY: 'bg-surface-secondary text-theme-primary hover:bg-surface-tertiary',
    BUTTON_MUTED: 'bg-surface-muted text-theme-secondary hover:bg-surface-tertiary',
  },
} as const;

/**
 * Global Error Messages
 * Contains user-friendly error messages for different error types
 */
export const ERROR_MESSAGES = {
  /** Message for network connectivity issues */
  NETWORK_ERROR: 'Network error occurred',
  /** Message for request timeout errors */
  TIMEOUT_ERROR: 'Request timed out',
  /** Message for unknown or unexpected errors */
  UNKNOWN_ERROR: 'An unknown error occurred',
  /** Message for data validation errors */
  VALIDATION_ERROR: 'Invalid data provided',
} as const;

/**
 * Global Time Constants
 * Contains time conversion constants for calculations
 */
export const TIME_CONSTANTS = {
  /** Number of milliseconds in one second */
  MILLISECONDS_PER_SECOND: 1000,
  /** Number of seconds in one minute */
  SECONDS_PER_MINUTE: 60,
  /** Number of minutes in one hour */
  MINUTES_PER_HOUR: 60,
  /** Number of hours in one day */
  HOURS_PER_DAY: 24,
  /** Number of days in one week */
  DAYS_PER_WEEK: 7,
  /** Average number of days in one month */
  DAYS_PER_MONTH: 30,
  /** Number of days in one year */
  DAYS_PER_YEAR: 365,
} as const;

/**
 * Global Cache Configuration
 * Contains time-to-live (TTL) values for different cache types
 */
export const CACHE_CONFIG = {
  /** Default cache TTL in milliseconds (5 minutes) */
  DEFAULT_TTL: 300000, // 5 minutes
  /** Short cache TTL in milliseconds (30 seconds) */
  SHORT_TTL: 30000, // 30 seconds
  /** Long cache TTL in milliseconds (30 minutes) */
  LONG_TTL: 1800000, // 30 minutes
} as const;

/**
 * Data refresh intervals
 * Contains refresh intervals for different data types
 */
export const REFRESH_INTERVALS = {
  TILE_DATA: 10 * 60 * 1000, // 10 minutes
  COUNTDOWN_UPDATE: 1000, // 1 second for countdown timer

  // Tile-specific refresh intervals
  TILES: {
    CRYPTOCURRENCY: 2 * 60 * 1000,
    PRECIOUS_METALS: 1 * 60 * 1000,
    FEDERAL_FUNDS_RATE: 60 * 60 * 1000,
    GDX_ETF: 60 * 60 * 1000,
    URANIUM: 60 * 60 * 1000,
    EURIBOR_RATE: 60 * 60 * 1000,
  },
} as const;

/**
 * Local storage keys
 * Contains key prefixes and names for local storage
 */
export const STORAGE_KEYS = {
  TILE_DATA_PREFIX: 'tile-data-',
  DASHBOARD_CONFIG: 'dashboard-config',
} as const;
