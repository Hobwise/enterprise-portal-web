
"use client"
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useMenuCategories from '@/hooks/cachedEndpoints/useMenuCategories';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useGlobalContext } from '@/hooks/globalProvider';
import {
  getMenuItems,
  createMenuVariety,
  payloadMenuVariety,
  createMenuItem,
  payloadMenuItem,
  uploadFile,
  deleteFile,
  exportGrid,
  getMenuItem,
  deleteMenuItem,
  deleteVariety,
} from '@/app/api/controllers/dashboard/menu';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';
import { getJsonItemFromLocalStorage, dynamicExportConfig } from '@/lib/utils';
import MenuHeader from '@/components/ui/dashboard/menu/MenuHeader';
import CategoryTabs from '@/components/ui/dashboard/menu/CategoryTabs';
import MenuToolbar from '@/components/ui/dashboard/menu/MenuToolbar';
import MenuItemsGrid from '@/components/ui/dashboard/menu/MenuItemsGrid';
import AddItemModal from '@/components/ui/dashboard/menu/modals/AddItemModal';
import CreateVarietyModal from '@/components/ui/dashboard/menu/modals/CreateVarietyModal';
import ItemDetailsModal from '@/components/ui/dashboard/menu/modals/ItemDetailsModal';
import SingleItemModal from '@/components/ui/dashboard/menu/modals/SingleItemModal';
import CreateMenuModal from '@/components/ui/dashboard/menu/modals/CreateMenuModal';
import EditMenuModal from '@/components/ui/dashboard/menu/modals/EditMenuModal';
import EditItemModal from '@/components/ui/dashboard/menu/modals/EditItemModal';
import ViewMenuModal from '@/components/ui/dashboard/menu/modals/ViewMenuModal';
import CreateSectionModal from '@/components/ui/dashboard/menu/modals/CreateSectionModal';
import EditSectionModal from '@/components/ui/dashboard/menu/modals/EditSectionModal';
import EditVarietyModal from '@/components/ui/dashboard/menu/modals/EditVarietyModal';
import DeleteModal from '@/components/ui/deleteModal';
import AddItemChoiceModal from '@/components/ui/dashboard/menu/modals/AddItemChoiceModal';
import AddMultipleItemsModal from '@/components/ui/dashboard/menu/modals/AddMultipleItemsModal';
import CustomPagination from '@/components/ui/dashboard/settings/BillingsComponents/CustomPagination';

// Global cache for menu items to persist across category switches
const globalMenuItemsCache = new Map<string, { 
  items: any[], 
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number 
}>();
const GLOBAL_CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

