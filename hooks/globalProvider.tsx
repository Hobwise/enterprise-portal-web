'use client';

// Re-export everything from the new providers for backward compatibility
import React from 'react';
import { CombinedProvider, useMenuContext, useTableContext, useAuthContext } from './providers/CombinedProvider';

// Legacy AppProvider that now uses the new split providers
export const AppProvider = CombinedProvider;

// Legacy context hook that combines all contexts for backward compatibility
export const useGlobalContext = () => {
  const menuContext = useMenuContext();
  const tableContext = useTableContext();
  const authContext = useAuthContext();

  // Combine all contexts into one object for backward compatibility
  return {
    // From MenuContext
    ...menuContext,

    // From TableContext
    ...tableContext,

    // From AuthContext
    ...authContext,

    // Keep setActiveTile optional for backward compatibility
    setActiveTile: menuContext.setActiveTile,
    handleListItemClick: menuContext.handleListItemClick,
    fetchMenuConfig: menuContext.fetchMenuConfig,
    setUserData: authContext.setUserData,
    setLoginDetails: authContext.setLoginDetails,
    setExpireTime: authContext.setExpireTime,
    setBusinessProfileNavigate: authContext.setBusinessProfileNavigate,
  };
};

// Export for backward compatibility
export const AppContext = React.createContext<any>(undefined);