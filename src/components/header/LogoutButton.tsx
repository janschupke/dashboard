import React from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../ui/Icon';

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
      <Icon name="logout" size="sm" />
    </button>
  );
};
