import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validatePassword, validateLoginResponse } from '../../utils/authValidation';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate password using extracted validation logic
    const validation = validatePassword(password);
    if (!validation.isValid) {
      addToast(validation.error ?? t('auth.passwordRequired'), 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(password);
      const errorMessage = validateLoginResponse(success);
      if (errorMessage) {
        addToast(t('auth.invalidPassword'), 'error');
      }
    } catch {
      addToast(t('auth.loginFailed'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">{t('header.title')}</h1>
          <p className="text-theme-secondary">{t('auth.prompt')}</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-2 border border-secondary rounded-md placeholder-theme-secondary text-theme-primary bg-surface-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:border-interactive-primary focus:z-10 sm:text-sm"
              placeholder={t('auth.password')}
              disabled={isLoading}
            />
          </div>

          <div>
            <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
