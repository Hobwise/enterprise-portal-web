'use client';
import { getCustomerMenuItems } from '@/app/api/controllers/customerOrder';
import { useInfiniteQuery } from '@tanstack/react-query';

interface MenuItem {
  menuID: string;
  menuName: string;
  itemName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image: string;
  varieties: null | any;
  waitingTimeMinutes?: number;
}

interface MenuItemsResponse {
  items: MenuItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
}

const useCustomerMenuItems = (
  menuId: string,
  searchTerm: string = "",
  pageSize: number = 10
) => {
  const fetchMenuItems = async ({ pageParam = 1 }) => {
    if (!menuId) {
      return {
        items: [],
        totalCount: 0,
        currentPage: 1,
        pageSize,
        hasNextPage: false,
      };
    }

    const responseData = await getCustomerMenuItems(menuId, pageParam, pageSize, searchTerm);

    // The API returns data.items
    const items = responseData?.data?.items || [];
    const totalCount = responseData?.data?.totalCount || 0;
    const currentPage = pageParam;
    const hasNextPage = items.length === pageSize && (currentPage * pageSize) < totalCount;

    return {
      items: items as MenuItem[],
      totalCount,
      currentPage,
      pageSize,
      hasNextPage,
    };
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MenuItemsResponse>({
    queryKey: ['customerMenuItems', menuId, searchTerm, pageSize],
    queryFn: fetchMenuItems,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
    enabled: !!menuId,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allItems = data?.pages.flatMap(page => page.items) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  return {
    data: allItems,
    totalCount,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useCustomerMenuItems;
