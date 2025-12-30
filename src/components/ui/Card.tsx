import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  children?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-surface-primary border border-primary',
  elevated: 'bg-surface-primary border border-primary shadow-md hover:shadow-lg',
  outlined: 'bg-surface-primary border border-secondary',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-shadow duration-200';
    const variantClass = variantClasses[variant];

    return (
      <div ref={ref} className={`${baseClasses} ${variantClass} ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
