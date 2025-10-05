"use client";
import { getOrder } from "@/app/api/controllers/dashboard/orders";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import useMenuCategories from "@/hooks/cachedEndpoints/useMenuCategories";
import { useGlobalContext } from "@/hooks/globalProvider";
import {
  clearItemLocalStorage,
  formatPrice,
  getJsonItemFromLocalStorage,
} from "@/lib/utils";
import {
  Button,
  Divider,
  Spacer,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from 'react-hot-toast';
import { FaMinus, FaPlus } from "react-icons/fa6";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import noMenu from "../../../../../public/assets/images/no-menu.png";
import CheckoutModal from "./checkoutModal";
import {
  SelectedSkeletonLoading,
} from "./data";
import ViewModal from "./view";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import OrderCategoryTabs from "./OrderCategoryTabs";
import OrderMenuToolbar from "./OrderMenuToolbar";
import OrderItemsGrid from "./OrderItemsGrid";
import CustomPagination from "../../settings/BillingsComponents/CustomPagination";
import { getMenuItems } from "@/app/api/controllers/dashboard/menu";

type Item = {
  id: string;
  itemID: string;
  itemName: string;
  menuName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image: string;
  isVariety: boolean;
  varieties: null | any;
  count: number;
  packingCost: number;
  isPacked?: boolean;
};


// Global cache for order menu items
const globalOrderItemsCache = new Map<string, { 
  items: any[], 
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number 
}>();
const GLOBAL_CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

// Cache validation helper
const validateCacheData = (cached: any): boolean => {
  if (!cached || typeof cached !== 'object') return false;
  if (!Array.isArray(cached.items)) return false;
  if (typeof cached.timestamp !== 'number') return false;
  if (typeof cached.totalPages !== 'number') return false;
  if (typeof cached.totalItems !== 'number') return false;
  
  // Validate each item has required fields
  return cached.items.every((item: any) => 
    item && 
    typeof item === 'object' && 
    typeof item.id === 'string' && 
    typeof item.itemName === 'string' &&
    typeof item.price === 'number'
  );
};

// Retry helper with exponential backoff
const retryWithBackoff = async (
  fn: () => Promise<any>, 
  maxRetries: number = 3, 
  baseDelay: number = 1000
): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const MenuList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    setCurrentMenuItems,
    setCurrentCategory,
    setCurrentSection
  } = useGlobalContext();

  const [order] = useState<any>(getJsonItemFromLocalStorage("order"));
  const { data: categoriesData, isLoading: loadingCategories } = useMenuCategories();
  const [categories, setCategories] = useState<any[]>([]);
  
  // State management for hierarchy
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');
  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalItems] = useState(0);
  const pageSize = 11; // Match menu page pageSize
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [filterValue, setFilterValue] = React.useState("");

  // Transform categories data
  useEffect(() => {
    if (categoriesData) {
      const transformedCategories = categoriesData.map(category => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        orderIndex: category.orderIndex,
        menus: category.menus || []
      }));
      setCategories(transformedCategories);
    }
  }, [categoriesData]);

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    
    return menuItems.filter(item =>
      item?.itemName?.toLowerCase().includes(filterValue.toLowerCase()) ||
      String(item?.price)?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item?.menuName?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item?.itemDescription?.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [menuItems, filterValue]);

  // Initialize categories and sections
  useEffect(() => {
    if (categories && categories.length > 0 && !hasInitialized) {
      // Clear any previous error state on initialization
      
      const firstCategory = categories[0];
      setActiveCategory(firstCategory.categoryId);
      
      // Set menu sections for first category
      const allMenuSections = firstCategory.menus.flatMap((menu: any) => 
        menu.menuSections || []
      );
      setMenuSections(allMenuSections);
      
      // Set first section as active and handle loading
      if (allMenuSections.length > 0) {
        const firstSection = allMenuSections[0];
        setActiveSubCategory(firstSection.id);
        
        // Check if this is the very first load
        if (!hasInitialLoadCompleted && firstSection.totalCount > 0) {
          // Prevent concurrent loading
          if (isLoadingSection) return;
          setIsLoadingSection(true);
          
          // Check cache first for immediate display
          const cacheKey = `${firstSection.id}_page_1`;
          const cached = globalOrderItemsCache.get(cacheKey);
          
          if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME) && validateCacheData(cached)) {
            // Use cache if available and valid
            setMenuItems(cached.items);
            setTotalPages(cached.totalPages);
            setTotalItems(cached.totalItems);
            setCurrentPage(cached.currentPage);
            setCurrentMenuItems(cached.items);
            setHasInitialLoadCompleted(true);
            setIsLoadingSection(false);
            // Cached data loaded successfully
          } else {
            // Priority load: fetch first item immediately, then rest in background
            fetchFirstItemPriority(firstSection.id).then(prioritySuccess => {
              if (prioritySuccess) {
                fetchRemainingItemsBackground(firstSection.id, 1);
                
                // Background preload other sections after a delay
                setTimeout(() => {
                  preloadOtherSections(allMenuSections, firstSection.id);
                }, 1000);
              } else {
                // Fallback to regular loading
                console.warn('Priority loading failed, falling back to regular loading');
                fetchMenuItems(firstSection.id, 1);
              }
            }).catch(error => {
              console.error('Error in priority loading:', error);
              fetchMenuItems(firstSection.id, 1);
            });
            setIsLoadingSection(false);
          }
        } else if (firstSection.totalCount === 0) {
          // No items in section
          setMenuItems([]);
          setHasInitialLoadCompleted(true);
          // Not an error when section is empty
        }
      }
      
      setHasInitialized(true);
    }
  }, [categories, hasInitialized, hasInitialLoadCompleted]);

  // Note: Removed automatic loading on section change to prevent race conditions
  // All loading is now handled explicitly by handleCategorySelect and handleMenuSectionSelect

  const [loading, setLoading] = useState<Boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isOpenVariety, setIsOpenVariety] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<Item>();
  const [orderDetails, setOrderDetails] = useState([]);

  // Business information
  const businessInformation = getJsonItemFromLocalStorage('business');

  // Function to fetch first item with priority (for initial load only)
  const fetchFirstItemPriority = async (sectionId: string) => {
    if (!sectionId) return false;
    
    try {
      // Clear any previous errors
      // Fetch just the first item for immediate display with retry
      const response = await retryWithBackoff(
        () => getMenuItems(sectionId, 1, 1),
        2, // fewer retries for priority loading
        500 // faster retry for first item
      );
      if (response?.data?.isSuccessful) {
        const items = response.data.data.items || [];
        if (items.length > 0) {
          const firstItem = items[0];
          const transformedItem = {
            ...firstItem,
            id: firstItem.id || firstItem.itemID,
            itemID: firstItem.id || firstItem.itemID,
            isAvailable: firstItem.isAvailable !== false,
            count: 0,
            packingCost: firstItem.packingCost,
          };
          
          // Set first item immediately
          setMenuItems([transformedItem]);
          setCurrentMenuItems([transformedItem]);
          
          // Mark initial load as completed
          setHasInitialLoadCompleted(true);
          return true;
        }
      } else {
        console.warn('Priority loading: API response not successful');
        return false;
      }
    } catch (error) {
      console.error('Error fetching first item:', error);
      toast.error('Failed to load menu items');
      return false;
    }
    return false;
  };

  // Function to fetch remaining items in background
  const fetchRemainingItemsBackground = async (sectionId: string, page: number = 1) => {
    if (!sectionId) return;
    
    setTimeout(async () => {
      try {
        const response = await retryWithBackoff(
          () => getMenuItems(sectionId, page, pageSize),
          2, // fewer retries for background loading
          1000 // standard delay
        );
        if (response?.data?.isSuccessful) {
          const items = response.data.data.items || [];
          const transformedItems = items.map((item: any) => ({
            ...item,
            id: item.id || item.itemID,
            itemID: item.id || item.itemID,
            isAvailable: item.isAvailable !== false,
            count: 0,
            packingCost: item.packingCost,
          }));

          // Extract pagination metadata
          const pagination = response.data.data?.pagination;
          const totalPagesFromAPI = pagination?.totalPages || Math.ceil((response.data.data?.totalCount || items.length) / pageSize);
          const totalItemsFromAPI = pagination?.totalItems || response.data.data?.totalCount || items.length;

          const paginationData = {
            items: transformedItems,
            timestamp: Date.now(),
            totalPages: totalPagesFromAPI,
            totalItems: totalItemsFromAPI,
            currentPage: page
          };

          // Cache the results
          const cacheKey = `${sectionId}_page_${page}`;
          globalOrderItemsCache.set(cacheKey, paginationData);
          
          // Update all items
          setMenuItems(transformedItems);
          setTotalPages(paginationData.totalPages);
          setTotalItems(paginationData.totalItems);
          setCurrentPage(page);
          
          // Update global context
          setCurrentMenuItems(transformedItems);
          setLoadingItems(false);
          // Clear any previous errors
        } else {
          console.warn('Background loading: API response not successful');
          setLoadingItems(false);
          // Don't set error here as first item might have loaded successfully
        }
      } catch (error) {
        console.error('Error fetching remaining items:', error);
        setLoadingItems(false);
        // Only show toast if we don't have any items loaded
        if (!menuItems || menuItems.length === 0) {
          toast.error('Failed to load menu items');
        }
      }
    }, 100); // Small delay to ensure first item displays immediately
  };

  // Preload other sections in background
  const preloadOtherSections = async (sections: any[], currentSectionId: string) => {
    if (!sections || sections.length <= 1) return;
    
    // Filter out current section and empty sections
    const sectionsToPreload = sections.filter(s => s.id !== currentSectionId && s.totalCount > 0);
    
    // Stagger the preloading to avoid overwhelming the server
    sectionsToPreload.forEach((section, index) => {
      setTimeout(async () => {
        const cacheKey = `${section.id}_page_1`;
        const cached = globalOrderItemsCache.get(cacheKey);
        
        // Only preload if not already cached
        if (!cached || (Date.now() - cached.timestamp >= GLOBAL_CACHE_EXPIRY_TIME)) {
          try {
            const response = await getMenuItems(section.id, 1, pageSize);
            if (response?.data?.isSuccessful) {
              const items = response.data.data.items || [];
              const transformedItems = items.map((item: any) => ({
                ...item,
                id: item.id || item.itemID,
                itemID: item.id || item.itemID,
                isAvailable: item.isAvailable !== false,
                count: 0,
                packingCost: item.packingCost,
              }));

              const pagination = response.data.data?.pagination;
              const totalPagesFromAPI = pagination?.totalPages || Math.ceil((response.data.data?.totalCount || items.length) / pageSize);
              const totalItemsFromAPI = pagination?.totalItems || response.data.data?.totalCount || items.length;

              globalOrderItemsCache.set(cacheKey, {
                items: transformedItems,
                timestamp: Date.now(),
                totalPages: totalPagesFromAPI,
                totalItems: totalItemsFromAPI,
                currentPage: 1
              });
            }
          } catch (error) {
            console.error(`Error preloading section ${section.id}:`, error);
          }
        }
      }, (index + 1) * 500); // Stagger by 500ms
    });
  };

  // Fetch menu items for a section with comprehensive error handling
  const fetchMenuItems = async (sectionId: string, page: number = 1) => {
    if (!sectionId) {
      console.warn('fetchMenuItems: No sectionId provided');
      return;
    }

    const cacheKey = `${sectionId}_page_${page}`;
    
    // Check cache first with validation
    const cached = globalOrderItemsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME) && validateCacheData(cached)) {
      try {
        setMenuItems(cached.items);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
        setCurrentPage(cached.currentPage);
        setCurrentMenuItems(cached.items);
        // Clear any previous errors
        return;
      } catch (cacheError) {
        console.error('Error setting cached data:', cacheError);
        // Remove corrupted cache entry
        globalOrderItemsCache.delete(cacheKey);
      }
    } else if (cached && !validateCacheData(cached)) {
      console.warn('Invalid cache data detected, removing:', cacheKey);
      globalOrderItemsCache.delete(cacheKey); // Remove invalid cache
    }

    setLoadingItems(true);
    
    // Add timeout to prevent hanging requests  
    const timeoutId = setTimeout(() => {
      console.error('Request timeout for section:', sectionId);
      toast.error('Request timeout - Failed to load menu items');
      setLoadingItems(false);
    }, 15000); // 15 second timeout
    
    try {
      // Use retry logic with exponential backoff
      const response = await retryWithBackoff(
        () => getMenuItems(sectionId, page, pageSize),
        3, // max retries
        1000 // base delay in ms
      );
      clearTimeout(timeoutId);

      if (response?.data?.isSuccessful) {
        const items = response.data.data?.items || [];
        
        // Validate items data
        if (!Array.isArray(items)) {
          throw new Error('Invalid items data structure');
        }
        
        const transformedItems = items.map((item: any) => {
          // Validate required item properties
          if (!item || typeof item !== 'object') {
            console.warn('Invalid item data:', item);
            return null;
          }
          
          return {
            ...item,
            id: item.id || item.itemID || `temp_${Date.now()}`,
            itemID: item.id || item.itemID || `temp_${Date.now()}`,
            itemName: item.itemName || 'Unknown Item',
            isAvailable: item.isAvailable !== false,
            count: 0,
            packingCost: item.packingCost,
          };
        }).filter(Boolean); // Remove any null items

        // Extract pagination metadata
        const pagination = response.data.data?.pagination;
        const totalPagesFromAPI = pagination?.totalPages || Math.ceil((response.data.data?.totalCount || items.length) / pageSize);
        const totalItemsFromAPI = pagination?.totalItems || response.data.data?.totalCount || items.length;

        const paginationData = {
          items: transformedItems,
          timestamp: Date.now(),
          totalPages: totalPagesFromAPI,
          totalItems: totalItemsFromAPI,
          currentPage: page
        };

        // Cache the results
        globalOrderItemsCache.set(cacheKey, paginationData);
        
        setMenuItems(transformedItems);
        setTotalPages(paginationData.totalPages);
        setTotalItems(paginationData.totalItems);
        setCurrentPage(page);
        
        // Update global context
        setCurrentMenuItems(transformedItems);
      } else {
        console.error('API returned unsuccessful response:', response?.data);
        throw new Error(response?.data?.message || 'API request failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching menu items for section', sectionId, ':', error);
      
      // Don't set error if we have cached items to fall back to
      const fallbackCache = globalOrderItemsCache.get(cacheKey);
      if (fallbackCache && validateCacheData(fallbackCache)) {
        console.log('Using stale cache as fallback');
        setMenuItems(fallbackCache.items);
        setTotalPages(fallbackCache.totalPages);
        setTotalItems(fallbackCache.totalItems);
        setCurrentMenuItems(fallbackCache.items);
      } else {
        if (fallbackCache && !validateCacheData(fallbackCache)) {
          console.warn('Invalid fallback cache detected, removing:', cacheKey);
          globalOrderItemsCache.delete(cacheKey);
        }
        toast.error('Failed to load menu items');
        setMenuItems([]);
      }
    } finally {
      setLoadingItems(false);
    }
  };

  const getOrderDetails = async () => {
    setLoading(true);
    const response = await getOrder(order.id);

    setLoading(false);
    if (response?.data?.isSuccessful) {
      const updatedArray = response?.data?.data.orderDetails.map((item: any) => {
        const { unitPrice, quantity, itemID, ...rest } = item;
        
        return {
          ...rest,
          id: itemID,
          price: unitPrice,
          count: quantity,
          packingCost: item.packingCost,
        };
      });
      setOrderDetails(response?.data?.data);
      setSelectedItems(() => updatedArray);

      clearItemLocalStorage("order");
    } else if (response?.data?.error) {
    }
  };

  const toggleVarietyModal = (menu: any) => {
    setSelectedMenu(menu);
    setIsOpenVariety(!isOpenVariety);
  };

  // Category and section handlers
  const handleCategorySelect = async (categoryId: string) => {
    // Immediately clear error state when switching categories
    
    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set debounce timer to prevent rapid switches
    const newTimer = setTimeout(async () => {
      setActiveCategory(categoryId);
      setCurrentPage(1);
      
      // Find selected category and set its menu sections
      const selectedCategory = categories.find(cat => cat.categoryId === categoryId);
      
      if (selectedCategory) {
        const allMenuSections = selectedCategory.menus.flatMap((menu: any) => 
          menu.menuSections || []
        );
        setMenuSections(allMenuSections);
        
        // Auto-select first section
        if (allMenuSections.length > 0) {
          setActiveSubCategory(allMenuSections[0].id);
          
          // Check cache first like menu page
          const cacheKey = `${allMenuSections[0].id}_page_1`;
          const cached = globalOrderItemsCache.get(cacheKey);
          if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME) && validateCacheData(cached)) {
            setMenuItems(cached.items);
            setTotalPages(cached.totalPages);
            setTotalItems(cached.totalItems);
            setCurrentPage(1);
          } else if (cached && !validateCacheData(cached)) {
            console.warn('Invalid cache data detected in category select, removing:', cacheKey);
            globalOrderItemsCache.delete(cacheKey);
          } else {
            // Show loading state but keep previous items visible
            setLoadingItems(true);
            try {
              await fetchMenuItems(allMenuSections[0].id, 1);
            } catch (error) {
              console.error('Error in category select:', error);
              toast.error('Failed to load menu items');
            }
          }
        } else {
          setMenuItems([]);
          setActiveSubCategory('');
          setTotalPages(1);
          setTotalItems(0);
          // Clear any previous errors // Not an error, just empty
        }
        
        // Update global context
        setCurrentCategory(selectedCategory.categoryName);
      } else {
        toast.error('Failed to load category data');
      }
      
      // Clear the timer reference
      setDebounceTimer(null);
    }, 300); // 300ms debounce delay
    
    setDebounceTimer(newTimer);
  };

  const handleMenuSectionSelect = async (sectionId: string) => {
    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set debounce timer to prevent rapid section switches
    const newTimer = setTimeout(async () => {
      setActiveSubCategory(sectionId);
      setCurrentPage(1); // Always reset to page 1 when switching sections
      // Clear any previous errors // Clear any previous errors
      
      // Check cache first for page 1
      const cacheKey = `${sectionId}_page_1`;
      const cached = globalOrderItemsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME) && validateCacheData(cached)) {
        setMenuItems(cached.items);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
      } else if (cached && !validateCacheData(cached)) {
        console.warn('Invalid cache data detected in section select, removing:', cacheKey);
        globalOrderItemsCache.delete(cacheKey);
      } else {
        // Show loading state but keep previous items visible
        const section = menuSections.find(s => s.id === sectionId);
        if (section && section.totalCount > 0) {
          setLoadingItems(true);
          try {
            await fetchMenuItems(sectionId, 1);
          } catch (error) {
            console.error('Error in section select:', error);
            toast.error('Failed to load menu section');
          }
        } else {
          setMenuItems([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      }
      
      // Update global context
      const selectedSection = menuSections.find(section => section.id === sectionId);
      if (selectedSection) {
        setCurrentSection(selectedSection.name);
      }
      
      // Clear the timer reference
      setDebounceTimer(null);
    }, 200); // 200ms debounce delay (slightly faster than category)
    
    setDebounceTimer(newTimer);
  };


  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeSubCategory) {
      fetchMenuItems(activeSubCategory, page);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleCardClick = useCallback((menuItem: Item, isItemPacked: boolean) => {
    setSelectedItems((prevItems: any) => {
      const existingItem = prevItems.find((item: any) => item.id === menuItem.id);
      
      if (existingItem) {
        // Remove item if it exists
        return prevItems.filter((item: any) => item.id !== menuItem.id);
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            ...menuItem,
            count: 1,
            isPacked: isItemPacked,
            packingCost: menuItem.packingCost,
          },
        ];
      }
    });
  }, []);


  const handleDecrement = useCallback((id: string) => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setIsUpdating(true);
    
    setSelectedItems((prevItems: any) => {
      // Filter out items with count <= 1 first, then decrement others
      const updatedItems = prevItems
        .filter((item: any) => !(item.id === id && item.count <= 1))
        .map((item: any) => 
          item.id === id 
            ? { ...item, count: Math.max(1, item.count - 1) }
            : item
        );
      
      // Use setTimeout to allow state to settle
      setTimeout(() => setIsUpdating(false), 100);
      return updatedItems;
    });
  }, [isUpdating]);

  const handleIncrement = useCallback((id: string) => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setIsUpdating(true);
    
    setSelectedItems((prevItems) => {
      // Check if item exists in selected items
      const existingItem = prevItems.find(item => item.id === id);
      
      if (existingItem) {
        // Increment existing item
        const updatedItems = prevItems.map((item) =>
          item.id === id ? { ...item, count: Math.min(item.count + 1, 999) } : item
        );
        setTimeout(() => setIsUpdating(false), 100);
        return updatedItems;
      } else {
        // Add new item from menuItems
        const menuItem = menuItems?.find(item => item.id === id);
        if (menuItem) {
          const newItem = {
            ...menuItem,
            count: 1,
            isPacked: false,
            packingCost: menuItem.packingCost 
          };
          setTimeout(() => setIsUpdating(false), 100);
          return [...prevItems, newItem];
        }
        setTimeout(() => setIsUpdating(false), 100);
        return prevItems;
      }
    });
  }, [isUpdating, menuItems]);

  const calculateTotalPrice = () => {
    return selectedItems.reduce((acc, item) => {
      const itemTotal = item.price * item.count;
      // Allow packing even when packingCost is 0 or undefined
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      return acc + itemTotal + packingTotal;
    }, 0);
  };

  useEffect(() => {
    // Check if we're in add-items mode (coming from UpdateOrderModal)
    const isAddItemsMode = searchParams.get('mode') === 'add-items';

    if (isAddItemsMode && order?.id && categories && categories.length > 0) {
      // Only load order details if explicitly adding items to an existing order
      getOrderDetails();
    } else if (!isAddItemsMode && order?.id) {
      // Clear the order from localStorage if we're not in add-items mode
      // This prevents accidental prefilling when creating a new order
      clearItemLocalStorage("order");
    }
  }, [order?.id, categories, searchParams]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handlePackingCost = useCallback((itemId: string, isPacked: boolean) => {
    if (isUpdating) return; // Prevent concurrent updates

    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          // Find the menu item to get the correct packingCost
          const menuItem = menuItems?.find((menu: Item) => menu.id === itemId);
          return {
            ...item,
            isPacked,
            // Use menuItem's packingCost if available, otherwise keep existing
            packingCost: menuItem?.packingCost ?? item.packingCost
          };
        }
        return item;
      })
    );
  }, [isUpdating, menuItems]);

  const handleOpenCheckoutModal = useCallback(() => {
    if (isUpdating) return; // Prevent concurrent updates

    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        const menuItem = menuItems?.find(
          (menu: Item) => menu.id === item.id
        );
        // Always sync packingCost from menu data to ensure accuracy
        return {
          ...item,
          packingCost: menuItem?.packingCost ?? item.packingCost,
        };
      })
    );
    onOpen();
  }, [isUpdating, menuItems, onOpen]);

  return (
    <>
      <div className="flex flex-row flex-wrap  justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.back()}
              className="text-grey600 p-0 m-0 border-none outline-none flex items-center gap-2 text-sm"
            >
              <IoIosArrowRoundBack className="text-[22px]" />
              <p>Go back</p>
            </button>
          </div>
          <div className="text-[24px] leading-8 font-semibold">
            <span>Create Orders</span>
          </div>
          <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
            Showing all orders
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div>
            <CustomInput
              classnames={"w-[242px]"}
              label=""
              size="md"
              value={filterValue}
              onChange={(e: any) => {
                const value = e.target.value;
                if (value) {
                  setFilterValue(value);
                  setCurrentPage(1);
                } else {
                  setFilterValue("");
                }
              }}
              isRequired={false}
              startContent={<IoSearchOutline />}
              type="text"
              placeholder="Search here..."
            />
          </div>
          <CustomButton
            onClick={selectedItems.length > 0 ? handleOpenCheckoutModal : {}}
            className="py-2 px-4 mb-0 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-2 items-center justify-center">
              <p>{"Proceed"} </p>
              <HiArrowLongLeft className="text-[22px] rotate-180" />
            </div>
          </CustomButton>
        </div>
      </div>

      <section className="flex flex-col xl:flex-row gap-6">
          <div className="w-full">
             {/* Category Tabs */}
        <OrderCategoryTabs
          loadingCategories={loadingCategories}
          categories={categories}
          activeCategory={activeCategory}
          handleCategorySelect={handleCategorySelect}
        />
        
        {/* Menu Sections Toolbar - only show if we have sections */}
        {menuSections.length > 0 && (
          <OrderMenuToolbar
            menuSections={menuSections}
            activeSubCategory={activeSubCategory}
            handleMenuSectionSelect={handleMenuSectionSelect}
          />
        )}
        <div className="flex gap-3">
          <div className="w-full">
            {/* Items Grid */}
            <OrderItemsGrid
              loadingItems={loadingItems}
              loadingCategories={loadingCategories}
              menuItems={filteredItems}
              selectedItems={selectedItems}
              onItemClick={toggleVarietyModal}
              onIncrement={handleIncrement}
              handleCardClick={handleCardClick}
              searchQuery={filterValue}
            />

            {/* Pagination */}
            {!loadingItems && totalPages > 1 && (
              <div className="px-6 pb-6">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </div>
            )}
          </div>
        </div>
          </div>
          <article className="hidden xl:grid xl:flex-col p-4 rounded-lg w-[600px] h-full">
            {selectedItems.length > 0 ? (
              <>
                {/* Business Name Header */}
                <div className="mb-4">
                  <h1 className="text-lg text-center font-[700] text-gray-800">
                    {businessInformation[0]?.businessName || 'Business Name'}
                  </h1>
                </div>
                
                {/* Cart Items - Scrollable */}
                <div className="flex-1 h-[60vh] overflow-y-auto">
                   <div className="flex justify-between items-center ">
                    <div className="">Order Item</div>
                       <h2 className="font-[600] mb-2">
                    {selectedItems.reduce((total, item) => total + item.count, 0)} {selectedItems.reduce((total, item) => total + item.count, 0) !== 1 ? '' : ''} 
                  </h2>
                   </div>
                <div className="rounded-lg ">
                  {selectedItems?.map((item, index) => {
                    return (
                      <React.Fragment key={item.id}>
                        <div
                          className="flex py-3 justify-between items-center cursor-pointer"
                          onDoubleClick={() => handleCardClick(item, item.isPacked || false)}
                        >
                          <div className=" rounded-lg w-28 text-black  flex">
                            {/* <div>
                              <Image
                                src={
                                  item?.image
                                    ? `data:image/jpeg;base64,${item?.image}`
                                    : noImage
                                }
                                width={20}
                                height={20}
                                className="object-cover rounded-lg w-20 h-20"
                                aria-label="uploaded image"
                                alt="uploaded image(s)"
                              />
                            </div> */}
                            <div className="ml-3 flex flex-col text-sm justify-center">
                              <p className="font-[500] text-base text-[#344054]">{item.itemName}</p>
                              <Spacer y={1} />
                              <p className="text-[#475367] text-sm ">{item.menuName}</p>

                             
                            </div>
                          </div>
                          <div className="flex w-24 items-center">
                            <Button
                              onPress={() => handleDecrement(item.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="faded"
                              className="border border-[#EFEFEF]"
                              aria-label="minus"
                              isDisabled={isUpdating}
                            >
                              <FaMinus />
                            </Button>
                            <span className="font-bold py-2 px-4">
                              {item.count}
                            </span>
                            <Button
                              onPress={() => handleIncrement(item.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="faded"
                              className="border border-[#EFEFEF]"
                              aria-label="plus"
                              isDisabled={isUpdating}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                           <p className=" font-medium text-sm text-[#344054]">
                                {formatPrice(item?.price * item.count)}
                              </p>
                        </div>
                        {index !== selectedItems?.length - 1 && (
                          <Divider className="bg-[#E4E7EC80]" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                </div>
                
                {/* Sticky Pricing Section */}
                <div className="sticky bottom-0 pb-4 bg-white   pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[13px] font-[500]">Subtotal</h3>
                      <p className="text-[14px] font-[600]">
                        {formatPrice(calculateTotalPrice())}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-[13px] font-[500] text-gray-600">VAT (7.5%)</h3>
                      <p className="text-[14px] font-[500] text-gray-600">
                        {formatPrice(calculateTotalPrice() * 0.075)}
                      </p>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between flex-col items-center">
                      <h3 className="text-[14px] font-[600]">Total</h3>
                      <p className="text-[16px] font-[700] text-primaryColor">
                        {formatPrice(calculateTotalPrice() * 1.075)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {loading ? (
                  <SelectedSkeletonLoading />
                ) : (
                  <div className="flex flex-col h-[60vh] rounded-xl justify-center items-center">
                     <div className="flex flex-col justify-center items-center">
                               <Image
                      className="w-[50px] h-[50px]"
                      src={noMenu}
                      alt="no menu illustration"
                    />
                    <Spacer y={3} />
                    <p className="text-sm =">
                      Selected menu(s) will appear here
                    </p>
                     </div>
                  </div>
                )}
              </>
            )}
          </article>
        <CheckoutModal
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          selectedItems={selectedItems}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          id={order?.id}
          orderDetails={orderDetails}
          handlePackingCost={handlePackingCost}
        />
        <ViewModal
          handleCardClick={handleCardClick}
          selectedMenu={selectedMenu}
          isOpenVariety={isOpenVariety}
          toggleVarietyModal={toggleVarietyModal}
          selectedItems={selectedItems}
          handlePackingCost={handlePackingCost}
        />
      </section>
    </>
  );
};

export default MenuList;