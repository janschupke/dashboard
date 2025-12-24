import { describe, it, expect } from 'vitest';

import { validatePassword, validateLoginResponse } from './authValidation';

describe('authValidation', () => {
  it('validatePassword - rejects empty/whitespace', () => {
    expect(validatePassword('')).toEqual({ isValid: false, error: 'auth.passwordRequired' });
    expect(validatePassword('   ')).toEqual({ isValid: false, error: 'auth.passwordRequired' });
  });

  it('validatePassword - accepts non-empty', () => {
    expect(validatePassword('secret')).toEqual({ isValid: true });
  });

  it('validateLoginResponse - returns error key when not successful', () => {
    expect(validateLoginResponse(false)).toBe('auth.invalidPassword');
  });

  it('validateLoginResponse - undefined when successful', () => {
    expect(validateLoginResponse(true)).toBeUndefined();
  });
});
