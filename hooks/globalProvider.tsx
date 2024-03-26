'use client';
import React, { useContext, useState } from 'react';

const AppContext = React.createContext();

const AppProvider = ({ children }: any) => {
  const [userData, setUserData] = useState(null);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
// make sure use
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
