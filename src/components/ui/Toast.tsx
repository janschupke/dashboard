import React, { useState, useEffect } from 'react';

import { useToast } from '../../hooks/useToast';

import { Icon } from './Icon';

type ToastType = 'error' | 'success' | 'warning' | 'info';

interface AnimatedToastProps {
  toast: {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  };
  onRemove: (id: string) => void;
}

const AnimatedToast: React.FC<AnimatedToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = (): void => {
    setIsExiting(true);
    // Wait for exit animation to complete before removing from DOM
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = (type: ToastType): string => {
    const baseStyles =
      'max-w-sm w-full p-4 rounded-lg shadow-lg transition-all duration-300 transform';

    const typeStyles = (() => {
      switch (type) {
        case 'error':
          return 'bg-status-error text-white border-l-4 border-status-error';
        case 'success':
          return 'bg-status-success text-white border-l-4 border-status-success';
        case 'warning':
          return 'bg-status-warning text-white border-l-4 border-status-warning';
        case 'info':
          return 'bg-status-info text-white border-l-4 border-status-info';
        default:
          return 'bg-surface-secondary text-primary border-l-4 border-secondary';
      }
    })();

    const animationStyles =
      isVisible && !isExiting
        ? 'translate-x-0 opacity-100'
        : isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-full opacity-0';

    return `${baseStyles} ${typeStyles} ${animationStyles}`;
  };

  const getIcon = (type: ToastType): React.ReactNode => {
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
    <div className={getToastStyles(toast.type)} role="alert" aria-live="assertive">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{getIcon(toast.type)}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={handleRemove}
            className="inline-flex text-white hover:text-secondary focus:outline-none focus:text-secondary transition-colors duration-200"
            aria-label={/* i18n */ 'ui.closeNotification'}
          >
            <Icon name="close" size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <AnimatedToast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};
