import { useContext } from 'react';

import { ToastContext } from '../contexts/ToastContextDef';

import type { ToastContextType } from '../contexts/ToastContextDef';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
