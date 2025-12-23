import React from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
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
    <Button
      variant="icon"
      size="sm"
      onClick={() => void handleLogout()}
      title="Logout"
      data-testid="logout-button"
    >
      <Icon name="logout" size="sm" />
    </Button>
  );
};
