'use client';

import React, { ReactNode } from 'react';
import { MenuProvider } from './MenuProvider';
import { TableProvider } from './TableProvider';
import { AuthProvider } from './AuthProvider';

interface CombinedProviderProps {
  children: ReactNode;
}

// Combined provider that wraps all context providers
export const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <TableProvider>
        <MenuProvider>
          {children}
        </MenuProvider>
      </TableProvider>
    </AuthProvider>
  );
};

// Export all hooks for convenience
export { useMenuContext } from './MenuProvider';
export { useTableContext } from './TableProvider';
export { useAuthContext } from './AuthProvider';