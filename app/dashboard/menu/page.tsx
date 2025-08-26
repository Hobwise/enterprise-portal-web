
"use client"
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@nextui-org/react';
import toast from 'react-hot-toast';
import useMenuCategories from '@/hooks/cachedEndpoints/useMenuCategories';
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
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import MenuHeader from '@/components/ui/dashboard/menu/MenuHeader';
import CategoryTabs from '@/components/ui/dashboard/menu/CategoryTabs';
import MenuToolbar from '@/components/ui/dashboard/menu/MenuToolbar';
import MenuItemsGrid from '@/components/ui/dashboard/menu/MenuItemsGrid';
import AddItemModal from '@/components/ui/dashboard/menu/modals/AddItemModal';
import CreateVarietyModal from '@/components/ui/dashboard/menu/modals/CreateVarietyModal';
import ItemDetailsModal from '@/components/ui/dashboard/menu/modals/ItemDetailsModal';
import SingleItemModal from '@/components/ui/dashboard/menu/modals/SingleItemModal';
import SingleVarietyModal from '@/components/ui/dashboard/menu/modals/SingleVarietyModal';
import CreateMenuModal from '@/components/ui/dashboard/menu/modals/CreateMenuModal';
import EditMenuModal from '@/components/ui/dashboard/menu/modals/EditMenuModal';
import ViewMenuModal from '@/components/ui/dashboard/menu/modals/ViewMenuModal';
import CreateSectionModal from '@/components/ui/dashboard/menu/modals/CreateSectionModal';
import EditSectionModal from '@/components/ui/dashboard/menu/modals/EditSectionModal';
import DeleteModal from '@/components/ui/deleteModal';

// Global cache for menu items to persist across category switches
const globalMenuItemsCache = new Map<string, { items: any[], timestamp: number }>();
const GLOBAL_CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

