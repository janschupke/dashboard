/**
 * Centralized error messages for user-facing errors
 * All error messages used in the UI should be defined here
 */
export const ERROR_MESSAGES = {
  AUTH: {
    PASSWORD_REQUIRED: /* i18n */ 'auth.passwordRequired',
    INVALID_PASSWORD: /* i18n */ 'auth.invalidPassword',
    LOGIN_FAILED: /* i18n */ 'auth.loginFailed',
    LOGOUT_FAILED: /* i18n */ 'auth.logoutFailed',
  },
  TILE: {
    DATA_FETCH_FAILED: /* i18n */ 'errors.dataFetchFailed',
    COMPONENT_LOAD_ERROR: /* i18n */ 'errors.componentLoad',
    TILE_ERROR: /* i18n */ 'errors.tileError',
    UNKNOWN_ERROR: /* i18n */ 'errors.unknown',
  },
  API: {
    TIMEOUT: (seconds: number) => `API request timed out after ${seconds} seconds`,
    NO_MAPPER_FOUND: (tileType: string) => `No data mapper found for tile type: ${tileType}`,
    NO_PARSER_FOUND: (tileType: string) => `No parser registered for tile type: ${tileType}`,
    NO_GLOBAL_QUOTE: /* i18n */ 'errors.noGlobalQuote',
    MISSING_REQUIRED_FIELDS: /* i18n */ 'errors.missingGlobalQuoteFields',
    MAPPING_FAILED: (error: string) => `Failed to map GDX ETF data: ${error}`,
  },
  GENERAL: {
    LOADING: /* i18n */ 'general.loading',
    SIGNING_IN: /* i18n */ 'auth.signingIn',
    SIGN_IN: /* i18n */ 'auth.signIn',
  },
} as const;
