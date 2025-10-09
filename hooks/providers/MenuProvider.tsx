'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { getMenuConfiguration } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';

interface MenuContextType {
  // Menu preview settings
  activeTile: string;
  setActiveTile: (tile: string) => void;
  handleListItemClick: (column: string) => void;
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
  fetchMenuConfig: () => Promise<void>;

  // Current menu state
  currentMenuItems: any[] | null;
  setCurrentMenuItems: (items: any[] | null) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  currentSearchQuery: string;
  setCurrentSearchQuery: (query: string) => void;

  // Menu modals
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
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

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

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  // Preview settings
  const [isSelectedPreview, setIsSelectedPreview] = useState(true);
  const [activeTile, setActiveTile] = useState<string>('List left');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [imageReference, setImageReference] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000');

  // Menu modals
  const [menuIdTable, setMenuIdTable] = useState('');
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDeleteVariety, setIsOpenDeleteVariety] = useState(false);
  const [isOpenEditVariety, setIsOpenEditVariety] = useState(false);

  // Current menu state - Initialize from sessionStorage
  const getInitialMenuState = useCallback(() => {
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
  }, []);

  const initialState = useMemo(() => getInitialMenuState(), [getInitialMenuState]);
  const [currentMenuItems, setCurrentMenuItems] = useState<any[] | null>(initialState.items);
  const [currentCategory, setCurrentCategory] = useState<string>(initialState.category);
  const [currentSection, setCurrentSection] = useState<string>(initialState.section);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>(initialState.searchQuery);

  // Memoized callbacks
  const toggleModalDelete = useCallback(() => {
    setIsOpenDelete(prev => !prev);
  }, []);

  const toggleModalEdit = useCallback(() => {
    setIsOpenEdit(prev => !prev);
  }, []);

  const toggleModalDeleteVariety = useCallback(() => {
    setIsOpenDeleteVariety(prev => !prev);
  }, []);

  const toggleModalEditVariety = useCallback(() => {
    setIsOpenEditVariety(prev => !prev);
  }, []);

  const handleListItemClick = useCallback((column: string) => {
    setActiveTile(column);
  }, []);

  const fetchMenuConfig = useCallback(async () => {
    if (!businessInformation?.[0]?.businessId) return;

    try {
      const data = await getMenuConfiguration(businessInformation[0].businessId);

      console.log("MenuProvider - fetchMenuConfig response:", data?.data?.data);

      if (data?.data?.isSuccessful) {
        setActiveTile(convertActiveTile(data?.data?.data?.layout));

        // Handle image from API
        const imageData = data?.data?.data?.image;
        const imageRef = data?.data?.data?.imageRef;

        console.log("MenuProvider - imageData:", imageData);
        console.log("MenuProvider - imageRef:", imageRef);

        if (imageData && imageData !== 'undefined' && imageData !== 'null') {
          // If image data exists and is not already a complete URL or blob
          if (imageData.startsWith('http') || imageData.startsWith('blob:') || imageData.startsWith('data:')) {
            setSelectedImage(imageData);
          } else {
            // Assume it's base64 without prefix, add the prefix
            setSelectedImage(`data:image/jpeg;base64,${imageData}`);
          }
        } else if (imageRef && imageRef.startsWith('http')) {
          setSelectedImage(imageRef);
        } else {
          setSelectedImage('');
        }

        setBackgroundColor(data?.data?.data?.backgroundColour || '');
        setSelectedTextColor(data?.data?.data?.textColour || '#000');
        const finalImageRef = data?.data?.data?.imageRef || '';
        console.log("MenuProvider - setting imageReference to:", finalImageRef);
        setImageReference(finalImageRef);
        setIsSelectedPreview(data?.data?.data?.useBackground || false);
      }
    } catch (error) {
      console.error('Error fetching menu config:', error);
    }
  }, [businessInformation]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    activeTile,
    setActiveTile,
    handleListItemClick,
    isSelectedPreview,
    setIsSelectedPreview,
    selectedImage,
    setSelectedImage,
    backgroundColor,
    setBackgroundColor,
    imageReference,
    setImageReference,
    selectedTextColor,
    setSelectedTextColor,
    fetchMenuConfig,
    currentMenuItems,
    setCurrentMenuItems,
    currentCategory,
    setCurrentCategory,
    currentSection,
    setCurrentSection,
    currentSearchQuery,
    setCurrentSearchQuery,
    menuIdTable,
    setMenuIdTable,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDeleteVariety,
    setIsOpenDeleteVariety,
    isOpenEditVariety,
    setIsOpenEditVariety,
    toggleModalDelete,
    toggleModalEdit,
    toggleModalDeleteVariety,
    toggleModalEditVariety,
  }), [
    activeTile,
    handleListItemClick,
    isSelectedPreview,
    selectedImage,
    backgroundColor,
    imageReference,
    selectedTextColor,
    fetchMenuConfig,
    currentMenuItems,
    currentCategory,
    currentSection,
    currentSearchQuery,
    menuIdTable,
    isOpenDelete,
    isOpenEdit,
    isOpenDeleteVariety,
    isOpenEditVariety,
    toggleModalDelete,
    toggleModalEdit,
    toggleModalDeleteVariety,
    toggleModalEditVariety,
  ]);

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};