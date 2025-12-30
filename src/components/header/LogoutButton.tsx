import React from 'react';

import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export const LogoutButton: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      addToast(t('auth.logoutSuccess'), 'success');
    } catch (error) {
      console.error('Logout error:', error);
      addToast(t('auth.logoutFailed'), 'error');
    }
  };

  return (
    <>
      <Button
        variant="icon"
        size="sm"
        onClick={() => void handleLogout()}
        data-tooltip-id="logout-button-tooltip"
        data-tooltip-content="Logout"
        data-testid="logout-button"
      >
        <Icon name="logout" size="sm" />
      </Button>
      <Tooltip id="logout-button-tooltip" />
    </>
  );
};