const RestaurantMenu = () => {
  const router = useRouter();
  const { userRolePermissions, role, isLoading: isPermissionsLoading } = usePermission();
  const {
    setCurrentMenuItems,
    setCurrentCategory,
    setCurrentSection,
    setCurrentSearchQuery
  } = useGlobalContext();

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');
  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 11; // 11 items per page
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states for menu categories
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);
  const [isOpenCreateMenu, setIsOpenCreateMenu] = useState(false);
  const [isOpenEditMenu, setIsOpenEditMenu] = useState(false);
  const [isOpenEditItem, setIsOpenEditItem] = useState(false);
  const [isOpenDeleteMenu, setIsOpenDeleteMenu] = useState(false);
  const [isOpenCreateSection, setIsOpenCreateSection] = useState(false);
  const [viewMenuMode, setViewMenuMode] = useState<'all' | 'current'>('all');

  // Modal states for menu items
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddItemChoiceModalOpen, setIsAddItemChoiceModalOpen] = useState(false);
  const [isAddMultipleItemsModalOpen, setIsAddMultipleItemsModalOpen] = useState(false);
  const [isCreateVarietyModalOpen, setIsCreateVarietyModalOpen] = useState(false);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [isSingleItemModalOpen, setIsSingleItemModalOpen] = useState(false);
  const [isEditVarietyModalOpen, setIsEditVarietyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedVariety, setSelectedVariety] = useState<any>(null);
  const [varietiesLoading, setVarietiesLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Preloading state management
  const [preloadedSections, setPreloadedSections] = useState<Map<string, any[]>>(
    new Map()
  );
  const [isPreloading, setIsPreloading] = useState(false);
  const [cacheTimestamps, setCacheTimestamps] = useState<Map<string, number>>(
    new Map()
  );
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

  // Form states for Create Menu
  const [name, setName] = useState('');
  const [packingCost, setPackingCost] = useState<number | undefined>();
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  // Form states for Edit Menu
  const [editingMenu, setEditingMenu] = useState<{
    id: string;
    name: string;
    packingCost?: number;
    waitingTimeMinutes?: number;
    categoryId?: string;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editPackingCost, setEditPackingCost] = useState<number | undefined>();
  const [editEstimatedTime, setEditEstimatedTime] = useState<
    number | undefined
  >();
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  // Form states for Add Menu Item
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedMenuType, setSelectedMenuType] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // Form states for Create Variety
  const [varietyName, setVarietyName] = useState('');
  const [varietyPrice, setVarietyPrice] = useState('');

  // Upload loading states
  const [isUploadingItemImage, setIsUploadingItemImage] = useState(false);
  const [itemImageReference, setItemImageReference] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Form state for Create Section
  const [sectionName, setSectionName] = useState('');



  // Form states for Edit Section
  const [isOpenEditSection, setIsOpenEditSection] = useState(false);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState('');

  // Form states for section selection in menus
  const [selectedCreateSection, setSelectedCreateSection] = useState('');
  const [selectedEditSection, setSelectedEditSection] = useState('');

  // Pre-fill active section when modal opens and clear when closed
  useEffect(() => {
    if (isOpen && activeCategory) {
      setSelectedCreateSection(activeCategory);
    } else if (!isOpen) {
      // Reset selection when modal closes for next time
      setTimeout(() => setSelectedCreateSection(''), 100);
    }
  }, [isOpen, activeCategory]);

  // Fetch categories from API
  const { data: categoriesData, isLoading: loadingCategories, refetch: refetchCategories } = useMenuCategories();
  const [categories, setCategories] = useState<any[]>([]);

  // Cache management functions
  const isCacheValid = (sectionId: string): boolean => {
    const timestamp = cacheTimestamps.get(sectionId);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_EXPIRY_TIME;
  };

  // Helper function to update menu section count
  const updateMenuSectionCount = (sectionId: string, delta: number) => {
    setMenuSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, totalCount: Math.max(0, (section.totalCount || 0) + delta) }
          : section
      )
    );
  };

  // Background preloading function
  const preloadMenuSections = async (sections: any[], priority: boolean = false) => {
    if (!sections || sections.length === 0) return;

    if (!priority) {
      setIsPreloading(true);
    }

    try {
      const preloadPromises = sections.map(async (section) => {
        // Check global cache first
        const cached = globalMenuItemsCache.get(section.id);
        if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
          return { sectionId: section.id, cached: true };
        }

        try {
          const response = await getMenuItems(section.id, 1, pageSize);
          if (response?.data?.isSuccessful) {
            const items = response.data.data?.items || [];
            const transformedItems = items.map((item: any) => ({
              id: item.id,
              name: item.itemName,
              price: item.price,
              image: item.image,
              description: item.itemDescription,
              category: item.menuName,
              section: section.name,
              varieties: item.varieties || [],
              isAvailable: item.isAvailable,
              waitingTimeMinutes: item.waitingTimeMinutes,
              packingCost: item.packingCost,
              menuID: item.menuID,
              itemName: item.itemName,
              itemDescription: item.itemDescription,
              imageReference: item.imageReference,
              currency: item.currency,
              hasVariety: item.hasVariety,
            }));

            // Update global cache
            globalMenuItemsCache.set(section.id, {
              items: transformedItems,
              timestamp: Date.now(),
              totalPages: 1,
              totalItems: transformedItems.length,
              currentPage: 1
            });

            return { sectionId: section.id, items: transformedItems };
          }
        } catch (error) {
          console.error(`Failed to preload section ${section.id}:`, error);
          return { sectionId: section.id, error: true };
        }
      });

      const results = await Promise.allSettled(preloadPromises);

      const newPreloadedSections = new Map(preloadedSections);
      const newTimestamps = new Map(cacheTimestamps);

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.items) {
          const { sectionId, items } = result.value;
          newPreloadedSections.set(sectionId, items);
          newTimestamps.set(sectionId, Date.now());
        }
      });

      setPreloadedSections(newPreloadedSections);
      setCacheTimestamps(newTimestamps);
    } catch (error) {
      console.error('Error preloading menu sections:', error);
    } finally {
      if (!priority) {
        setIsPreloading(false);
      }
    }
  };

  // Function to fetch first item with priority (for initial load only)
  const fetchFirstItemPriority = async (menuSectionId: string) => {
    if (!menuSectionId) return;
    
    try {
      // Fetch just the first item for immediate display
      const response = await getMenuItems(menuSectionId, 1, 1); // page 1, size 1
      if (response?.data?.isSuccessful) {
        const items = response.data.data?.items || [];
        if (items.length > 0) {
          const firstItem = items[0];
          const transformedItem = {
            id: firstItem.id,
            name: firstItem.itemName,
            price: firstItem.price,
            image: firstItem.image,
            description: firstItem.itemDescription,
            category: firstItem.menuName,
            section: activeCategory,
            varieties: firstItem.varieties || [],
            isAvailable: firstItem.isAvailable,
            waitingTimeMinutes: firstItem.waitingTimeMinutes,
            packingCost: firstItem.packingCost,
            menuID: firstItem.menuID,
            itemName: firstItem.itemName,
            itemDescription: firstItem.itemDescription,
            imageReference: firstItem.imageReference,
            currency: firstItem.currency,
            hasVariety: firstItem.hasVariety,
          };
          
          // Set first item immediately
          setMenuItems([transformedItem]);
          
          // Mark initial load as completed
          setHasInitialLoadCompleted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching first item:', error);
    }
  };

  // Function to fetch remaining items in background
  const fetchRemainingItemsBackground = async (menuSectionId: string, page: number = 1) => {
    if (!menuSectionId) return;
    
    setTimeout(async () => {
      try {
        const response = await getMenuItems(menuSectionId, page, pageSize);
        if (response?.data?.isSuccessful) {
          const items = response.data.data?.items || [];
          const transformedItems = items.map((item: any) => ({
            id: item.id,
            name: item.itemName,
            price: item.price,
            image: item.image,
            description: item.itemDescription,
            category: item.menuName,
            section: activeCategory,
            varieties: item.varieties || [],
            isAvailable: item.isAvailable,
            waitingTimeMinutes: item.waitingTimeMinutes,
            packingCost: item.packingCost,
            menuID: item.menuID,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            imageReference: item.imageReference,
            currency: item.currency,
            hasVariety: item.hasVariety,
          }));
          
          // Extract pagination metadata
          const pagination = response.data.data?.pagination;
          const totalPagesFromAPI = pagination?.totalPages || Math.ceil((response.data.data?.totalCount || items.length) / pageSize);
          const totalItemsFromAPI = pagination?.totalItems || response.data.data?.totalCount || items.length;
          
          setTotalPages(totalPagesFromAPI);
          setTotalItems(totalItemsFromAPI);

          // Update global cache
          const cacheKey = `${menuSectionId}_page_${page}`;
          globalMenuItemsCache.set(cacheKey, {
            items: transformedItems,
            timestamp: Date.now(),
            totalPages: totalPagesFromAPI,
            totalItems: totalItemsFromAPI,
            currentPage: page
          });
          
          // Update menu items with all items
          setMenuItems(transformedItems);
          setLoadingItems(false);
        }
      } catch (error) {
        console.error('Error fetching remaining items:', error);
        setLoadingItems(false);
      }
    }, 100); // Small delay to ensure first item displays immediately
  };

  // Function to fetch menu items by section ID
  const fetchMenuItems = async (menuSectionId: string, forceRefresh: boolean = false, page?: number) => {
    if (!menuSectionId) return;

    const pageToFetch = page !== undefined ? page : currentPage;

    // Check global cache first
    if (!forceRefresh) {
      const cacheKey = `${menuSectionId}_page_${pageToFetch}`;
      const cached = globalMenuItemsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
        setMenuItems(cached.items);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
        setLoadingItems(false);
        return;
      }
    }

    setLoadingItems(true);
    try {
      const pageToFetch = page !== undefined ? page : currentPage;
      const response = await getMenuItems(menuSectionId, pageToFetch, pageSize);
      if (response?.data?.isSuccessful) {
        const items = response.data.data?.items || [];
        const transformedItems = items.map((item: any) => ({
          id: item.id,
          name: item.itemName,
          price: item.price,
          image: item.image,
          description: item.itemDescription,
          category: item.menuName,
          section: activeCategory,
          varieties: item.varieties || [],
          isAvailable: item.isAvailable,
          waitingTimeMinutes: item.waitingTimeMinutes,
          packingCost: item.packingCost,
          menuID: item.menuID,
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          imageReference: item.imageReference,
          currency: item.currency,
          hasVariety: item.hasVariety,
        }));
        
        // Extract pagination metadata
        const pagination = response.data.data?.pagination;
        const totalPagesFromAPI = pagination?.totalPages || Math.ceil((response.data.data?.totalCount || items.length) / pageSize);
        const totalItemsFromAPI = pagination?.totalItems || response.data.data?.totalCount || items.length;
        
        setTotalPages(totalPagesFromAPI);
        setTotalItems(totalItemsFromAPI);

        // Update global cache with pagination info
        const cacheKey = `${menuSectionId}_page_${pageToFetch}`;
        globalMenuItemsCache.set(cacheKey, {
          items: transformedItems,
          timestamp: Date.now(),
          totalPages: totalPagesFromAPI,
          totalItems: totalItemsFromAPI,
          currentPage: pageToFetch
        });
        
        // Also update preloaded sections for compatibility
        setPreloadedSections(prev => {
          const newMap = new Map(prev);
          newMap.set(menuSectionId, transformedItems);
          return newMap;
        });
        setCacheTimestamps(prev => {
          const newMap = new Map(prev);
          newMap.set(menuSectionId, Date.now());
          return newMap;
        });
        
        setMenuItems(transformedItems);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Sync menuItems with global context whenever it changes
  useEffect(() => {
    if (menuItems) {
      setCurrentMenuItems(menuItems);
    }
  }, [menuItems, setCurrentMenuItems]);

  useEffect(() => {
    if (categoriesData && categoriesData.length > 0 && !hasInitialized) {
      setCategories(categoriesData);
      const firstCategory = categoriesData[0];
      if (firstCategory) {
        setActiveCategory(firstCategory.categoryId);
        const sections = firstCategory.menus[0]?.menuSections || [];
        setMenuSections(sections);
        if (sections.length > 0) {
          setActiveSubCategory(sections[0].id);
          
          // Check if this is the very first load
          if (!hasInitialLoadCompleted) {
            // Check cache first for immediate display
            const cacheKey = `${sections[0].id}_page_1`;
            const cached = globalMenuItemsCache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
              // Use cache if available
              setMenuItems(cached.items);
              setTotalPages(cached.totalPages || 1);
              setTotalItems(cached.totalItems || 0);
              setHasInitialLoadCompleted(true);
            } else {
              // Priority load: fetch first item immediately, then rest in background
              fetchFirstItemPriority(sections[0].id);
              fetchRemainingItemsBackground(sections[0].id, 1);
            }
          } else {
            // Normal cache check for subsequent loads
            const cached = globalMenuItemsCache.get(sections[0].id);
            if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
              setMenuItems(cached.items);
              setTotalPages(cached.totalPages || 1);
              setTotalItems(cached.totalItems || 0);
            } else {
              fetchMenuItems(sections[0].id, false, 1);
            }
          }
        } else {
          // No sections available, set empty items immediately
          setMenuItems([]);
        }
        setHasInitialized(true);
      }
    } else if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData, hasInitialized, hasInitialLoadCompleted]);

  const handleCategorySelect = async (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find((c) => c.categoryId === categoryId);
    if (category) {
      const sections = category.menus[0]?.menuSections || [];
      setMenuSections(sections);

      if (sections.length > 0) {
        const firstSection = sections[0];
        setActiveSubCategory(firstSection.id);

        if (firstSection.totalCount > 0) {
          // Reset pagination for new section
          setCurrentPage(1);
          setTotalPages(1);
          setTotalItems(0);
          
          // Check global cache first with page info
          const cacheKey = `${firstSection.id}_page_1`;
          const cached = globalMenuItemsCache.get(cacheKey);
          if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
            setMenuItems(cached.items);
            setTotalPages(cached.totalPages || 1);
            setTotalItems(cached.totalItems || 0);
            setCurrentPage(1);
          } else {
            // Set loading state before fetching
            setLoadingItems(true);
            fetchMenuItems(firstSection.id, false, 1);
          }
        } else {
          setMenuItems([]);
          setTotalPages(1);
          setTotalItems(0);
        }

        // Background preload remaining sections
        const remainingSections = sections.slice(1);
        if (remainingSections.length > 0) {
          setTimeout(() => {
            preloadMenuSections(remainingSections, false);
          }, 100);
        }
      } else {
        setMenuItems([]);
        setActiveSubCategory('');
      }
    }
  };

  const handleMenuSectionSelect = (sectionId: string) => {
    setActiveSubCategory(sectionId);
    setCurrentPage(1); // Always reset to page 1 when switching sections
    
    // Check global cache first for page 1
    const cacheKey = `${sectionId}_page_1`;
    const cached = globalMenuItemsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
      setMenuItems(cached.items);
      setTotalPages(cached.totalPages || 1);
      setTotalItems(cached.totalItems || 0);
    } else {
      // Set loading state and fetch if section has items
      const section = menuSections.find(s => s.id === sectionId);
      if (section && section.totalCount > 0) {
        setLoadingItems(true);
        fetchMenuItems(sectionId, false, 1);
      } else {
        setMenuItems([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    }
  };

  const handleDrag = (e: React.DragEvent, setActive: (value: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setActive(true);
    } else if (e.type === 'dragleave') {
      setActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    setActive: (value: boolean) => void,
    handleFile: (file: File) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleFile: (file: File) => void
  ) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleItemImageFile = async (file: File) => {
    setIsUploadingItemImage(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile(business[0]?.businessId, formData);

      if (response?.data?.isSuccessful) {
        setItemImage(file);
        setItemImageReference(response.data.data);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingItemImage(false);
    }
  };


  const handleRemoveItemImage = async () => {
    if (!itemImageReference) return;

    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await deleteFile(business[0]?.businessId, itemImageReference);

      if (response?.data?.isSuccessful) {
        setItemImage(null);
        setImagePreview('');
        setItemImageReference('');
        toast.success('Image removed successfully');
      } else {
        toast.error('Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };


  const handleItemClick = async (item: any) => {
    setSelectedItem(item);
    setVarietiesLoading(true);

    try {
      const response = await getMenuItem(item.id);

      if (response?.data?.isSuccessful) {
        const itemData = response.data.data;
        const varieties = itemData?.varieties || [];
        const updatedItem = { ...item, varieties, ...itemData };
        setSelectedItem(updatedItem);

        if (varieties.length > 0) {
          setIsItemDetailsModalOpen(true);
        } else {
          setIsSingleItemModalOpen(true);
        }
      } else {
        if (item.varieties && item.varieties.length > 0) {
          setIsItemDetailsModalOpen(true);
        } else {
          setIsSingleItemModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      if (item.varieties && item.varieties.length > 0) {
        setIsItemDetailsModalOpen(true);
      } else {
        setIsSingleItemModalOpen(true);
      }
    } finally {
      setVarietiesLoading(false);
    }
  };

  const openCreateVarietyModal = (item: any) => {
    setSelectedItem(item);
    setIsItemDetailsModalOpen(false);
    setIsSingleItemModalOpen(false);
    setIsCreateVarietyModalOpen(true);
  };

  const backToItemDetails = () => {
    setIsCreateVarietyModalOpen(false);
    if (selectedItem?.varieties && selectedItem.varieties.length > 0) {
      setIsItemDetailsModalOpen(true);
    } else {
      setIsSingleItemModalOpen(true);
    }
  };


  const handleEditVariety = (variety: any) => {
    setSelectedVariety(variety);
    setIsItemDetailsModalOpen(false);
    setIsEditVarietyModalOpen(true);
  };

  const handleVarietyUpdated = async () => {
    // Refresh the selected item to get updated variety data
    if (selectedItem) {
      const response = await getMenuItem(selectedItem.id);
      if (response?.data?.isSuccessful) {
        const itemData = response.data.data;
        const varieties = itemData?.varieties || [];
        setSelectedItem({ ...selectedItem, varieties, ...itemData });
      }
    }
    // Refresh menu items
    if (activeSubCategory) {
      // Invalidate all pages in cache for this section
      const keysToDelete: string[] = [];
      globalMenuItemsCache.forEach((_, key) => {
        if (key.startsWith(`${activeSubCategory}_page_`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
      
      // Also invalidate preloaded sections cache
      setPreloadedSections(prev => {
        const newMap = new Map(prev);
        newMap.delete(activeSubCategory);
        return newMap;
      });
      fetchMenuItems(activeSubCategory, true, currentPage);
    }
    // Close edit modal and go back to item details
    setIsEditVarietyModalOpen(false);
    setIsItemDetailsModalOpen(true);
  };

  const handleCreateVariety = async () => {
    if (!selectedItem || !varietyName || !varietyPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: payloadMenuVariety = {
        itemID: selectedItem.id,
        menuID: selectedItem.menuID,
        unit: varietyName,
        price: parseFloat(varietyPrice),
        currency: 'NGA',
      };

      const response = await createMenuVariety(business[0]?.businessId, payload);

      if (response && 'errors' in response) {
        toast.error('Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Variety created successfully');
        setVarietyName('');
        setVarietyPrice('');
        backToItemDetails();
        if (activeSubCategory) {
          // Invalidate all pages in cache for this section
          const keysToDelete: string[] = [];
          globalMenuItemsCache.forEach((_, key) => {
            if (key.startsWith(`${activeSubCategory}_page_`)) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
          
          // Also invalidate preloaded sections cache
          setPreloadedSections(prev => {
            const newMap = new Map(prev);
            newMap.delete(activeSubCategory);
            return newMap;
          });
          fetchMenuItems(activeSubCategory, true, currentPage);
        }
      } else {
        toast.error(response?.data?.error || 'Failed to create variety');
      }
    } catch (error) {
      console.error('Error creating variety:', error);
      toast.error('Failed to create variety');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenuItem = async () => {
    if (!itemName || !itemPrice || !selectedMenuType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: payloadMenuItem = {
        menuID: selectedMenuType,
        itemName: itemName,
        itemDescription: itemDescription,
        price: parseFloat(itemPrice),
        currency: 'NGN',
        isAvailable: true,
        hasVariety: false,
        imageReference: itemImageReference,
      };

      const response = await createMenuItem(business[0]?.businessId, payload);

      if (response && 'errors' in response) {
        toast.error('Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Menu item created successfully');
        setItemName('');
        setItemDescription('');
        setItemPrice('');
        setSelectedSection('');
        setSelectedMenuType('');
        setItemImage(null);
        setImagePreview('');
        setItemImageReference('');
        setIsAddItemModalOpen(false);
        
        // Update the section count for the menu where the item was added
        if (selectedMenuType) {
          updateMenuSectionCount(selectedMenuType, 1);
        }
        
        if (activeSubCategory) {
          // Invalidate all pages in cache for this section
          const keysToDelete: string[] = [];
          globalMenuItemsCache.forEach((_, key) => {
            if (key.startsWith(`${activeSubCategory}_page_`)) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
          
          // Also invalidate preloaded sections cache
          setPreloadedSections(prev => {
            const newMap = new Map(prev);
            newMap.delete(activeSubCategory);
            return newMap;
          });
          // Reset to page 1 when new item is added
          setCurrentPage(1);
          fetchMenuItems(activeSubCategory, true, 1);
        }
      } else {
        toast.error(response?.data?.error || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error('Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await exportGrid(business[0]?.businessId, 0);

      if (response?.status === 200) {
        dynamicExportConfig(
          response,
          `Menu-${business[0]?.businessName}`
        );
        toast.success('Menu data exported successfully');
      } else {
        toast.error('Failed to export menu data');
      }
    } catch (error) {
      toast.error('Failed to export menu data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateMenu = async () => {
    setLoading(true);
    try {
      const { createMenu } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      const payload = {
        name,
        packingCost: packingCost || 0,
        categoryId: selectedCreateSection,
        waitingTimeMinutes: estimatedTime || 0,
      };

      const response = await createMenu(business[0]?.businessId, payload);

      if (response?.data?.isSuccessful) {
        toast.success('Menu successfully created');

        // Refresh categories and get the fresh data
        const result = await refetchCategories();
        const freshCategories = result.data;

        // Update categories state immediately with fresh data
        if (freshCategories && Array.isArray(freshCategories)) {
          setCategories(freshCategories);

          // Immediately update menuSections with fresh data
          const currentCategory = freshCategories.find((c: any) => c.categoryId === activeCategory);
          if (currentCategory) {
            const updatedSections = currentCategory.menus[0]?.menuSections || [];
            setMenuSections(updatedSections); // Updates MenuToolbar immediately

            // If we just created the first menu section, auto-select it
            if (updatedSections.length === 1 && !activeSubCategory) {
              setActiveSubCategory(updatedSections[0].id);
              fetchMenuItems(updatedSections[0].id, true, 1);
            }
          }
        }

        onOpenChange();
        setName('');
        setPackingCost(undefined);
        setEstimatedTime(undefined);
        setSelectedCreateSection('');

        // Invalidate cache for the section where menu was created
        if (activeCategory) {
          // Invalidate all pages in cache for this section
          const keysToDelete: string[] = [];
          globalMenuItemsCache.forEach((_, key) => {
            if (key.startsWith(`${activeCategory}_page_`)) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach(key => globalMenuItemsCache.delete(key));

          setPreloadedSections(prev => {
            const newMap = new Map(prev);
            newMap.delete(activeCategory);
            return newMap;
          });
        }
      } else {
        toast.error(response?.data?.error || 'Failed to create menu');
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      toast.error('Failed to create menu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = (menu: any) => {
    setEditingMenu({
      ...menu,
      categoryId: menu.categoryId || activeCategory // Store current category if not provided
    });
    setEditName(menu.name);
    setEditPackingCost(menu.packingCost);
    setEditEstimatedTime(menu.waitingTimeMinutes);
    setSelectedEditSection(menu.categoryId || activeCategory || '');
    setIsOpenViewMenu(false);
    setIsOpenEditMenu(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return Promise.resolve();

    setLoading(true);
    try {
      const { updateMenu } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      const payload = {
        name: editName,
        packingCost: editPackingCost || 0,
        waitingTimeMinutes: editEstimatedTime || 0,
        categoryId: selectedEditSection,
      };

      const response = await updateMenu(business[0]?.businessId, editingMenu.id, payload);

      if (response?.data?.isSuccessful) {
        toast.success('Menu updated successfully');

        // Clear all caches to ensure fresh data
        globalMenuItemsCache.clear();
        setPreloadedSections(new Map());
        setCacheTimestamps(new Map());

        // Check if menu was moved to a different category
        const menuMovedToNewCategory = editingMenu.categoryId !== selectedEditSection;

        // Refresh categories and get the fresh data
        const result = await refetchCategories();
        const freshCategories = result.data;

        // Update categories state immediately with fresh data
        if (freshCategories && Array.isArray(freshCategories)) {
          setCategories(freshCategories);

          // Immediately update menuSections with fresh data
          const currentCategory = freshCategories.find((c: any) => c.categoryId === activeCategory);
          if (currentCategory) {
            const updatedSections = currentCategory.menus[0]?.menuSections || [];
            setMenuSections(updatedSections); // Updates both MenuToolbar AND ViewMenuModal immediately

            // Handle active section management
            if (menuMovedToNewCategory && activeSubCategory === editingMenu.id) {
              // The currently active section was moved away
              if (updatedSections.length > 0) {
                // Switch to first available section
                const firstSection = updatedSections[0];
                setActiveSubCategory(firstSection.id);
                fetchMenuItems(firstSection.id, true, 1);
              } else {
                // No sections left in current category
                setMenuItems([]);
                setActiveSubCategory('');
              }
            } else if (activeSubCategory) {
              // Refresh current section data if still valid
              const stillExists = updatedSections.find((s: any) => s.id === activeSubCategory);
              if (stillExists) {
                fetchMenuItems(activeSubCategory, true, currentPage);
              }
            }
          }
        }

        closeEditModal();
        return true; // Return success indicator
      } else {
        toast.error(response?.data?.error || 'Failed to update menu');
        return false;
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      toast.error('Failed to update menu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setIsOpenEditMenu(false);
    setIsOpenViewMenu(true);
  };

  const handleEditSection = (category: any) => {
    setEditingSectionId(category.categoryId);
    setEditingSectionName(category.categoryName);
    setIsOpenViewMenu(false);
    setIsOpenEditSection(true);
  };

  const handleUpdateSection = async () => {
    if (!editingSectionName.trim() || !editingSectionId) return;

    setLoading(true);
    try {
      const { updateCategory } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      const payload = {
        name: editingSectionName,
        orderIndex: 0,
      };

      const response = await updateCategory(business[0]?.businessId, editingSectionId, payload);

      if (response?.data?.isSuccessful) {
        toast.success('Section updated successfully');
        setIsOpenEditSection(false);
        setEditingSectionName('');
        setEditingSectionId('');

        // Refresh categories and update UI immediately
        const result = await refetchCategories();
        const freshCategories = result.data;
        if (freshCategories && Array.isArray(freshCategories)) {
          setCategories(freshCategories);
        }
      } else {
        toast.error(response?.data?.error || 'Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditSection = () => {
    setIsOpenEditSection(false);
    setEditingSectionName('');
    setEditingSectionId('');
    setIsOpenViewMenu(true);
  };

  const handleCreateSection = async () => {
    if (!sectionName.trim()) return;
    setLoading(true);
    try {
      const { createCategory } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      const payload = {
        name: sectionName,
        orderIndex: 0,
      };

      const response = await createCategory(business[0]?.businessId, payload);

      if (response?.data?.isSuccessful) {
        toast.success('Section created successfully');
        setIsOpenCreateSection(false);
        setSectionName('');

        // Refresh categories and update UI immediately
        const result = await refetchCategories();
        const freshCategories = result.data;
        if (freshCategories && Array.isArray(freshCategories)) {
          setCategories(freshCategories);
        }
      } else {
        toast.error(response?.data?.error || 'Failed to create section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const business = getJsonItemFromLocalStorage('business');
      
      if (!business || !business[0]?.businessId) {
        toast.error('Business ID not found. Please refresh and try again.');
        return;
      }

      console.log('Attempting to delete menu item:', { itemId, businessId: business[0]?.businessId });
      
      const response = await deleteMenuItem(business[0]?.businessId, itemId);

      if (response?.data?.isSuccessful) {
        toast.success('Menu item deleted successfully');
        
        // Update the section count after deletion
        if (activeSubCategory) {
          updateMenuSectionCount(activeSubCategory, -1);
          
          // Invalidate all pages in cache for this section
          const keysToDelete: string[] = [];
          globalMenuItemsCache.forEach((_, key) => {
            if (key.startsWith(`${activeSubCategory}_page_`)) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
          
          // Also invalidate preloaded sections cache
          setPreloadedSections(prev => {
            const newMap = new Map(prev);
            newMap.delete(activeSubCategory);
            return newMap;
          });
          fetchMenuItems(activeSubCategory, true, currentPage); // Force refresh current page
        }
        // Close any open modals
        setIsSingleItemModalOpen(false);
        setIsItemDetailsModalOpen(false);
      } else {
        const errorMessage = response?.data?.error || response?.data?.message || 'Failed to delete menu item';
        console.error('Delete failed with response:', response);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete menu item';
      toast.error(errorMessage);
    }
  };

  const handleDeleteVariety = async (varietyId: string) => {
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await deleteVariety(business[0]?.businessId, varietyId);

      if (response?.data?.isSuccessful) {
        toast.success('Variety deleted successfully');
        if (selectedItem) {
          // Refresh the selected item to update varieties
          const updatedResponse = await getMenuItem(selectedItem.id);
          if (updatedResponse?.data?.isSuccessful) {
            const itemData = updatedResponse.data.data;
            const varieties = itemData?.varieties || [];
            setSelectedItem({ ...selectedItem, varieties, ...itemData });
          }
        }
        if (activeSubCategory) {
          // Invalidate all pages in cache for this section
          const keysToDelete: string[] = [];
          globalMenuItemsCache.forEach((_, key) => {
            if (key.startsWith(`${activeSubCategory}_page_`)) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
          
          // Also invalidate preloaded sections cache
          setPreloadedSections(prev => {
            const newMap = new Map(prev);
            newMap.delete(activeSubCategory);
            return newMap;
          });
          fetchMenuItems(activeSubCategory, true, currentPage);
        }
      } else {
        toast.error(response?.data?.error || 'Failed to delete variety');
      }
    } catch (error) {
      console.error('Error deleting variety:', error);
      toast.error('Failed to delete variety');
    }
  };

  // Helper function for optimistic updates within same section
  const optimisticUpdateMenuItem = (updatedItem: any) => {
    // Transform the updated item to match the expected format
    const transformedUpdatedItem = {
      id: updatedItem.id,
      name: updatedItem.itemName,
      price: updatedItem.price,
      image: updatedItem.image,
      description: updatedItem.itemDescription,
      category: updatedItem.menuName,
      section: activeCategory,
      varieties: updatedItem.varieties || [],
      isAvailable: updatedItem.isAvailable,
      waitingTimeMinutes: updatedItem.waitingTimeMinutes,
      packingCost: updatedItem.packingCost,
      menuID: updatedItem.menuID,
      itemName: updatedItem.itemName,
      itemDescription: updatedItem.itemDescription,
      imageReference: updatedItem.imageReference,
      currency: updatedItem.currency,
      hasVariety: updatedItem.hasVariety,
    };

    // Update menuItems state immediately
    setMenuItems(prevItems => {
      if (!prevItems) return prevItems;
      return prevItems.map(item => 
        item.id === updatedItem.id ? transformedUpdatedItem : item
      );
    });

    // Update currentMenuItems state as well
    setCurrentMenuItems(prevItems => {
      if (!prevItems) return prevItems;
      return prevItems.map(item => 
        item.id === updatedItem.id ? transformedUpdatedItem : item
      );
    });

    // Update cache for current page
    const cacheKey = `${activeSubCategory}_page_${currentPage}`;
    const cached = globalMenuItemsCache.get(cacheKey);
    if (cached) {
      const updatedItems = cached.items.map(item => 
        item.id === updatedItem.id ? transformedUpdatedItem : item
      );
      globalMenuItemsCache.set(cacheKey, {
        ...cached,
        items: updatedItems,
      });
    }

    // Also update the selected item if it's currently selected
    if (selectedItem && selectedItem.id === updatedItem.id) {
      setSelectedItem(transformedUpdatedItem);
    }
  };

  // Helper function for cross-section moves
  const handleCrossSectionMove = async (updatedItem: any, originalSectionId: string) => {
    // Update section counts first
    updateMenuSectionCount(originalSectionId, -1); // Remove from original
    updateMenuSectionCount(updatedItem.menuID, 1); // Add to new section

    // Check if the item exists in the current view
    const itemExistsInCurrentView = menuItems?.some(item => item.id === updatedItem.id);

    // If item was moved to a different section than currently viewing
    if (updatedItem.menuID !== activeSubCategory) {
      // Remove from current view if it exists
      if (itemExistsInCurrentView) {
        setMenuItems(prevItems => {
          if (!prevItems) return prevItems;
          return prevItems.filter(item => item.id !== updatedItem.id);
        });

        setCurrentMenuItems(prevItems => {
          if (!prevItems) return prevItems;
          return prevItems.filter(item => item.id !== updatedItem.id);
        });

        // Update total items count
        setTotalItems(prev => Math.max(0, prev - 1));
      }

      // Clear cache for the current section to ensure fresh data on next load
      const keysToDelete: string[] = [];
      globalMenuItemsCache.forEach((_, key) => {
        if (key.startsWith(`${activeSubCategory}_page_`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
    }
    // If the item was moved to the current section
    else if (updatedItem.menuID === activeSubCategory) {
      // Add to current view if not already there (optimistic update)
      if (!itemExistsInCurrentView) {
        optimisticUpdateMenuItem(updatedItem);
        setTotalItems(prev => prev + 1);
      } else {
        // Update existing item if it's in the current section
        optimisticUpdateMenuItem(updatedItem);
      }
    }

    // Clear cache for both source and destination sections to ensure consistency
    const sectionsToInvalidate = [originalSectionId, updatedItem.menuID];
    sectionsToInvalidate.forEach(sectionId => {
      const keysToDelete: string[] = [];
      globalMenuItemsCache.forEach((_, key) => {
        if (key.startsWith(`${sectionId}_page_`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => globalMenuItemsCache.delete(key));
    });

    // Update categories structure in the background to reflect the move
    // This ensures ViewMenuModal shows updated data
    await refetchCategories();
  };

  const handleItemUpdated = async (updatedItem: any, originalSectionId?: string) => {
    const itemWasMoved = originalSectionId && originalSectionId !== updatedItem.menuID;
    
    if (itemWasMoved) {
      // Handle cross-section moves
      await handleCrossSectionMove(updatedItem, originalSectionId);
    } else {
      // Handle same-section updates - optimistic update
      optimisticUpdateMenuItem(updatedItem);
    }
  };

  const handleEditItem = (item: any) => {
    // Close any open modals
    setIsCreateVarietyModalOpen(false);
    setIsItemDetailsModalOpen(false);
    setIsSingleItemModalOpen(false);
    // Set the selected item and open edit modal
    setSelectedItem(item);
    setIsOpenEditItem(true);
  };

  const handleDeleteItemFromVarietyModal = async (itemId: string) => {
    // Close the create variety modal first
    setIsCreateVarietyModalOpen(false);
    // Then call the regular delete function
    await handleDeleteMenuItem(itemId);
  };


  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Reset pagination when searching
    setCurrentPage(1);
    if (value.trim() === '' && activeSubCategory) {
      // If clearing search, fetch page 1
      fetchMenuItems(activeSubCategory, false, 1);
    }
  };

  const handleSingleItemChoice = () => {
    setIsAddItemChoiceModalOpen(false);
    setIsAddItemModalOpen(true);
  };

  const handleMultipleItemChoice = () => {
    setIsAddItemChoiceModalOpen(false);
    setIsAddMultipleItemsModalOpen(true);
  };

  const handleMultipleItemsSuccess = async () => {
    // Refresh menu items after successful upload
    if (activeSubCategory) {
      // Clear all cached pages for ALL sections to be safe
      globalMenuItemsCache.clear();
      
      setPreloadedSections(prev => {
        const newMap = new Map(prev);
        newMap.clear(); // Clear all preloaded sections
        return newMap;
      });
      
      setCacheTimestamps(prev => {
        const newMap = new Map(prev);
        newMap.clear(); // Clear all cache timestamps
        return newMap;
      });
      
      // Reset to page 1
      setCurrentPage(1);
      
      // Force refetch categories to get updated counts
      await refetchCategories();
      
      // Add a small delay to ensure data is updated on server
      setTimeout(async () => {
        try {
          // Fetch the updated menu items with force refresh
          const response = await getMenuItems(activeSubCategory, 1, pageSize);
          if (response?.data?.isSuccessful) {
            const totalItemsFromAPI = response.data.data?.pagination?.totalItems || 
                                     response.data.data?.totalCount || 
                                     response.data.data?.items?.length || 0;
            
            // Update the section count to reflect the new total
            const currentSection = menuSections.find(s => s.id === activeSubCategory);
            if (currentSection) {
              const newCount = totalItemsFromAPI;
              const oldCount = currentSection.totalCount || 0;
              if (newCount !== oldCount) {
                updateMenuSectionCount(activeSubCategory, newCount - oldCount);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching updated counts:', error);
          // Retry once more after another delay
          setTimeout(() => {
            fetchMenuItems(activeSubCategory, true, 1);
          }, 1000);
        }
        
        // Force refresh the menu items display
        fetchMenuItems(activeSubCategory, true, 1);
      }, 500); // 500ms delay to ensure server has processed
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeSubCategory) {
      fetchMenuItems(activeSubCategory, false, page);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handlePreviewClick = () => {
    // Get current category and section names
    const currentCategoryData = categories.find(c => c.categoryId === activeCategory);
    const currentSectionData = menuSections.find(s => s.id === activeSubCategory);
    
    // Set the current menu state in global context
    setCurrentMenuItems(filteredMenuItems || []);
    setCurrentCategory(currentCategoryData?.categoryName || '');
    setCurrentSection(currentSectionData?.name || '');
    setCurrentSearchQuery(searchQuery);
    
    // Store in sessionStorage for persistence
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previewMenuState', JSON.stringify({
        items: filteredMenuItems || [],
        category: currentCategoryData?.categoryName || '',
        section: currentSectionData?.name || '',
        searchQuery: searchQuery
      }));
    }
    
    router.push('/dashboard/menu/preview-menu');
  };

  // Filter menu items based on search query
  const filteredMenuItems = React.useMemo(() => {
    if (!menuItems || !searchQuery.trim()) {
      return menuItems;
    }

    const query = searchQuery.toLowerCase();
    return menuItems.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query);
      const descriptionMatch = item.description?.toLowerCase().includes(query);
      return nameMatch || descriptionMatch;
    });
  }, [menuItems, searchQuery]);

  const removeMenu = async (menuId: string) => {
    if (!menuId) return;
    setLoading(true);
    try {
      const { deleteMenu } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');

      const response = await deleteMenu(business[0]?.businessId, menuId);

      if (response?.data?.isSuccessful) {
        toast.success('Menu deleted successfully');
        refetchCategories();
        setIsOpenDeleteMenu(false);
        setIsOpenViewMenu(true);
      } else {
        toast.error(response?.data?.error || 'Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Failed to delete menu');
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (categoryId: string) => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const { deleteCategory } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');

      const response = await deleteCategory(business[0]?.businessId, categoryId);

      if (response?.data?.isSuccessful) {
        toast.success('Category deleted successfully');
        refetchCategories();
        setIsOpenDeleteMenu(false);
        setIsOpenViewMenu(true);
      } else {
        toast.error(response?.data?.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Check permissions before rendering
  useEffect(() => {
    if (!isPermissionsLoading && role !== 0 && !userRolePermissions?.canViewMenu) {
      router.push('/dashboard/unauthorized');
    }
  }, [isPermissionsLoading, role, userRolePermissions, router]);

  if (loadingCategories && categories.length === 0) {
    return <CustomLoading ismenuPage={true} />;
  }

  if (isPermissionsLoading) {
    return <CustomLoading ismenuPage={true} />;
  }

  // Check if user has permission to view menu
  if (role !== 0 && !userRolePermissions?.canViewMenu) {
    return null; // Will redirect via useEffect
  }
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const cooperateId = userInformation ? userInformation?.cooperateID : null;
  return (
    <div className="min-h-screen font-satoshi">
      <MenuHeader
        menuSections={menuSections}
        menuItems={filteredMenuItems}
        cooperateId={cooperateId}
        businessInformation={businessInformation}
        activeSubCategory={activeSubCategory}
        isExporting={isExporting}
        handleExportCSV={handleExportCSV}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        categories={categories}
        onPreviewClick={handlePreviewClick}
      />

      <CategoryTabs
        loadingCategories={loadingCategories}
        categories={categories}
        activeCategory={activeCategory}
        handleCategorySelect={handleCategorySelect}
        setIsOpenCreateSection={setIsOpenCreateSection}
        setViewMenuMode={setViewMenuMode}
        setIsOpenViewMenu={setIsOpenViewMenu}
      />

      <MenuToolbar
        onOpen={onOpen}
        menuSections={menuSections}
        activeSubCategory={activeSubCategory}
        handleMenuSectionSelect={handleMenuSectionSelect}
        setViewMenuMode={setViewMenuMode}
        setIsOpenViewMenu={setIsOpenViewMenu}
        canCreateMenu={
          role === 0 || userRolePermissions?.canCreateMenu === true
        }
      />

      <MenuItemsGrid
        loadingItems={loadingItems}
        menuItems={filteredMenuItems || []}
        menuSections={menuSections}
        onOpen={onOpen}
        setIsAddItemModalOpen={setIsAddItemModalOpen}
        setIsAddItemChoiceModalOpen={setIsAddItemChoiceModalOpen}
        handleItemClick={handleItemClick}
        searchQuery={searchQuery}
        canCreateMenu={
          role === 0 || userRolePermissions?.canCreateMenu === true
        }
      />

      {/* Pagination */}
      {menuItems && totalPages > 1 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onNext={handleNextPage}
          onPrevious={handlePreviousPage}
        />
      )}

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onOpenChange={setIsAddItemModalOpen}
        categories={categories}
        menuSections={menuSections}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        selectedMenuType={selectedMenuType}
        setSelectedMenuType={setSelectedMenuType}
        itemName={itemName}
        setItemName={setItemName}
        itemDescription={itemDescription}
        setItemDescription={setItemDescription}
        itemPrice={itemPrice}
        setItemPrice={setItemPrice}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        handleItemImageFile={handleItemImageFile}
        imagePreview={imagePreview}
        handleRemoveItemImage={handleRemoveItemImage}
        isUploadingItemImage={isUploadingItemImage}
        dragActive={dragActive}
        setDragActive={setDragActive}
        loading={loading}
        handleCreateMenuItem={handleCreateMenuItem}
      />

      <CreateVarietyModal
        isOpen={isCreateVarietyModalOpen}
        onOpenChange={setIsCreateVarietyModalOpen}
        selectedItem={selectedItem}
        varietyName={varietyName}
        setVarietyName={setVarietyName}
        varietyPrice={varietyPrice}
        setVarietyPrice={setVarietyPrice}
        loading={loading}
        handleCreateVariety={handleCreateVariety}
        backToItemDetails={backToItemDetails}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItemFromVarietyModal}
      />

      <ItemDetailsModal
        isOpen={isItemDetailsModalOpen}
        onOpenChange={setIsItemDetailsModalOpen}
        selectedItem={selectedItem}
        openCreateVarietyModal={openCreateVarietyModal}
        varietiesLoading={varietiesLoading}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteMenuItem}
        onEditVariety={handleEditVariety}
        onDeleteVariety={handleDeleteVariety}
      />

      <SingleItemModal
        isOpen={isSingleItemModalOpen}
        onOpenChange={setIsSingleItemModalOpen}
        selectedItem={selectedItem}
        openCreateVarietyModal={openCreateVarietyModal}
        onDeleteItem={handleDeleteMenuItem}
        categories={categories}
        menuSections={menuSections}
        onItemUpdated={handleItemUpdated}
        onEditVariety={handleEditVariety}
        onDeleteVariety={handleDeleteVariety}
      />

      <EditVarietyModal
        isOpen={isEditVarietyModalOpen}
        onOpenChange={setIsEditVarietyModalOpen}
        selectedVariety={selectedVariety}
        selectedItem={selectedItem}
        onVarietyUpdated={handleVarietyUpdated}
      />

      <CreateMenuModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        name={name}
        setName={setName}
        packingCost={packingCost}
        setPackingCost={setPackingCost}
        estimatedTime={estimatedTime}
        setEstimatedTime={setEstimatedTime}
        selectedCreateSection={selectedCreateSection}
        setSelectedCreateSection={setSelectedCreateSection}
        categories={categories}
        loading={loading}
        handleCreateMenu={handleCreateMenu}
      />

      <EditMenuModal
        isOpen={isOpenEditMenu}
        onOpenChange={setIsOpenEditMenu}
        editName={editName}
        setEditName={setEditName}
        editPackingCost={editPackingCost}
        setEditPackingCost={setEditPackingCost}
        editEstimatedTime={editEstimatedTime}
        setEditEstimatedTime={setEditEstimatedTime}
        selectedEditSection={selectedEditSection}
        setSelectedEditSection={setSelectedEditSection}
        categories={categories}
        loading={loading}
        handleUpdateMenu={handleUpdateMenu}
        closeEditModal={closeEditModal}
      />

      <EditItemModal
        isOpen={isOpenEditItem}
        onOpenChange={setIsOpenEditItem}
        selectedItem={selectedItem}
        categories={categories}
        menuSections={menuSections}
        onItemUpdated={handleItemUpdated}
      />

      <ViewMenuModal
        isOpen={isOpenViewMenu}
        onOpenChange={setIsOpenViewMenu}
        viewMenuMode={viewMenuMode}
        categories={categories}
        menuSections={menuSections}
        handleEditSection={handleEditSection}
        setSelectedMenu={setSelectedMenu}
        setIsOpenDeleteMenu={setIsOpenDeleteMenu}
        handleEditMenu={handleEditMenu}
        onOpen={onOpen}
        setIsOpenCreateSection={setIsOpenCreateSection}
        onRefresh={refetchCategories}
      />

      <DeleteModal
        isOpen={isOpenDeleteMenu}
        toggleModal={() => {
          setIsOpenDeleteMenu(false);
          setIsOpenViewMenu(true);
        }}
        handleDelete={() => {
          if (selectedMenu) {
            // Check if it's a category (has categoryId) or menu (has id but not categoryId)
            if (selectedMenu.categoryId) {
              return removeCategory(selectedMenu.categoryId);
            } else {
              return removeMenu(selectedMenu.id);
            }
          }
        }}
        isLoading={loading}
        text={
          selectedMenu?.categoryId
            ? "Are you sure you want to delete this category?"
            : "Are you sure you want to delete this menu?"
        }
      />

      <CreateSectionModal
        isOpen={isOpenCreateSection}
        onOpenChange={setIsOpenCreateSection}
        sectionName={sectionName}
        setSectionName={setSectionName}
        handleCreateSection={handleCreateSection}
        loading={loading}
      />

      <EditSectionModal
        isOpen={isOpenEditSection}
        onOpenChange={setIsOpenEditSection}
        editingSectionName={editingSectionName}
        setEditingSectionName={setEditingSectionName}
        handleUpdateSection={handleUpdateSection}
        loading={loading}
        handleCancelEditSection={handleCancelEditSection}
      />

      <AddItemChoiceModal
        isOpen={isAddItemChoiceModalOpen}
        onOpenChange={setIsAddItemChoiceModalOpen}
        onSingleItemChoice={handleSingleItemChoice}
        onMultipleItemChoice={handleMultipleItemChoice}
      />

      <AddMultipleItemsModal
        isOpen={isAddMultipleItemsModalOpen}
        onOpenChange={setIsAddMultipleItemsModalOpen}
        onSuccess={handleMultipleItemsSuccess}
        activeSubCategory={activeSubCategory}
        activeCategory={activeCategory}
        menuSections={menuSections}
      />
    </div>
  );
};

export default RestaurantMenu;
