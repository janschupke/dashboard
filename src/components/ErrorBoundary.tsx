import React from 'react';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

 
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (_error: Error, _errorInfo: React.ErrorInfo) => void;  
}

interface ErrorBoundaryState {
  hasError: boolean;
  _error: Error | null;
  _errorInfo: React.ErrorInfo | null;
}

class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, _error: null, _errorInfo: null };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true, _error, _errorInfo: null };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true, _error, _errorInfo });
    // Log error to monitoring service
    console.error('Dashboard Error:', _error, _errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(_error, _errorInfo);
      } catch (handlerError) {
        console.error('Error in error boundary handler:', handlerError);
      }
    }

    // Report error to external service in production
    if (import.meta.env.PROD) {
      this.reportError(_error, _errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // In a real application, this would send to an error reporting service
    // like Sentry, LogRocket, or similar
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Example: send to error reporting service
      // errorReportingService.captureException(errorReport);
      console.log('Error report:', errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, _error: null, _errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={new Error('Unknown error')} resetError={this.resetError} />;
      }

      return (
        <div className="p-6 text-center bg-surface-secondary border border-error-200 rounded-lg">
          <div className="mb-4">
            <Icon name="warning" size="lg" className="text-error-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-error-600 mb-2">Something went wrong</h2>
            <p className="text-theme-secondary mb-4 text-sm">
              There was an error loading this component.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="primary" size="sm" onClick={this.resetError}>
              Try Again
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { DashboardErrorBoundary as ErrorBoundary };
