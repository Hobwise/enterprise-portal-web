'use client';
import { getMenuCategories, getMenuItems } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery } from "react-query";
import { useGlobalContext } from "../globalProvider";
import { fetchQueryConfig } from "@/lib/queryConfig";

type MenuCategory = {
  name: string;
  id: string;
  packingCost: number;
  waitingTimeMinutes: number;
  totalCount: number;
};

type MenuItem = {
  id: string;
  menuID: string;
  packingCost: number;
  price: number;
  image: string;
  imageReference: string;
  varieties: null | any;
  menuName: string;
  itemName: string;
  itemDescription: string;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
};

type MenuItemsResponse = {
  items: MenuItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type MenuData = {
  name: string;
  id: string;
  packingCost: number;
  waitingTimeMinutes: number;
  items: MenuItem[];
  totalCount: number;
};

const useMenu = (businessIdOutsideApp?: any, cooperateID?: any) => {
  const { page, rowsPerPage, menuIdTable } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation
    ? businessInformation[0]?.businessId
    : businessIdOutsideApp;

  const getAllMenus = async (context: { queryKey: readonly unknown[] }) => {
    const [_key, params] = context.queryKey;
    const { page, rowsPerPage, menuIdTable } = params as { page: number; rowsPerPage: number; menuIdTable?: string };
    
    try {
      const categoriesResponse = await getMenuCategories(businessId, cooperateID);
      
      if (!categoriesResponse?.data?.data?.menuCategories) {
        return [];
      }
      
      const categories: MenuCategory[] = categoriesResponse.data.data.menuCategories;
      
      if (categories.length === 0) {
        return [];
      }

      // Create menu data array with categories
      const menuData: MenuData[] = categories.map((category) => ({
        name: category.name,
        id: category.id,
        packingCost: category.packingCost,
        waitingTimeMinutes: category.waitingTimeMinutes,
        items: [], // Initially empty for all categories
        totalCount: category.totalCount ?? 0
      }));

      // Only fetch items for the first category initially, or for the selected category
      const targetCategoryId = menuIdTable || categories[0]?.id;
      
      if (targetCategoryId) {
        const targetCategoryIndex = menuData.findIndex(menu => menu.id === targetCategoryId);
        
        if (targetCategoryIndex !== -1) {
          const itemsResponse = await getMenuItems(targetCategoryId, page, rowsPerPage);
          
          if (itemsResponse?.data?.data?.items) {
            const itemsData: MenuItemsResponse = itemsResponse.data.data;
            menuData[targetCategoryIndex].items = itemsData.items ?? [];
          }
        }
      }

      return menuData;
    } catch (error) {
      console.error('Error fetching menu data:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuData[]>(
    ["menus", { page, rowsPerPage, menuIdTable }],
    getAllMenus,
    {
      ...fetchQueryConfig(),
      retry: 1
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useMenu;