import React, { useState } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      addToast('Password is required', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(password);
      if (!success) {
        addToast('Invalid password', 'error');
      }
    } catch {
      addToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">Dashboard</h1>
          <p className="text-theme-secondary">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="relative block w-full px-3 py-2 border border-theme-secondary rounded-md placeholder-theme-secondary text-theme-primary bg-surface-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:border-interactive-primary focus:z-10 sm:text-sm"
              placeholder="Password"
              disabled={isLoading}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
