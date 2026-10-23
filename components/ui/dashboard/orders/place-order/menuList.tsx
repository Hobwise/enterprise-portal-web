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
import { getQueuedItem } from "@/lib/offlineQueue";
import { toQueuedOrderView } from "@/lib/queuedOrder";
import { isNetworkOnline } from "@/lib/connectivity";
import { PersistentCache } from "@/lib/persistentCache";
import useNetworkOnline from "@/hooks/useNetworkOnline";

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
  categoryId?: string;
  comment?: string;
};


// Order menu items grouped by section + page. Persisted so the sections a user
// already opened survive a reload and stay viewable offline.
type CachedOrderItems = {
  items: any[],
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number
};
const globalOrderItemsCache = new PersistentCache<CachedOrderItems>('order-items', {
  maxEntries: 60,
});
const GLOBAL_CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

// Helper to check if two item lists are equivalent (to prevent unnecessary re-renders / reloads)
const areItemsEqual = (a: any[], b: any[]): boolean => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i];
    const itemB = b[i];
    if (!itemA || !itemB) return false;
    if (String(itemA.id || itemA.itemID) !== String(itemB.id || itemB.itemID)) return false;
    if (Number(itemA.price) !== Number(itemB.price)) return false;
    if (Boolean(itemA.isAvailable) !== Boolean(itemB.isAvailable)) return false;
    if (String(itemA.itemName || itemA.name || '') !== String(itemB.itemName || itemB.name || '')) return false;
    if (Number(itemA.packingCost || 0) !== Number(itemB.packingCost || 0)) return false;
  }
  return true;
};

