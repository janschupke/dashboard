import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupGlobalErrorHandling } from './apiErrorInterceptor';

// storageManager.addLog is called; stub it
vi.mock('./storageManager', () => ({
  storageManager: { addLog: vi.fn() },
}));

describe('apiErrorInterceptor', () => {
  beforeEach(() => {
    // Reset spies between tests
    vi.restoreAllMocks();
  });

  it('suppresses network-related console.error/warn', () => {
    const errorSpy = vi.spyOn(console, 'error');
    const warnSpy = vi.spyOn(console, 'warn');

    setupGlobalErrorHandling();

    console.error('fetch failed');
    console.error('429 Too Many Requests');
    console.warn('fetch something');

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('passes through other console messages', () => {
    const spyErr = vi.spyOn(console, 'error');
    const spyWarn = vi.spyOn(console, 'warn');

    setupGlobalErrorHandling();

    console.error('other error');
    console.warn('other warn');

    expect(spyErr).toHaveBeenCalledWith('other error');
    expect(spyWarn).toHaveBeenCalledWith('other warn');
  });
});
