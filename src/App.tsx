import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { AuthenticatedApp } from './components/auth/AuthenticatedApp';
import { LoginForm } from './components/auth/LoginForm';
import { ToastContainer } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';

function AppContent() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-primary">
        <div className="text-theme-primary">{t('general.loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
