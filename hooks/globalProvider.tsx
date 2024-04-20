'use client';
import {
  getMenuByBusiness,
  getMenuConfiguration,
} from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import React, { useContext, useEffect, useState } from 'react';

const AppContext = React.createContext();

const AppProvider = ({ children }: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const convertActiveTile = (activeTile: number) => {
    const previewStyles: { [key: string]: string } = {
      0: 'List left',
      1: 'List Right',
      2: 'Single column 1',
      3: 'Single column 2',
      4: 'Double column',
    };

    return previewStyles[activeTile];
  };

  const [userData, setUserData] = useState(null);

  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenDeleteVariety, setIsOpenDeleteVariety] = useState(false);
  const [isSelectedPreview, setIsSelectedPreview] = useState(true);
  const [activeTile, setActiveTile] = useState<string>('List left');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [imageReference, setImageReference] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const toggleModalDelete = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };
  const toggleModalDeleteVariety = () => {
    setIsOpenDeleteVariety(!isOpenDeleteVariety);
  };

  const handleListItemClick = (column: string) => {
    setActiveTile(column);
  };

  const fetchMenuConfig = async () => {
    const data = await getMenuConfiguration(businessInformation[0]?.businessId);

    if (data?.data?.isSuccessful) {
      setActiveTile(convertActiveTile(data?.data?.data?.layout));
      setSelectedImage(`data:image/jpeg;base64,${data?.data?.data?.image}`);
      setBackgroundColor(data?.data?.data?.backgroundColour);
      setImageReference(data?.data?.data?.imageRef);
      setIsSelectedPreview(data?.data?.data?.useBackground);
    } else if (data?.data?.error) {
    }
  };

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        fetchMenuConfig,
        imageReference,
        setImageReference,
        backgroundColor,
        setBackgroundColor,
        isSelectedPreview,
        setIsSelectedPreview,
        handleListItemClick,
        isOpenDelete,
        isOpenEdit,
        selectedImage,
        isOpenDeleteVariety,
        setIsOpenDeleteVariety,
        toggleModalDeleteVariety,
        setSelectedImage,
        activeTile,
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
