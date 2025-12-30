import React from 'react';

export const LoadingComponent = (): React.ReactNode => {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent-primary"></div>
    </div>
  );
};
