import React from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Successfully logged out', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      addToast('Failed to logout. Please try again.', 'error');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-surface-secondary transition-colors duration-200"
      title="Logout"
      data-testid="logout-button"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    </button>
  );
};
