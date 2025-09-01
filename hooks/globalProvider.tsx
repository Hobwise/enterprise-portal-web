'use client';
import { getMenuConfiguration } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import React, { useContext, useState } from 'react';

interface GlobalContextType {
  setPage: (page: number) => void;
  page: number;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  tableStatus: string;
  setTableStatus: (status: string) => void;
  menuIdTable: string;
  setMenuIdTable: (id: string) => void;
  isOpenDelete: boolean;
  setIsOpenDelete: (value: boolean) => void;
  isOpenEdit: boolean;
  setIsOpenEdit: (value: boolean) => void;
  isOpenDeleteVariety: boolean;
  setIsOpenDeleteVariety: (value: boolean) => void;
  isOpenEditVariety: boolean;
  setIsOpenEditVariety: (value: boolean) => void;
  toggleModalDelete: () => void;
  toggleModalEdit: () => void;
  toggleModalDeleteVariety: () => void;
  toggleModalEditVariety: () => void;
  currentMenuItems: any[] | null;
  setCurrentMenuItems: (items: any[] | null) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  currentSearchQuery: string;
  setCurrentSearchQuery: (query: string) => void;
  // Preview-related properties
  activeTile: string;
  setActiveTile?: (tile: string) => void;
  handleListItemClick?: (column: string) => void;
  isSelectedPreview: boolean;
  setIsSelectedPreview: (value: boolean) => void;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  imageReference: string;
  setImageReference: (reference: string) => void;
  selectedTextColor: string;
  setSelectedTextColor: (color: string) => void;
  fetchMenuConfig?: () => Promise<void>;
  userData?: any;
  setUserData?: (data: any) => void;
  loginDetails?: any;
  setLoginDetails?: (details: any) => void;
  expireTime?: any;
  setExpireTime?: (time: any) => void;
  businessProfileNavigate?: number;
  setBusinessProfileNavigate?: (value: number) => void;
}

const AppContext = React.createContext<GlobalContextType | undefined>(undefined);

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
  const [businessProfileNavigate, setBusinessProfileNavigate] =
    useState<number>(0);
  const [expireTime, setExpireTime] = useState<any>('');

  const [isOpenDeleteVariety, setIsOpenDeleteVariety] = useState(false);
  const [isOpenEditVariety, setIsOpenEditVariety] = useState(false);
  const [isSelectedPreview, setIsSelectedPreview] = useState(true);
  const [activeTile, setActiveTile] = useState<string>('List left');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [imageReference, setImageReference] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000');

  const [page, setPage] = React.useState<any>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
  const [tableStatus, setTableStatus] = React.useState<any>('All');
  const [menuIdTable, setMenuIdTable] = React.useState('');
  const [loginDetails, setLoginDetails] = useState(null);

  const [isOpenEdit, setIsOpenEdit] = useState(false);
  
  // Current menu state for preview - Initialize from sessionStorage if available
  const getInitialMenuState = () => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('previewMenuState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return {
          items: parsedState.items || null,
          category: parsedState.category || '',
          section: parsedState.section || '',
          searchQuery: parsedState.searchQuery || ''
        };
      }
    }
    return { items: null, category: '', section: '', searchQuery: '' };
  };
  
  const initialState = getInitialMenuState();
  const [currentMenuItems, setCurrentMenuItems] = useState<any[] | null>(initialState.items);
  const [currentCategory, setCurrentCategory] = useState<string>(initialState.category);
  const [currentSection, setCurrentSection] = useState<string>(initialState.section);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>(initialState.searchQuery);
  
  const toggleModalDelete = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };

  const toggleModalDeleteVariety = () => {
    setIsOpenDeleteVariety(!isOpenDeleteVariety);
  };
  const toggleModalEditVariety = () => {
    setIsOpenEditVariety(!isOpenEditVariety);
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
      setSelectedTextColor(data?.data?.data?.textColour);
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
        toggleModalEditVariety,
        imageReference,
        setImageReference,
        backgroundColor,
        loginDetails,
        setLoginDetails,
        setBackgroundColor,
        selectedTextColor,
        expireTime,
        setExpireTime,
        setSelectedTextColor,
        isOpenEditVariety,
        setIsOpenEditVariety,
        isSelectedPreview,
        setIsSelectedPreview,
        businessProfileNavigate,
        setBusinessProfileNavigate,
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
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        tableStatus,
        setTableStatus,
        menuIdTable,
        setMenuIdTable,
        currentMenuItems,
        setCurrentMenuItems,
        currentCategory,
        setCurrentCategory,
        currentSection,
        setCurrentSection,
        currentSearchQuery,
        setCurrentSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
// make sure use
export const useGlobalContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within an AppProvider');
  }
  return context;
};

export { AppContext, AppProvider };
