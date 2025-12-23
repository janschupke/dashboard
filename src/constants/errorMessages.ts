/**
 * Centralized error messages for user-facing errors
 * All error messages used in the UI should be defined here
 */
export const ERROR_MESSAGES = {
  AUTH: {
    PASSWORD_REQUIRED: 'Password is required',
    INVALID_PASSWORD: 'Invalid password',
    LOGIN_FAILED: 'Login failed. Please try again.',
    LOGOUT_FAILED: 'Logout failed. Please try again.',
  },
  TILE: {
    DATA_FETCH_FAILED: 'Data failed to fetch',
    COMPONENT_LOAD_ERROR: 'There was an error loading this component.',
    TILE_ERROR: 'Tile Error',
    UNKNOWN_ERROR: 'Unknown error',
  },
  API: {
    TIMEOUT: (seconds: number) => `API request timed out after ${seconds} seconds`,
    NO_MAPPER_FOUND: (tileType: string) => `No data mapper found for tile type: ${tileType}`,
    NO_PARSER_FOUND: (tileType: string) => `No parser registered for tile type: ${tileType}`,
    NO_GLOBAL_QUOTE: 'No Global Quote data found in API response',
    MISSING_REQUIRED_FIELDS: 'Missing required fields in Global Quote data',
    MAPPING_FAILED: (error: string) => `Failed to map GDX ETF data: ${error}`,
  },
  GENERAL: {
    LOADING: 'Loading...',
    SIGNING_IN: 'Signing in...',
    SIGN_IN: 'Sign in',
  },
} as const;
