import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const variantClasses = {
  primary:
    'bg-interactive-primary text-theme-inverse hover:bg-interactive-hover focus:ring-interactive-primary',
  secondary:
    'bg-surface-secondary text-primary hover:bg-surface-tertiary border border-primary',
  ghost: 'text-secondary hover:text-primary hover:bg-surface-secondary',
  icon: 'text-secondary hover:text-primary hover:bg-surface-secondary focus:ring-0 focus:ring-offset-0',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Icon variant uses padding instead of size classes
  const paddingClass = variant === 'icon' ? 'p-2' : sizeClass;

  return (
    <button
      className={`${baseClasses} ${variantClass} ${paddingClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