const RestaurantMenu = () => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');
  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [hasInitialized, setHasInitialized] = useState(false);

  // Modal states for menu categories
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);
  const [isOpenCreateMenu, setIsOpenCreateMenu] = useState(false);
  const [isOpenEditMenu, setIsOpenEditMenu] = useState(false);
  const [isOpenDeleteMenu, setIsOpenDeleteMenu] = useState(false);
  const [isOpenCreateSection, setIsOpenCreateSection] = useState(false);
  const [viewMenuMode, setViewMenuMode] = useState<'all' | 'current'>('all');

  // Modal states for menu items
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCreateVarietyModalOpen, setIsCreateVarietyModalOpen] = useState(false);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [isSingleItemModalOpen, setIsSingleItemModalOpen] = useState(false);
  const [isSingleVarietyModalOpen, setIsSingleVarietyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedVariety, setSelectedVariety] = useState<any>(null);
  const [varietiesLoading, setVarietiesLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(-1);

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
  const [varietyDescription, setVarietyDescription] = useState('');
  const [varietyPrice, setVarietyPrice] = useState('');
  const [varietyImage, setVarietyImage] = useState<File | null>(null);
  const [varietyImagePreview, setVarietyImagePreview] = useState('');

  // Upload loading states
  const [isUploadingItemImage, setIsUploadingItemImage] = useState(false);
  const [isUploadingVarietyImage, setIsUploadingVarietyImage] = useState(false);
  const [itemImageReference, setItemImageReference] = useState('');
  const [varietyImageReference, setVarietyImageReference] = useState('');
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

  // Fetch categories from API
  const { data: categoriesData, isLoading: loadingCategories, refetch: refetchCategories } = useMenuCategories();
  const [categories, setCategories] = useState<any[]>([]);

  // Cache management functions
  const isCacheValid = (sectionId: string): boolean => {
    const timestamp = cacheTimestamps.get(sectionId);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_EXPIRY_TIME;
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
            }));

            // Update global cache
            globalMenuItemsCache.set(section.id, {
              items: transformedItems,
              timestamp: Date.now()
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

  // Function to fetch menu items by section ID
  const fetchMenuItems = async (menuSectionId: string, forceRefresh: boolean = false) => {
    if (!menuSectionId) return;

    // Check global cache first
    if (!forceRefresh) {
      const cached = globalMenuItemsCache.get(menuSectionId);
      if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
        setMenuItems(cached.items);
        setLoadingItems(false);
        return;
      }
    }

    setLoadingItems(true);
    try {
      const response = await getMenuItems(menuSectionId, currentPage, pageSize);
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
        }));
        
        // Update global cache
        globalMenuItemsCache.set(menuSectionId, {
          items: transformedItems,
          timestamp: Date.now()
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
          // Check global cache first
          const cached = globalMenuItemsCache.get(sections[0].id);
          if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
            setMenuItems(cached.items);
          } else {
            fetchMenuItems(sections[0].id);
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
  }, [categoriesData, hasInitialized]);

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
          // Check global cache first
          const cached = globalMenuItemsCache.get(firstSection.id);
          if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
            setMenuItems(cached.items);
          } else {
            // Only set to null if we're actually going to load
            setMenuItems(null);
            setCurrentPage(1);
            fetchMenuItems(firstSection.id);
          }
        } else {
          setMenuItems([]);
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
    
    // Check global cache first
    const cached = globalMenuItemsCache.get(sectionId);
    if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
      setMenuItems(cached.items);
    } else {
      // Only set to null and show loading if we need to fetch
      const section = menuSections.find(s => s.id === sectionId);
      if (section && section.totalCount > 0) {
        setMenuItems(null);
        setCurrentPage(1);
        fetchMenuItems(sectionId);
      } else {
        setMenuItems([]);
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

  const handleVarietyImageFile = async (file: File) => {
    setIsUploadingVarietyImage(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile(business[0]?.businessId, formData);

      if (response?.data?.isSuccessful) {
        setVarietyImage(file);
        setVarietyImageReference(response.data.data);
        const reader = new FileReader();
        reader.onloadend = () => {
          setVarietyImagePreview(reader.result as string);
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
      setIsUploadingVarietyImage(false);
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

  const handleRemoveVarietyImage = async () => {
    if (!varietyImageReference) return;

    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await deleteFile(business[0]?.businessId, varietyImageReference);

      if (response?.data?.isSuccessful) {
        setVarietyImage(null);
        setVarietyImagePreview('');
        setVarietyImageReference('');
        toast.success('Image removed successfully');
      } else {
        toast.error('Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleItemClick = async (item: any, index?: number) => {
    setSelectedItem(item);
    setVarietiesLoading(true);
    if (index !== undefined) {
      setCurrentItemIndex(index);
    } else if (menuItems) {
      const itemIndex = menuItems.findIndex(i => i.id === item.id);
      setCurrentItemIndex(itemIndex);
    }

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

  const handleVarietyClick = (variety: any) => {
    setSelectedVariety(variety);
    setIsItemDetailsModalOpen(false);
    setIsSingleVarietyModalOpen(true);
  };

  const backToItemDetailsFromVariety = () => {
    setIsSingleVarietyModalOpen(false);
    setSelectedVariety(null);
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
        setVarietyDescription('');
        setVarietyPrice('');
        setVarietyImage(null);
        setVarietyImagePreview('');
        setVarietyImageReference('');
        backToItemDetails();
        if (activeSubCategory) {
          // Invalidate cache and force refresh
          globalMenuItemsCache.delete(activeSubCategory);
          fetchMenuItems(activeSubCategory, true);
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
        isAvailable: true,
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
        if (activeSubCategory) {
          // Invalidate cache and force refresh
          globalMenuItemsCache.delete(activeSubCategory);
          fetchMenuItems(activeSubCategory, true);
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
      const response = await exportGrid(business[0]?.businessId, 1);

      if (response?.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `menu-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success('Menu data exported successfully');
      } else {
        toast.error('Failed to export menu data');
      }
    } catch (error) {
      console.error('Error exporting menu data:', error);
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
        refetchCategories();
        onOpenChange();
        setName('');
        setPackingCost(undefined);
        setEstimatedTime(undefined);
        setSelectedCreateSection('');
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
    setEditingMenu(menu);
    setEditName(menu.name);
    setEditPackingCost(menu.packingCost);
    setEditEstimatedTime(menu.waitingTimeMinutes);
    setSelectedEditSection(menu.section || '');
    setIsOpenViewMenu(false);
    setIsOpenEditMenu(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;

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
        refetchCategories();
        closeEditModal();
      } else {
        toast.error(response?.data?.error || 'Failed to update menu');
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      toast.error('Failed to update menu');
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

    try {
      // TODO: Add API call to update section
      console.log('Update section:', { id: editingSectionId, name: editingSectionName });
      toast.success('Section updated successfully');
      setIsOpenEditSection(false);
      setEditingSectionName('');
      setEditingSectionId('');
      refetchCategories();
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
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
      // TODO: Add API call to create section
      console.log('Create section:', { name: sectionName });
      toast.success('Section created successfully');
      setIsOpenCreateSection(false);
      setSectionName('');
      refetchCategories();
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
      const response = await deleteMenuItem(business[0]?.businessId, itemId);

      if (response?.data?.isSuccessful) {
        toast.success('Menu item deleted successfully');
        if (activeSubCategory) {
          // Invalidate cache for this section
          globalMenuItemsCache.delete(activeSubCategory);
          fetchMenuItems(activeSubCategory, true); // Force refresh
        }
      } else {
        toast.error(response?.data?.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
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
          fetchMenuItems(activeSubCategory);
        }
      } else {
        toast.error(response?.data?.error || 'Failed to delete variety');
      }
    } catch (error) {
      console.error('Error deleting variety:', error);
      toast.error('Failed to delete variety');
    }
  };

  const handleItemUpdated = () => {
    // Refresh current menu items after edit
    if (activeSubCategory) {
      // Invalidate cache for this section
      globalMenuItemsCache.delete(activeSubCategory);
      fetchMenuItems(activeSubCategory, true); // Force refresh
    }
  };

  const handleNavigateItem = (direction: 'prev' | 'next') => {
    if (!menuItems || menuItems.length === 0) return;
    
    let newIndex = currentItemIndex;
    if (direction === 'prev' && currentItemIndex > 0) {
      newIndex = currentItemIndex - 1;
    } else if (direction === 'next' && currentItemIndex < menuItems.length - 1) {
      newIndex = currentItemIndex + 1;
    }
    
    if (newIndex !== currentItemIndex) {
      const newItem = menuItems[newIndex];
      handleItemClick(newItem, newIndex);
    }
  };

  const removeMenu = async (categoryId: string) => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const { deleteMenu } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');

      const response = await deleteMenu(business[0]?.businessId, categoryId);

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

  if (loadingCategories && categories.length === 0) {
    return <CustomLoading ismenuPage={true} />;
  }

  return (
    <div className="min-h-screen font-satoshi">
      <MenuHeader
        menuSections={menuSections}
        menuItems={menuItems}
        activeSubCategory={activeSubCategory}
        isExporting={isExporting}
        handleExportCSV={handleExportCSV}
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
      />

      <MenuItemsGrid
        loadingItems={loadingItems}
        menuItems={menuItems}
        menuSections={menuSections}
        onOpen={onOpen}
        setIsAddItemModalOpen={setIsAddItemModalOpen}
        handleItemClick={handleItemClick}
      />

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
        varietyDescription={varietyDescription}
        setVarietyDescription={setVarietyDescription}
        varietyPrice={varietyPrice}
        setVarietyPrice={setVarietyPrice}
        varietyImagePreview={varietyImagePreview}
        handleRemoveVarietyImage={handleRemoveVarietyImage}
        isUploadingVarietyImage={isUploadingVarietyImage}
        handleFileChange={handleFileChange}
        handleVarietyImageFile={handleVarietyImageFile}
        loading={loading}
        handleCreateVariety={handleCreateVariety}
        backToItemDetails={backToItemDetails}
      />

      <ItemDetailsModal
        isOpen={isItemDetailsModalOpen}
        onOpenChange={setIsItemDetailsModalOpen}
        selectedItem={selectedItem}
        openCreateVarietyModal={openCreateVarietyModal}
        varietiesLoading={varietiesLoading}
        handleVarietyClick={handleVarietyClick}
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
      />

      <SingleVarietyModal
        isOpen={isSingleVarietyModalOpen}
        onOpenChange={setIsSingleVarietyModalOpen}
        selectedVariety={selectedVariety}
        selectedItem={selectedItem}
        backToItemDetailsFromVariety={backToItemDetailsFromVariety}
        onDeleteVariety={handleDeleteVariety}
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
      />

      <DeleteModal
        isOpen={isOpenDeleteMenu}
        toggleModal={() => {
          setIsOpenDeleteMenu(false);
          setIsOpenViewMenu(true);
        }}
        handleDelete={() => selectedMenu && removeMenu(selectedMenu.id)}
        isLoading={loading}
        text="Are you sure you want to delete this menu?"
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
    </div>
  );
};

export default RestaurantMenu;
