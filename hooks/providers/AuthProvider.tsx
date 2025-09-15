'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface AuthContextType {
  userData: any;
  setUserData: (data: any) => void;
  loginDetails: any;
  setLoginDetails: (details: any) => void;
  expireTime: any;
  setExpireTime: (time: any) => void;
  businessProfileNavigate: number;
  setBusinessProfileNavigate: (value: number) => void;
  clearAuthData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loginDetails, setLoginDetails] = useState(null);
  const [expireTime, setExpireTime] = useState<any>('');
  const [businessProfileNavigate, setBusinessProfileNavigate] = useState<number>(0);

  // Memoized callback to clear all auth data
  const clearAuthData = useCallback(() => {
    setUserData(null);
    setLoginDetails(null);
    setExpireTime('');
    setBusinessProfileNavigate(0);
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    userData,
    setUserData,
    loginDetails,
    setLoginDetails,
    expireTime,
    setExpireTime,
    businessProfileNavigate,
    setBusinessProfileNavigate,
    clearAuthData,
  }), [
    userData,
    loginDetails,
    expireTime,
    businessProfileNavigate,
    clearAuthData
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};