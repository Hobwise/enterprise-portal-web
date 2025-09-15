import React, { Suspense } from 'react';
import { Spinner } from '@nextui-org/react';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Default loading component
const DefaultLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" color="primary" />
  </div>
);

// Wrapper component for lazy-loaded components with Suspense
export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <DefaultLoader />
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Page-specific loader for full-page lazy loading
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Spinner size="lg" color="primary" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Component-specific loader for smaller components
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Spinner size="md" color="primary" />
  </div>
);