import React from 'react';

import i18n from '../../i18n/config';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  variant?: 'app' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in error boundary handler:', handlerError);
      }
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        // Use the actual caught error, or create a generic one if somehow missing
        const errorToPass = this.state.error ?? new Error(i18n.t('errors.unknown'));
        return <FallbackComponent error={errorToPass} resetError={this.resetError} />;
      }

      // Component-level error boundary (simpler)
      if (this.props.variant === 'component') {
        return (
          <div className="p-4 text-center text-red-600" data-testid="error-boundary-message">
            {i18n.t('errors.componentLoad')}
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="text-center" aria-label={i18n.t('errors.unknown')}>
            <div className="text-8xl mb-4">🍆</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
