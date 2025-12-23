/**
 * Authentication validation utilities
 * Extracted from component logic to maintain separation of concerns
 * 
 * Note: Error messages should be handled via i18n in components
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a password input
 * Returns error key for i18n translation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || !password.trim()) {
    return {
      isValid: false,
      error: 'auth.passwordRequired', // i18n key
    };
  }
  return { isValid: true };
}

/**
 * Validates login response
 * Returns error key for i18n translation
 */
export function validateLoginResponse(success: boolean): string | undefined {
  if (!success) {
    return 'auth.invalidPassword'; // i18n key
  }
  return undefined;
}

