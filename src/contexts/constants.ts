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
