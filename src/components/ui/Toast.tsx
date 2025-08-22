import React from 'react';

import { useToast } from '../../hooks/useToast';

import { Icon } from './Icon';

type ToastType = 'error' | 'success' | 'warning' | 'info';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: ToastType) => {
    const baseStyles =
      'fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg transition-all duration-300 transform';

    switch (type) {
      case 'error':
        return `${baseStyles} bg-status-error text-white border-l-4 border-status-error`;
      case 'success':
        return `${baseStyles} bg-status-success text-white border-l-4 border-status-success`;
      case 'warning':
        return `${baseStyles} bg-status-warning text-white border-l-4 border-status-warning`;
      case 'info':
        return `${baseStyles} bg-status-info text-white border-l-4 border-status-info`;
      default:
        return `${baseStyles} bg-surface-secondary text-theme-primary border-l-4 border-theme-secondary`;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'error':
        return <Icon name="toast-error" size="sm" />;
      case 'success':
        return <Icon name="toast-success" size="sm" />;
      case 'warning':
        return <Icon name="toast-warning" size="sm" />;
      case 'info':
        return <Icon name="toast-info" size="sm" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastStyles(toast.type)}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">{getIcon(toast.type)}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={() => removeToast(toast.id)}
                className="inline-flex text-white hover:text-theme-secondary focus:outline-none focus:text-theme-secondary transition-colors duration-200"
                aria-label="Close notification"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
