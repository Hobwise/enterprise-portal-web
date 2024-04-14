'use client';
import { getMenuByBusiness } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import React, { useContext, useEffect, useState } from 'react';

const AppContext = React.createContext();

const AppProvider = ({ children }: any) => {
  const [userData, setUserData] = useState(null);

  const [isOpenDelete, setIsOpenDelete] = useState(false);

  const [isOpenEdit, setIsOpenEdit] = useState(false);

  const toggleModalDelete = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,

        isOpenDelete,
        isOpenEdit,

        setIsOpenDelete,
        toggleModalDelete,
        setIsOpenEdit,
        toggleModalEdit,
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
