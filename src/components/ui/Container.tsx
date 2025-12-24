import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'transparent';
  children?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-theme-primary',
  surface: 'bg-surface-primary',
  transparent: 'bg-transparent',
};

export const Container: React.FC<ContainerProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClass = variantClasses[variant];

  return (
    <div className={`${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
