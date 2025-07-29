import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthContext } from '../../contexts/AuthContextDef';
import { MockToastProvider } from '../../test/mocks/componentMocks';

import { LogoutButton } from './LogoutButton';

describe('LogoutButton', () => {
  const mockLogout = vi.fn();

  const createMockAuthContext = () => ({
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: mockLogout,
    checkAuth: vi.fn(),
  });

  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('renders logout button', () => {
    const mockAuthContext = createMockAuthContext();

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MockToastProvider>
          <LogoutButton />
        </MockToastProvider>
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('calls logout function when clicked', async () => {
    const mockAuthContext = createMockAuthContext();
    mockLogout.mockResolvedValue(undefined);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MockToastProvider>
          <LogoutButton />
        </MockToastProvider>
      </AuthContext.Provider>,
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('handles logout error gracefully', async () => {
    const mockAuthContext = createMockAuthContext();
    mockLogout.mockRejectedValue(new Error('Logout failed'));

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MockToastProvider>
          <LogoutButton />
        </MockToastProvider>
      </AuthContext.Provider>,
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    // The error is handled gracefully without throwing to console.error
  });
});