// Cache validation helper
const validateCacheData = (cached: any): boolean => {
  if (!cached || typeof cached !== 'object') return false;
  if (!Array.isArray(cached.items)) return false;
  if (typeof cached.timestamp !== 'number') return false;
  
  // Validate each item has required structure safely without strict type rejections
  return cached.items.every((item: any) => 
    item && 
    typeof item === 'object' && 
    (item.id != null || item.itemID != null)
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

const PAGE_SIZE = 11;

// A cached page is usable while fresh — or at any age while offline, where
// items loaded earlier beat a request that cannot succeed.
const isCacheUsable = (cached: CachedOrderItems | undefined): boolean => {
  if (!cached) return false;
  if (!isNetworkOnline()) return true;
  return Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME;
};

// In-flight section/page loads, keyed `${sectionId}_page_${page}`.
//
// Preloading and a user's tab click can ask for the same page at the same
// moment. Without this, that is two identical network requests; with it, the
// click simply awaits the preload that is already on the wire.
const inFlightSectionRequests = new Map<string, Promise<CachedOrderItems | null>>();

const buildCachedOrderItems = (response: any, page: number): CachedOrderItems | null => {
  const rawItems = response?.data?.data?.items ?? 
    (Array.isArray(response?.data?.data) ? response.data.data : 
    (Array.isArray(response?.data?.items) ? response.data.items : null));

  if (!response?.data?.isSuccessful || !Array.isArray(rawItems)) return null;

  const transformedItems = rawItems.map((item: any) => {
    const rawId = item.id || item.itemID || '';
    const idStr = String(rawId);
    const parsedPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const parsedPacking = typeof item.packingCost === 'number' ? item.packingCost : parseFloat(item.packingCost) || 0;

    // Safeguard localStorage from massive base64 payloads (> 25KB)
    let image = item.image || '';
    if (typeof image === 'string' && image.length > 25000 && !image.startsWith('http')) {
      image = '';
    }

    return {
      ...item,
      id: idStr,
      itemID: idStr,
      itemName: item.itemName || item.name || '',
      price: parsedPrice,
      isAvailable: item.isAvailable !== false,
      count: 0,
      packingCost: parsedPacking,
      image,
    };
  });

  const pagination = response.data.data?.pagination;
  return {
    items: transformedItems,
    timestamp: Date.now(),
    totalPages: pagination?.totalPages || Math.ceil((response.data.data?.totalCount || rawItems.length) / PAGE_SIZE),
    totalItems: pagination?.totalItems || response.data.data?.totalCount || rawItems.length,
    currentPage: page,
  };
};

/**
 * Loads one section page, reusing the cache and any in-flight request.
 *
 * This is the single network entry point for section items so preloading, the
 * background page fill and a user's tab click can never race into duplicate
 * requests for the same page.
 *
 * @returns the cached/fetched page, or `null` when it could not be loaded.
 */
const loadSectionPage = (
  sectionId: string,
  page: number,
  options?: { maxRetries?: number; baseDelay?: number }
): Promise<CachedOrderItems | null> => {
  const cacheKey = `${sectionId}_page_${page}`;

  const cached = globalOrderItemsCache.get(cacheKey);
  if (cached && isCacheUsable(cached) && validateCacheData(cached)) {
    return Promise.resolve(cached);
  }

  const existing = inFlightSectionRequests.get(cacheKey);
  if (existing) return existing;

  const task = (async () => {
    if (!isNetworkOnline()) return null;
    try {
      const response = await retryWithBackoff(
        () => getMenuItems(sectionId, page, PAGE_SIZE),
        options?.maxRetries ?? 2,
        options?.baseDelay ?? 800
      );
      const built = buildCachedOrderItems(response, page);
      if (built) globalOrderItemsCache.set(cacheKey, built);
      return built;
    } catch (error) {
      console.error('Error loading menu items for section', sectionId, ':', error);
      return null;
    } finally {
      inFlightSectionRequests.delete(cacheKey);
    }
  })();

  inFlightSectionRequests.set(cacheKey, task);
  return task;
};

// Runs async tasks with a bounded number in flight, preserving order of results.
const runWithConcurrency = async <T,>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> => {
  const results: T[] = new Array(tasks.length);
  let next = 0;

  const workers = Array.from({ length: Math.max(1, Math.min(limit, tasks.length)) }, async () => {
    while (next < tasks.length) {
      const index = next++;
      try {
        results[index] = await tasks[index]();
      } catch {
        // loadSectionPage already swallows errors; guard anyway.
      }
    }
  });

  await Promise.all(workers);
  return results;
};

const MenuList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // `add-items` mode is reached from UpdateOrderModal. A queued order carries a
  // `queueId` instead of a server `orderId`, so it hydrates from the local queue.
  const addItemsMode = searchParams.get('mode') === 'add-items';
  const queueId = searchParams.get('queueId');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    setCurrentMenuItems,
    setCurrentCategory,
    setCurrentSection
  } = useGlobalContext();

  const [order, setOrder] = useState<any>(getJsonItemFromLocalStorage("order"));
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
  const pageSize = PAGE_SIZE;
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [filterValue, setFilterValue] = React.useState("");

  const isOnline = useNetworkOnline();

  // The section currently on screen. Kept in a ref so a background load that
  // finishes after the user has switched tabs cannot overwrite the new tab's
  // items with the old section's.
  const activeSubCategoryRef = React.useRef<string>('');
  // Monotonic token: only the newest user-initiated load may apply items, so a
  // slow earlier request can never clobber a faster later one.
  const latestLoadRef = React.useRef(0);

  const setActiveSubCategorySafe = (sectionId: string) => {
    activeSubCategoryRef.current = sectionId;
    setActiveSubCategory(sectionId);
  };

  // Transform categories data - preserve reference if categories haven't changed
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      setCategories(prev => {
        if (
          prev.length === categoriesData.length &&
          prev.every(
            (cat, i) =>
              cat.categoryId === categoriesData[i]?.categoryId &&
              cat.categoryName === categoriesData[i]?.categoryName
          )
        ) {
          return prev;
        }
        return categoriesData.map(category => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          orderIndex: category.orderIndex,
          preventOrderItemReduction: category.preventOrderItemReduction,
          menus: category.menus || []
        }));
      });
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
      const firstCategory = categories[0];
      setActiveCategory(firstCategory.categoryId);

      // Set menu sections for first category
      const allMenuSections = firstCategory.menus.flatMap((menu: any) =>
        menu.menuSections || []
      );
      setMenuSections(allMenuSections);

      // Every section across every category — preloading these (rather than
      // just the first category's) is what makes switching category/section
      // warm instead of a cold network round trip.
      const everySection = categories.flatMap((category: any) =>
        (category.menus || []).flatMap((menu: any) => menu.menuSections || [])
      );

      // Set first section as active and handle loading
      if (allMenuSections.length > 0) {
        const firstSection = allMenuSections[0];
        setActiveSubCategorySafe(firstSection.id);

        // Check if this is the very first load
        if (!hasInitialLoadCompleted) {
          // Check cache first for immediate display
          const cacheKey = `${firstSection.id}_page_1`;
          const cached = globalOrderItemsCache.get(cacheKey);

          if (cached && validateCacheData(cached)) {
            applySectionData(cached);
            setLoadingItems(false);
            setHasInitialLoadCompleted(true);
            preloadSections(everySection, firstSection.id);

            // Revalidate in background if online and stale
            if (isNetworkOnline() && !isCacheUsable(cached)) {
              loadSectionPage(firstSection.id, 1).then(fresh => {
                if (
                  fresh &&
                  !areItemsEqual(cached.items, fresh.items) &&
                  activeSubCategoryRef.current === firstSection.id
                ) {
                  applySectionData(fresh);
                }
              });
            }
          } else if (firstSection.totalCount === 0 && !isNetworkOnline()) {
            setMenuItems([]);
            setHasInitialLoadCompleted(true);
          } else {
            // Priority load: fetch first item immediately, then rest in background
            const loadId = ++latestLoadRef.current;
            setLoadingItems(true);
            fetchFirstItemPriority(firstSection.id).then(prioritySuccess => {
              if (latestLoadRef.current === loadId) setLoadingItems(false);
              if (prioritySuccess) {
                fetchRemainingItemsBackground(firstSection.id, 1);
              } else {
                // Fallback to regular loading
                console.warn('Priority loading failed, falling back to regular loading');
                fetchMenuItems(firstSection.id, 1);
              }
              // Warm every section's first page so tabs open instantly.
              preloadSections(everySection, firstSection.id);
            }).catch(error => {
              console.error('Error in priority loading:', error);
              fetchMenuItems(firstSection.id, 1);
            });
          }
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
  // A single order object (customer, table, surcharge), or null for a new order.
  // Typed `any` because the API returns an open-ended shape; `never[]` was the
  // old inference and made resetting it to null impossible.
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Business and user information
  const businessInformation = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  // Function to fetch first item with priority (for initial load only)
  const fetchFirstItemPriority = async (sectionId: string) => {
    if (!sectionId) return false;

    // Offline the request cannot succeed; let the caller fall back to cache.
    if (!isNetworkOnline()) return false;

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
          const rawId = firstItem.id || firstItem.itemID || '';
          const idStr = String(rawId);
          const parsedPrice = typeof firstItem.price === 'number' ? firstItem.price : parseFloat(firstItem.price) || 0;
          const parsedPacking = typeof firstItem.packingCost === 'number' ? firstItem.packingCost : parseFloat(firstItem.packingCost) || 0;
          const transformedItem = {
            ...firstItem,
            id: idStr,
            itemID: idStr,
            itemName: firstItem.itemName || firstItem.name || '',
            price: parsedPrice,
            isAvailable: firstItem.isAvailable !== false,
            count: 0,
            packingCost: parsedPacking,
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

    // Offline this can only fail; the priority fetch or cache already covers
    // what is on screen, so skip the doomed request.
    if (!isNetworkOnline()) {
      setLoadingItems(false);
      return;
    }

    const data = await loadSectionPage(sectionId, page, { maxRetries: 2, baseDelay: 1000 });
    setLoadingItems(false);

    if (!data) return;

    // The user may have switched tabs while this was in flight. Painting now
    // would replace the active tab's items with this old section's; skip it —
    // the result is already cached for when they come back.
    if (activeSubCategoryRef.current !== sectionId) return;

    applySectionData(data);
    setHasInitialLoadCompleted(true);
  };

  // Preload the given sections' first pages with bounded concurrency, so a tab
  // click is served from cache instead of starting a request. Previously this
  // was serialised with a 500ms stagger, which left later tabs cold for seconds.
  // `loadSectionPage` skips fresh cache entries and de-dupes in-flight requests,
  // so calling it here cannot duplicate work already in progress.
  const preloadSections = React.useCallback(
    (sections: any[], prioritySectionId?: string) => {
      if (!isNetworkOnline() || !sections?.length) return;

      const seen = new Set<string>();
      const ordered = sections
        .filter((s) => s?.id && !globalOrderItemsCache.has(`${s.id}_page_1`))
        .filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        })
        .sort((a, b) => {
          // Put the section the user is looking at (or about to) first.
          if (a.id === prioritySectionId) return -1;
          if (b.id === prioritySectionId) return 1;
          return 0;
        });

      if (ordered.length === 0) return;

      void runWithConcurrency(
        ordered.map((section) => () =>
          loadSectionPage(section.id, 1, { maxRetries: 1, baseDelay: 800 })
        ),
        4 // bounded so we don't flood the server on first paint
      );
    },
    []
  );

  // Preloading is skipped while offline (see preloadSections). When the
  // connection returns, warm whatever is still missing so sections that never
  // got prefetched catch up instead of staying empty.
  const wasOffline = React.useRef(false);
  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current || !hasInitialized) return;
    wasOffline.current = false;

    const missingSections = (menuSections || []).filter(
      (section: any) =>
        section?.id && !globalOrderItemsCache.has(`${section.id}_page_1`)
    );
    if (missingSections.length > 0) {
      preloadSections(missingSections, activeSubCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, hasInitialized, menuSections, activeSubCategory]);

  // Applies a loaded page to the visible list (and the global context).
  const applySectionData = React.useCallback((data: CachedOrderItems) => {
    setMenuItems(data.items);
    setTotalPages(data.totalPages);
    setTotalItems(data.totalItems);
    setCurrentPage(data.currentPage);
    setCurrentMenuItems(data.items);
  }, [setCurrentMenuItems]);

  // Fetch menu items for a section with comprehensive error handling
  const fetchMenuItems = async (sectionId: string, page: number = 1) => {
    if (!sectionId) {
      console.warn('fetchMenuItems: No sectionId provided');
      return;
    }

    const cacheKey = `${sectionId}_page_${page}`;

    // Check cache first with validation
    const cached = globalOrderItemsCache.get(cacheKey);
    const hasValidCache = !!(cached && validateCacheData(cached));

    if (hasValidCache) {
      applySectionData(cached);
      setLoadingItems(false);

      // If offline or fresh cache, no network fetch needed
      if (!isNetworkOnline() || isCacheUsable(cached)) {
        return;
      }
    } else if (cached && !validateCacheData(cached)) {
      console.warn('Invalid cache data detected, removing:', cacheKey);
      globalOrderItemsCache.delete(cacheKey); // Remove invalid cache
    }

    // Offline, don't fire a request that can only fail.
    if (!isNetworkOnline()) {
      if (hasValidCache) {
        applySectionData(cached);
      } else {
        toast.error("You're offline — menu items couldn't be loaded");
        setMenuItems([]);
      }
      setLoadingItems(false);
      return;
    }

    // Only show loading spinner if we don't have valid cached data already on screen
    if (!hasValidCache) {
      setLoadingItems(true);
    }

    const requestId = ++latestLoadRef.current;
    const data = await loadSectionPage(sectionId, page, { maxRetries: 2, baseDelay: 1000 });

    // A newer load was requested while this one was in flight — drop the result.
    if (latestLoadRef.current !== requestId) return;

    if (data) {
      if (activeSubCategoryRef.current === sectionId) {
        // If data didn't change, avoid re-rendering items
        if (!hasValidCache || !areItemsEqual(cached?.items || [], data.items)) {
          applySectionData(data);
        }
      }
    } else {
      // Don't error if we have cached items to fall back to
      const fallbackCache = globalOrderItemsCache.get(cacheKey);
      if (fallbackCache && validateCacheData(fallbackCache)) {
        applySectionData(fallbackCache);
      } else if (!hasValidCache) {
        toast.error('Failed to load menu items');
        setMenuItems([]);
      }
    }
    setLoadingItems(false);
  };

  const getOrderDetails = async () => {
    setLoading(true);
    const response = await getOrder(order.id);

    setLoading(false);
    if (response?.data?.isSuccessful) {
      const orderData = response?.data?.data;


      const updatedArray = orderData.orderDetails.map((item: any) => {
        const { unitPrice, quantity, itemID, ...rest } = item;

        return {
          ...rest,
          id: itemID,
          price: unitPrice,
          count: quantity,
          packingCost: item.packingCost,
        };
      });

      // Transform order data to ensure quickResponseID is populated
      // API may return qrReference instead of quickResponseID
      const transformedOrderData = {
        ...orderData,
        quickResponseID: orderData.quickResponseID || orderData.qrReference || order.qrReference,
        placedByName: orderData.placedByName || order.placedByName || '',
        placedByPhoneNumber: orderData.placedByPhoneNumber || order.placedByPhoneNumber || '',
      };

      console.log(transformedOrderData)

      setOrderDetails(transformedOrderData);
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
    const selectedCategory = categories.find(cat => cat.categoryId === categoryId);
    if (!selectedCategory) {
      toast.error('Failed to load category data');
      return;
    }

    const allMenuSections = selectedCategory.menus.flatMap((menu: any) =>
      menu.menuSections || []
    );

    const firstSection = allMenuSections[0];
    const firstSectionId = firstSection ? firstSection.id : '';

    // If already on this category and its first section items are already loaded, do not reload
    if (activeCategory === categoryId && activeSubCategory === firstSectionId && menuItems !== null && menuItems.length > 0) {
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }

    setActiveCategory(categoryId);
    setCurrentPage(1);
    setMenuSections(allMenuSections);
    setCurrentCategory(selectedCategory.categoryName);
    setActiveSubCategorySafe(firstSectionId);

    if (!firstSection) {
      setMenuItems([]);
      setTotalPages(1);
      setTotalItems(0);
      setLoadingItems(false);
      return;
    }

    // Warm remaining sections in this category
    preloadSections(allMenuSections, firstSection.id);

    // Check cache immediately for instant display without delay or loading spinner
    const cacheKey = `${firstSection.id}_page_1`;
    const cached = globalOrderItemsCache.get(cacheKey);
    if (cached && validateCacheData(cached)) {
      ++latestLoadRef.current;
      applySectionData(cached);
      setLoadingItems(false);

      // Revalidate in background if online and stale
      if (isNetworkOnline() && !isCacheUsable(cached)) {
        loadSectionPage(firstSection.id, 1).then(fresh => {
          if (
            fresh &&
            !areItemsEqual(cached.items, fresh.items) &&
            activeSubCategoryRef.current === firstSection.id
          ) {
            applySectionData(fresh);
          }
        });
      }
      return;
    }

    if (firstSection.totalCount === 0 && !isNetworkOnline()) {
      setMenuItems([]);
      setTotalPages(1);
      setTotalItems(0);
      setLoadingItems(false);
      return;
    }

    // Fall back to fetching if not yet cached
    await fetchMenuItems(firstSection.id, 1);
  };

  const handleMenuSectionSelect = async (sectionId: string) => {
    // If already on this section and items are already loaded, do not reload
    if (activeSubCategory === sectionId && currentPage === 1 && menuItems !== null && menuItems.length > 0) {
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }

    setActiveSubCategorySafe(sectionId);
    setCurrentPage(1); // Always reset to page 1 when switching sections

    const selectedSection = menuSections.find(section => section.id === sectionId);
    if (selectedSection) {
      setCurrentSection(selectedSection.name);
    }

    // Check cache immediately for instant display without delay or loading spinner
    const cacheKey = `${sectionId}_page_1`;
    const cached = globalOrderItemsCache.get(cacheKey);
    if (cached && validateCacheData(cached)) {
      ++latestLoadRef.current;
      applySectionData(cached);
      setLoadingItems(false);

      // Revalidate in background if online and stale
      if (isNetworkOnline() && !isCacheUsable(cached)) {
        loadSectionPage(sectionId, 1).then(fresh => {
          if (
            fresh &&
            !areItemsEqual(cached.items, fresh.items) &&
            activeSubCategoryRef.current === sectionId
          ) {
            applySectionData(fresh);
          }
        });
      }
      return;
    }

    if ((!selectedSection || selectedSection.totalCount === 0) && !isNetworkOnline()) {
      setMenuItems([]);
      setTotalPages(1);
      setTotalItems(0);
      setLoadingItems(false);
      return;
    }

    // Fall back to fetching if not yet cached
    await fetchMenuItems(sectionId, 1);
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
        // Find category for this item to store categoryId
        const currentCategory = categories.find(cat => 
          cat.menus.some((menu: any) => 
            menu.menuSections?.some((section: any) => section.id === activeSubCategory)
          )
        );

        // Add new item
        return [
          ...prevItems,
          {
            ...menuItem,
            count: 1,
            isPacked: isItemPacked,
            packingCost: menuItem.packingCost,
            categoryId: currentCategory?.categoryId,
          },
        ];
      }
    });
  }, [menuSections, activeSubCategory, categories]);


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
          // Find category for this item to store categoryId
          const currentCategory = categories.find(cat => 
            cat.menus.some((menu: any) => 
              menu.menuSections?.some((section: any) => section.id === activeSubCategory)
            )
          );

          const newItem = {
            ...menuItem,
            count: 1,
            isPacked: false,
            packingCost: menuItem.packingCost,
            categoryId: currentCategory?.categoryId,
          };
          setTimeout(() => setIsUpdating(false), 100);
          return [...prevItems, newItem];
        }
        setTimeout(() => setIsUpdating(false), 100);
        return prevItems;
      }
    });
  }, [isUpdating, menuItems, categories, activeSubCategory]);

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
    const queuedId = searchParams.get('queueId');

    // A queued order is hydrated from localStorage below instead; fetching the
    // server with its queue id would 404.
    if (isAddItemsMode && queuedId) {
      return;
    }

    if (isAddItemsMode && order?.id && categories && categories.length > 0) {
      // Only load order details if explicitly adding items to an existing order
      getOrderDetails();
    } else if (!isAddItemsMode && order?.id) {
      // Clear the order from localStorage if we're not in add-items mode
      // This prevents accidental prefilling when creating a new order
      clearItemLocalStorage("order");
      setOrder(null);
    }
  }, [order?.id, categories, searchParams]);

  // Hydrates the cart and customer header for a queued order from the queue
  // entry, since there is no server record to fetch. Runs once per queue id.
  useEffect(() => {
    if (!addItemsMode || !queueId) return;

    const queued = getQueuedItem(queueId);
    const view = queued ? toQueuedOrderView(queued) : null;

    if (!view) {
      toast.error('Queued order not found');
      return;
    }

    setSelectedItems(
      view.lines.map((line) => ({
        id: line.itemID,
        itemID: line.itemID,
        itemName: line.itemName,
        menuName: line.menuName || '',
        itemDescription: '',
        price: line.unitPrice,
        currency: view.currency || 'NGN',
        isAvailable: true,
        hasVariety: false,
        image: '',
        isVariety: false,
        varieties: null,
        count: line.quantity,
        packingCost: line.packingCost,
        isPacked: line.isPacked,
        comment: line.comment,
        originalCount: line.quantity,
      }))
    );

    setOrderDetails({
      id: queueId,
      placedByName: view.customerName,
      placedByPhoneNumber: view.customerPhone,
      quickResponseID: view.table,
      qrReference: view.table,
      comment: view.comment,
      additionalCost: view.additionalCost,
      additionalCostName: view.additionalCostName,
      vatAmount: view.vatAmount,
      isVatApplied: view.isVatApplied,
      // Carry any payment already recorded on the device so a later settlement
      // only charges the outstanding balance rather than the full total again.
      amountPaid: Number(queued?.local?.amountPaid) || 0,
    });
  }, [addItemsMode, queueId]);

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

  const handleItemComment = useCallback((itemId: string, comment: string) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, comment } : item
      )
    );
  }, []);

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

  /**
   * Runs once the order has actually been placed (sent, or safely queued
   * offline). Wipes every trace of it so the next order starts blank:
   *
   * - `selectedItems` — the cart. Previously this was never cleared on this
   *   page, so the second order came up pre-filled with the first one's items.
   * - `orderDetails` — the customer/table header, which the checkout modal reads
   *   as its initial values.
   * - `order` + `localStorage["order"]` — the add-items prefill hand-off. Left
   *   in place it would re-hydrate an already-placed order on the next visit.
   */
  const handleOrderPlaced = useCallback(() => {
    setSelectedItems([]);
    setOrderDetails(null);
    setOrder(null);
    setCurrentMenuItems([]);
    clearItemLocalStorage("order");
  }, [setCurrentMenuItems]);

  console.log(selectedItems)


  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
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
          <div className="text-lg sm:text-[24px] leading-8 font-semibold">
            <span>Create Orders</span>
          </div>
          <p className="text-sm text-grey600 xl:mb-8 w-full mb-2 sm:mb-4">
            Showing all orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <CustomInput
              classnames={"w-full sm:w-[242px]"}
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
            onClick={selectedItems.length > 0 ? handleOpenCheckoutModal : () => {}}
            className="py-2 px-4 mb-0 text-white w-full sm:w-auto"
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
              <div className="px-2 sm:px-6 pb-6">
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
                                {formatPrice(item?.price * item.count, undefined as any)}
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
                        {formatPrice(calculateTotalPrice(), undefined as any)}
                      </p>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between flex-col items-center">
                      <h3 className="text-[14px] font-[600]">Total</h3>
                      <p className="text-[16px] font-[700] text-primaryColor">
                        {formatPrice(calculateTotalPrice(), undefined as any)}
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
          id={queueId ? undefined : order?.id}
          isQueued={!!queueId}
          queueId={queueId || undefined}
          orderDetails={orderDetails}
          handlePackingCost={handlePackingCost}
          handleItemComment={handleItemComment}
          businessId={businessInformation?.[0]?.businessId}
          cooperateID={userInformation?.cooperateID}
          categoriesData={categories}
          onOrderSuccess={handleOrderPlaced}
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