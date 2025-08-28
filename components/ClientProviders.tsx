'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}