"use client"
import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Plus, Eye, Edit, Download, ChevronRight, Upload, Star, Trash2, ArrowLeft } from 'lucide-react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
  ScrollShadow,
  Spacer,
  Spinner,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import DeleteModal from '@/components/ui/deleteModal';
import { formatPrice, getJsonItemFromLocalStorage } from '@/lib/utils';
import { RiDeleteBin6Line, RiEdit2Line } from 'react-icons/ri';
import toast from 'react-hot-toast';
import useMenuCategories from '@/hooks/cachedEndpoints/useMenuCategories';
import { getMenuItems, createMenuVariety, payloadMenuVariety, createMenuItem, payloadMenuItem, uploadFile, deleteFile, exportGrid, getMenuVariety } from '@/app/api/controllers/dashboard/menu';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import EmptyState from '@/components/ui/dashboard/menu/EmptyState';
import { VscLoading } from 'react-icons/vsc';


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

  // Preloading state management
  const [preloadedSections, setPreloadedSections] = useState<Map<string, any[]>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const [cacheTimestamps, setCacheTimestamps] = useState<Map<string, number>>(new Map());
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
  const [editEstimatedTime, setEditEstimatedTime] = useState<number | undefined>();
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

  const menus = ['All menus', 'Pasta', 'Rice', 'Swallow', 'Soups', 'Proteins', 'Extras'];

  // Cache management functions
  const isCacheValid = (sectionId: string): boolean => {
    const timestamp = cacheTimestamps.get(sectionId);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_EXPIRY_TIME;
  };

  const clearExpiredCache = () => {
    const now = Date.now();
    const newPreloadedSections = new Map(preloadedSections);
    const newTimestamps = new Map(cacheTimestamps);
    
    cacheTimestamps.forEach((timestamp, sectionId) => {
      if (now - timestamp >= CACHE_EXPIRY_TIME) {
        newPreloadedSections.delete(sectionId);
        newTimestamps.delete(sectionId);
      }
    });
    
    setPreloadedSections(newPreloadedSections);
    setCacheTimestamps(newTimestamps);
  };

  const clearAllCache = () => {
    setPreloadedSections(new Map());
    setCacheTimestamps(new Map());
  };

  // Background preloading function
  const preloadMenuSections = async (sections: any[], priority: boolean = false) => {
    if (!sections || sections.length === 0) return;

    if (!priority) {
      setIsPreloading(true);
    }

    try {
      // Use Promise.allSettled to handle failed requests gracefully
      const preloadPromises = sections.map(async (section) => {
        // Skip if already cached and valid
        if (isCacheValid(section.id) && preloadedSections.has(section.id)) {
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
              image: item.imageReference || item.image,
              description: item.itemDescription,
              category: item.menuName,
              section: section.name,
              varieties: item.varieties || []
            }));

            return { sectionId: section.id, items: transformedItems };
          }
        } catch (error) {
          console.error(`Failed to preload section ${section.id}:`, error);
          return { sectionId: section.id, error: true };
        }
      });

      const results = await Promise.allSettled(preloadPromises);
      
      // Update cache with successful results
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
  const fetchMenuItems = async (menuSectionId: string) => {
    if (!menuSectionId) return;
    
    setLoadingItems(true);
    try {
      const response = await getMenuItems(menuSectionId, currentPage, pageSize);
      if (response?.data?.isSuccessful) {
        const items = response.data.data?.items || [];
        // Transform API response to match UI structure
        const transformedItems = items.map((item: any) => ({
          id: item.id,
          name: item.itemName,
          price: item.price,
          image: item.imageReference || item.image,
          description: item.itemDescription,
          category: item.menuName,
          section: activeCategory,
          varieties: item.varieties || []
        }));
        setMenuItems(transformedItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoadingItems(false);
    }
  };

  // Progressive data fetching: Auto-initialize with first category and section
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0 && !hasInitialized) {
      setCategories(categoriesData);
      // Auto-select first category
      const firstCategory = categoriesData[0];
      if (firstCategory) {
        setActiveCategory(firstCategory.categoryId);
        const sections = firstCategory.menus[0]?.menuSections || [];
        setMenuSections(sections);
        // Auto-select first section and fetch its items
        if (sections.length > 0) {
          setActiveSubCategory(sections[0].id);
          fetchMenuItems(sections[0].id);
        }
        setHasInitialized(true);
      }
    } else if (categoriesData && categoriesData.length > 0) {
      // Just update categories if already initialized
      setCategories(categoriesData);
    }
  }, [categoriesData, hasInitialized]);

  // Cache cleanup interval
  useEffect(() => {
    // const cleanupInterval = setInterval(() => {
    //   clearExpiredCache();
    // }, 5 * 60 * 1000); // Clean up every 5 minutes

    // // Clean up on component unmount
    // return () => {
    //   clearInterval(cleanupInterval);
    // };
  }, []);

  // Handle category selection with background preloading
  const handleCategorySelect = async (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find(c => c.categoryId === categoryId);
    if (category) {
      const sections = category.menus[0]?.menuSections || [];
      setMenuSections(sections);
      
      if (sections.length > 0) {
        const firstSection = sections[0];
        setActiveSubCategory(firstSection.id);
        
        // Check if first section has items to auto-load (only during category switching)
        if (firstSection.totalCount > 0) {
          // Auto-load first section data since it has items - for category switching only
          if (isCacheValid(firstSection.id) && preloadedSections.has(firstSection.id)) {
            // Show cached data instantly
            const cachedItems = preloadedSections.get(firstSection.id);
            setMenuItems(cachedItems || []);
          } else {
            // Load first section data
            setMenuItems(null); // Show loading state
            setCurrentPage(1);
            fetchMenuItems(firstSection.id);
          }
        } else {
          // No items in first section, show empty state
          setMenuItems([]);
        }
        
        // Start background preloading for remaining sections (performance optimization)
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

  // Handle menu section selection with instant cached data display
  const handleMenuSectionSelect = (sectionId: string) => {
    setActiveSubCategory(sectionId);
    
    // Check if section is already cached from prefetch/preload
    if (isCacheValid(sectionId) && preloadedSections.has(sectionId)) {
      // Show cached data instantly - no loading state needed
      const cachedItems = preloadedSections.get(sectionId);
      setMenuItems(cachedItems || []);
    } else {
      // Fallback: fetch data if somehow not cached
      setMenuItems(null); // Show loading state
      setCurrentPage(1);
      fetchMenuItems(sectionId);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent, setActive: (value: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setActive(true);
    } else if (e.type === "dragleave") {
      setActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, setActive: (value: boolean) => void, handleFile: (file: File) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, handleFile: (file: File) => void) => {
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

  // Handle image removal
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

  const handleItemClick = async (item: any) => {
    setSelectedItem(item);
    setVarietiesLoading(true);
    
    try {
      // Fetch varieties for this item
      const response = await getMenuVariety(item.id);
      
      if (response?.data?.isSuccessful) {
        const varieties = response.data.data || [];
        // Update the item with real varieties data
        const updatedItem = { ...item, varieties };
        setSelectedItem(updatedItem);
        
        if (varieties.length > 0) {
          setIsItemDetailsModalOpen(true);
        } else {
          setIsSingleItemModalOpen(true);
        }
      } else {
        // If API fails, use existing logic
        if (item.varieties && item.varieties.length > 0) {
          setIsItemDetailsModalOpen(true);
        } else {
          setIsSingleItemModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching varieties:', error);
      // If API fails, use existing logic
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

  // Handle create variety
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

      // Check if response has validation errors
      if (response && 'errors' in response) {
        toast.error('Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Variety created successfully');
        // Reset form
        setVarietyName('');
        setVarietyDescription('');
        setVarietyPrice('');
        setVarietyImage(null);
        setVarietyImagePreview('');
        setVarietyImageReference('');
        // Go back to item details and refresh
        backToItemDetails();
        // Refresh the current menu section
        if (activeSubCategory) {
          fetchMenuItems(activeSubCategory);
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

  // Handle create menu item
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

      // Check if response has validation errors
      if (response && 'errors' in response) {
        toast.error('Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Menu item created successfully');
        // Reset form
        setItemName('');
        setItemDescription('');
        setItemPrice('');
        setSelectedSection('');
        setSelectedMenuType('');
        setItemImage(null);
        setImagePreview('');
        setItemImageReference('');
        // Close modal
        setIsAddItemModalOpen(false);
        // Refresh the current menu section
        if (activeSubCategory) {
          fetchMenuItems(activeSubCategory);
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

  // Handle export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      // gridReportType: 1 for menu data export
      const response = await exportGrid(business[0]?.businessId, 1);

      if (response?.data) {
        // Create blob and download file
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

  // Menu category handlers
  const handleCreateMenu = async () => {
    setLoading(true);
    try {
      const { createMenu } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      const payload = {
        name,
        packingCost: packingCost || 0,
        waitingTimeMinutes: estimatedTime || 0,
        section: selectedCreateSection,
      };
      
      const response = await createMenu(business[0]?.businessId, payload);
      
      if (response?.data?.isSuccessful) {
        toast.success('Menu successfully created');
        // Refetch categories to update the list
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
        section: selectedEditSection,
      };
      
      const response = await updateMenu(business[0]?.businessId, editingMenu.id, payload);
      
      if (response?.data?.isSuccessful) {
        toast.success('Menu updated successfully');
        // Refetch categories to update the list
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

  // Edit Section handlers (for category/section names)
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
      // Refetch categories to update the list
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


  const closeCreateModal = () => {
    setIsOpenCreateMenu(false);
  };


  const removeMenu = async () => {
    if (!selectedMenu) return;
    setLoading(true);
    try {
      const { deleteMenu } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      
      const response = await deleteMenu(business[0]?.businessId, selectedMenu.id);
      
      if (response?.data?.isSuccessful) {
        toast.success('Menu deleted successfully');
        // Refetch categories to update the list
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

  // Show initial loading state
  if (loadingCategories && categories.length === 0) {
    return <CustomLoading ismenuPage={true} />;
  }

  return (
    <div className="min-h-screen ">

      {/* Page Title */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Menu</h1>
            <p className="text-gray-500 text-sm mt-1">
              {menuSections.length > 0 
                ? `Showing ${menuItems?.length || 0} items in ${menuSections.find(s => s.id === activeSubCategory)?.name || 'menu'}`
                : 'Showing all menu items'
              }
            </p>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="text-gray-700 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#EAE5FF] rounded-md">
        <div className="flex items-center px-4 gap-6 py-2">
          <button 
            onClick={() => setIsOpenCreateSection(true)}
            className="border-2 border-gray-700 -mr-3 rounded-full"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </button>
          {loadingCategories ? (
            <div className="flex items-center gap-1 px-4">
              <Spinner size="sm" />
              <span className="text-sm text-gray-600">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <span className="text-sm text-gray-500">No categories available</span>
          ) : (
            categories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => handleCategorySelect(category.categoryId)}
                className={` px-2 border-b-2 transition-colors ${
                  activeCategory === category.categoryId
                    ? 'border-[#5F35D2] text-[#5F35D2] font-medium'
                    : 'border-transparent text-[#6C7278] hover:text-gray-800'
                }`}
              >
                {category.categoryName}
              </button>
            ))
          )}
          <button onClick={() => {
            setViewMenuMode('current');
            setIsOpenViewMenu(true);
          }} className="ml-auto p-2 text-[#5F35D2]">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
        <div className="flex items-center my-3 py-3 gap-6">
          {/* Fixed left button */}
          <button onClick={onOpen} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-[#5F35D2] text-[#5F35D2] rounded-lg hover:bg-[#EAE5FF]">
            <span>Create new menu</span>
            <Plus className="w-4 h-4" />
          </button>
          
          {/* Scrollable menu sections container */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 min-w-max">
              {menuSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleMenuSectionSelect(section.id)}
                  className={`flex-shrink-0 px-4 py-2 bg-[#EAE5FF] rounded-lg transition-colors whitespace-nowrap ${
                    activeSubCategory === section.id
                      ? 'bg-primaryColor text-white'
                      : 'text-gray-600 hover:bg-[#EAE5FF]'
                  }`}
                >
                  {section.name} {section.totalCount > 0 && `(${section.totalCount})`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Fixed right buttons */}
          <div className="flex-shrink-0 flex gap-2">
            <button className="text-gray-700 p-2  hover:bg-[#EAE5FF] rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => {
              setViewMenuMode('all');
              setIsOpenViewMenu(true);
            }} className="p-2 text-gray-600 hover:bg-[#EAE5FF] rounded-lg">
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Menu Items Grid */}
      <div className="p-6">
        {loadingItems || menuItems === null ? (
          <SpinnerLoader size="md"/>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {/* Add New Item Card */}
            <div 
              onClick={() => setIsAddItemModalOpen(true)}
              className="bg-white border rounded-lg shadow p-6 flex flex-col items-center justify-center hover:border-[#5F35D2] cursor-pointer transition-colors h-[170px]"
            >
                <img src="/assets/icons/menu.svg" alt="add" />
              <span className="text-gray-600 text-sm font-medium">Add new item</span>
            </div>

            {/* Menu Items */}
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item)}
                  className="bg-white border rounded-lg shadow  hover:shadow-md h-[170px] transition-shadow cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('data:') || item.image.startsWith('http') 
                          ? item.image 
                          : `data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        className="w-full h-[120px] object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Rectangle 161125908.png';
                        }}
                      />
                    ) : (
                      <div className="w-full  h-[120px] bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="px-1.5 mt-1">
                    <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">{item.name}</h3>
                    <p className="text-xs font-semibold text-gray-900">
                      ₦{item.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              !loadingItems && menuSections.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    title="No menu sections available"
                    description="Create a menu section to add items to this category."
                    actionButton={{
                      text: "Create Menu",
                      onClick: onOpen
                    }}
                  />
                </div>
              )
            )}
            {!loadingItems && menuItems !== null && menuSections.length > 0 && menuItems.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No items in this menu section"
                  description="Click 'Add new item' to get started with your first menu item."
                  actionButton={{
                    text: "Add New Item",
                    onClick: () => setIsAddItemModalOpen(true)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddItemModalOpen}
        size="5xl"
        onOpenChange={(open) => setIsAddItemModalOpen(open)}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
          <div className="bg-white rounded-xl p-3 py-4 w-full  max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Add menu item</h2>
                <p className="text-sm text-gray-500 mt-1">Add an item to your menu</p>
              </div>
              <button 
                onClick={() => alert('Create Variety clicked')}
                className="text-gray-700 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                <span>Create Variety</span>
              </button>
            </div>


            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select section
                  </label>
                  <select 
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                  >
                    <option value="">Select section</option>
                    {categories.map(category => (
                      <option key={category.categoryId} value={category.categoryName}>{category.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select menu
                  </label>
                  <select 
                    value={selectedMenuType}
                    onChange={(e) => setSelectedMenuType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                  >
                    <option value="">Select menu</option>
                    {menuSections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name of item
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item description
                  </label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Value"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] resize-none text-gray-700"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add item price
                  </label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="Enter value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <div 
                    className={` rounded-lg flex justify-center items-center h-[280px] bg-[#6D42E2]/10 p-8 text-center ${
                      dragActive ? ' border-[#6D42E2] border-2 ' : 'border-gray-300'
                    } ${imagePreview ? 'border-solid' : ''}`}
                    onDragEnter={(e) => handleDrag(e, setDragActive)}
                    onDragLeave={(e) => handleDrag(e, setDragActive)}
                    onDragOver={(e) => handleDrag(e, setDragActive)}
                    onDrop={(e) => handleDrop(e, setDragActive, handleItemImageFile)}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemoveItemImage}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center w-1/2 justify-center mb-4">
                          <div className="w-20 h-20  rounded-lg flex items-center justify-center">
                            {isUploadingItemImage ? (
                              <Spinner size="lg" />
                            ) : (
                       <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M27.0104 31.8327H3.67708V8.49935H18.6771V5.16602H3.67708C1.84375 5.16602 0.34375 6.66602 0.34375 8.49935V31.8327C0.34375 33.666 1.84375 35.166 3.67708 35.166H27.0104C28.8438 35.166 30.3438 33.666 30.3438 31.8327V16.8327H27.0104V31.8327ZM14.0271 26.5493L10.7604 22.616L6.17708 28.4993H24.5104L18.6104 20.6493L14.0271 26.5493ZM30.3438 5.16602V0.166016H27.0104V5.16602H22.0104C22.0271 5.18268 22.0104 8.49935 22.0104 8.49935H27.0104V13.4827C27.0271 13.4993 30.3438 13.4827 30.3438 13.4827V8.49935H35.3438V5.16602H30.3438Z" fill="#6D42E2"/>
</svg>

                            )}
                          </div>
                        {!isUploadingItemImage && (
                          <p className="text-sm text-gray-600 mb-2">
                            Drag and drop files to upload or{' '}
                            <label className="text-[#5F35D2] cursor-pointer hover:text-[#7C69D8] font-medium">
                              click here
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, handleItemImageFile)}
                              />
                            </label>
                            {' '}to browse
                          </p>
                        )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back to menu
              </button>
              <button
                onClick={handleCreateMenuItem}
                disabled={loading}
                className="px-6 py-2.5 bg-primaryColor text-white rounded-lg hover:bg-primaryColor font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Save item'}
              </button>
            </div>
          </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
   
 
        {/* Create Variety Modal */}
        <Modal
        isOpen={isCreateVarietyModalOpen && selectedItem !== null}
        size="5xl"
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateVarietyModalOpen(false);
          }
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                  <div className="p-3">
                    <h2 className="text-2xl font-semibold text-gray-900">Create variety</h2>
                    <p className="text-sm text-gray-500 mt-1">Add an item to your menu</p>
                  </div>

            {/* Item Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name}
                
                className="w-20 h-20 rounded-lg object-cover bg-orange-500"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">{selectedItem.category}</p>
                <p className="font-semibold text-gray-900">
                  ₦{selectedItem.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">{selectedItem.description}</p>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name of new variety
                  </label>
                  <input
                    type="text"
                    value={varietyName}
                    onChange={(e) => setVarietyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a description
                  </label>
                  <textarea
                    value={varietyDescription}
                    onChange={(e) => setVarietyDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] resize-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a price
                  </label>
                  <input
                    type="number"
                    value={varietyPrice}
                    onChange={(e) => setVarietyPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                  />
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                <div 
                  className={`h-[280px] bg-[#6D42E2]/10 flex items-center justify-center rounded-lg p-12 text-center ${
                    varietyImagePreview ? 'border-solid border-gray-300' : 'border-gray-300'
                  }`}
                >
                  {varietyImagePreview ? (
                    <div className="relative">
                      <img 
                        src={varietyImagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={handleRemoveVarietyImage}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center flex-col items-center w-1/2 mb-4">
                        <div className="w-20 h-20  rounded-lg flex items-center justify-center">
                          {isUploadingVarietyImage ? (
                            <Spinner size="lg" />
                          ) : (
                       <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M27.0104 31.8327H3.67708V8.49935H18.6771V5.16602H3.67708C1.84375 5.16602 0.34375 6.66602 0.34375 8.49935V31.8327C0.34375 33.666 1.84375 35.166 3.67708 35.166H27.0104C28.8438 35.166 30.3438 33.666 30.3438 31.8327V16.8327H27.0104V31.8327ZM14.0271 26.5493L10.7604 22.616L6.17708 28.4993H24.5104L18.6104 20.6493L14.0271 26.5493ZM30.3438 5.16602V0.166016H27.0104V5.16602H22.0104C22.0271 5.18268 22.0104 8.49935 22.0104 8.49935H27.0104V13.4827C27.0271 13.4993 30.3438 13.4827 30.3438 13.4827V8.49935H35.3438V5.16602H30.3438Z" fill="#6D42E2"/>
</svg>

                          )}
                        </div>
                        {!isUploadingVarietyImage && (
                          <p className="text-sm text-gray-600">
                            Drag and drop files to upload or{' '}
                            <label className="text-[#5F35D2] cursor-pointer hover:text-[#7C69D8] font-medium">
                              click here
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, handleVarietyImageFile)}
                              />
                            </label>
                            {' '}to browse
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
              </ModalBody>
              <ModalFooter className='mb-3'>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={backToItemDetails}
                >
                  Back to item
                </Button>
                <Button
                  onPress={handleCreateVariety}
                  disabled={loading}
                  className="bg-[#5F35D2] text-white"
                >
                  {loading ? 'Creating...' : 'Save new variety'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

       {/* Item Details Modal with Varieties */}
       <Modal
        isOpen={isItemDetailsModalOpen && selectedItem !== null}
        size="5xl"
        onOpenChange={(open) => {
          if (!open) {
            setIsItemDetailsModalOpen(false);
          }
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <button 
                onClick={() => setIsItemDetailsModalOpen(false)}
                className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to menu</span>
              </button>
            
                    <div className="flex items-center gap-2">
                <button className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => openCreateVarietyModal(selectedItem)}
                  className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className='text-gray-700'>Create variety</span>
                </button>
                <button className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Main Item */}
                <div>
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    className="w-full aspect-square rounded-lg object-cover bg-orange-500"
                  />
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedItem.description}</p>
                    <p className="text-sm text-gray-500 mt-2">{selectedItem.category}</p>
                    <p className="text-2xl font-bold mt-4">
                      ₦{selectedItem.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Varieties */}
                <div className="col-span-2">
                  <div className="space-y-4">
                    {varietiesLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="lg" />
                        <p className="ml-4 text-gray-600">Loading varieties...</p>
                      </div>
                    ) : (
                      selectedItem.varieties?.map((variety: any) => (
                        <div 
                          key={variety.id} 
                          onClick={() => handleVarietyClick(variety)}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <img 
                            src={variety.image} 
                            alt={variety.name}
                            className="w-20 h-20 rounded-lg object-cover bg-cyan-500"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{variety.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{variety.description}</p>
                            <p className="text-sm text-gray-500 mt-1">{selectedItem.category}</p>
                            <p className="font-bold mt-2">
                              ₦{variety.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button className="text-gray-700 p-2 hover:bg-gray-200 rounded">
                            <Star className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Single Item Modal (No Varieties) */}
      <Modal
        isOpen={isSingleItemModalOpen && selectedItem !== null}
        size="5xl"
        onOpenChange={(open) => {
          if (!open) {
            setIsSingleItemModalOpen(false);
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <button 
                onClick={() => setIsSingleItemModalOpen(false)}
                className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to menu</span>
              </button>
              <div className="flex items-center gap-2">
                <button className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => openCreateVarietyModal(selectedItem)}
                  className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create variety</span>
                </button>
                <button className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex gap-6">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  className="w-64 h-64 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">{selectedItem.name}</h2>
                  <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                  <p className="text-2xl font-bold mb-4">
                    ₦{selectedItem.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Category:</span> {selectedItem.category}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Section:</span> {selectedItem.section}
                    </p>
                    {selectedItem.packingCost && (
                      <p className="text-gray-600">
                        <span className="font-medium">Packing Cost:</span> ₦{selectedItem.packingCost.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {selectedItem.preparationTime && (
                      <p className="text-gray-600">
                        <span className="font-medium">Preparation Time:</span> {selectedItem.preparationTime} minutes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Single Variety Modal */}
      <Modal
        isOpen={isSingleVarietyModalOpen && selectedVariety !== null}
        size="5xl"
        onOpenChange={(open) => {
          if (!open) {
            setIsSingleVarietyModalOpen(false);
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <button 
                onClick={backToItemDetailsFromVariety}
                className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to item details</span>
              </button>
              <div className="flex items-center gap-2">
                <button className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex gap-6">
                <img 
                  src={selectedVariety?.image || '/Rectangle 161125908.png'} 
                  alt={selectedVariety?.name}
                  className="w-64 h-64 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Rectangle 161125908.png';
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">{selectedVariety?.name}</h2>
                  <p className="text-gray-600 mb-4">{selectedVariety?.description || 'No description available'}</p>
                  <p className="text-2xl font-bold mb-4">
                    ₦{selectedVariety?.price?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Unit:</span> {selectedVariety?.unit}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Main Item:</span> {selectedItem?.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Category:</span> {selectedItem?.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Create Menu Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Create Menu
                </h2>
                <p className="text-sm  text-grey600  xl:w-[231px]  w-full mb-4">
                  Create a menu to add item
                </p>
                <CustomInput
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  value={name}
                  label="Name of menu"
                  placeholder="E.g Drinks"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select section
                  </label>
                  <select 
                    value={selectedCreateSection}
                    onChange={(e) => setSelectedCreateSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]"
                  >
                    <option value="">Select a section</option>
                    {categories.map(category => (
                      <option key={category.categoryId} value={category.categoryName}>{category.categoryName}</option>
                    ))}
                  </select>
                </div>
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setPackingCost(value || undefined);
                    }
                  }}
                  value={packingCost !== undefined ? String(packingCost) : ''}
                  label="Packing cost (Optional)"
                  placeholder="This is a cost required to pack any item in this menus"
                  min="0"
                />
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setEstimatedTime(value || undefined);
                    }
                  }}
                  value={estimatedTime !== undefined ? String(estimatedTime) : ''}
                  label="Preparation time in minutes (Optional)"
                  placeholder="This is the estimated time required to prepare any item in this menus"
                  min="0"
                />
                <Spacer y={2} />

                <CustomButton
                  loading={loading}
                  onClick={handleCreateMenu}
                  disabled={!name || loading}
                  type="submit"
                >
                  {loading ? "Loading" : "Proceed"}
                </CustomButton>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Menu Modal */}
      <Modal
        isOpen={isOpenEditMenu}
        size="md"
        onOpenChange={(open) => {
          if (!open) {
            closeEditModal();
          }
          setIsOpenEditMenu(open);
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Edit Menu
                </h2>
                <p className="text-sm text-grey600 xl:w-[231px] w-full mb-4">
                  Update menu details
                </p>
                <CustomInput
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditName(e.target.value)
                  }
                  value={editName}
                  label="Name of menu"
                  placeholder="E.g Drinks"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select section
                  </label>
                  <select 
                    value={selectedEditSection}
                    onChange={(e) => setSelectedEditSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]"
                  >
                    <option value="">Select a section</option>
                    {categories.map(category => (
                      <option key={category.categoryId} value={category.categoryName}>{category.categoryName}</option>
                    ))}
                  </select>
                </div>
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setEditPackingCost(value || undefined);
                    }
                  }
                  }
               
                  
                  value={
                    editPackingCost !== undefined
                      ? String(editPackingCost)
                      : ""
                  }
                  label="Packing cost (Optional)"
                  placeholder="This is a cost required to pack any item in this menus"
                />
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setEditEstimatedTime(value || undefined);
                    }
                  }}
                  value={
                    editEstimatedTime !== undefined
                      ? String(editEstimatedTime)
                      : ""
                  }
                  label="Preparation time in minutes (Optional)"
                  placeholder="This is the estimated time required to prepare any item in this menus"
                  min="0"
                />
                <Spacer y={2} />

                <div className="flex gap-2">
                  <CustomButton
                    onClick={() => closeEditModal()}
                    className="flex-1 text-gray-700"
                    backgroundColor="bg-gray-200"
                  >
                    Cancel
                  </CustomButton>

                  <CustomButton
                    loading={loading}
                    onClick={handleUpdateMenu}
                    disabled={!editName || loading}
                    type="submit"
                    className="flex-1 text-white"
                  >
                    {loading ? "Loading" : "Update Menu"}
                  </CustomButton>
                </div>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View All Menus Modal */}
      <Modal
        isOpen={isOpenViewMenu}
        size="md"
        onOpenChange={(open) => setIsOpenViewMenu(open)}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 mb-2 text-black font-semibold">
                  {viewMenuMode === 'current' ? 'Menu Sections' : 'All menus'}
                </h2>

                <ScrollShadow size={5} className="w-full max-h-[350px]">
                  {viewMenuMode === 'current' ? (
                    // Eye button: Show categories list
                    categories && categories.length > 0 ? (
                      categories.map((category: any) => (
                        <div
                          className="text-black flex justify-between text-sm border-b border-primaryGrey py-3"
                          key={category.categoryId}
                        >
                          <div>
                            <p className="font-medium">{category.categoryName || 'Uncategorized'}</p>
                          </div>
                          <div className="flex items-center">
                            <Tooltip color="secondary" content={"Edit Section"}>
                              <span className="mr-3">
                                <RiEdit2Line
                                  onClick={() => handleEditSection(category)}
                                  className="text-[18px] text-[#5F35D2] cursor-pointer"
                                />
                              </span>
                            </Tooltip>
                            <Tooltip color="danger" content={"Delete"}>
                              <span>
                                <RiDeleteBin6Line
                                  onClick={() => {
                                    setSelectedMenu(category);
                                    setIsOpenViewMenu(false);
                                    setIsOpenDeleteMenu(true);
                                  }}
                                  className="text-[18px] text-[#dc2626] cursor-pointer"
                                />
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4">
                        <EmptyState
                          title="No categories available"
                          description="Create a new section to organize your menu items."
                          actionButton={{
                            text: "Create Section",
                            onClick: () => {
                              setIsOpenViewMenu(false);
                              setIsOpenCreateSection(true);
                            }
                          }}
                        />
                      </div>
                    )
                  ) : (
                    // Edit button: Show only current category's menuSections
                    menuSections && menuSections.length > 0 ? (
                      menuSections.map((section: any) => (
                        <div
                          className="text-black flex justify-between text-sm border-b border-primaryGrey py-3"
                          key={section.id}
                        >
                          <div>
                            <p className="font-medium">{section.name}</p>
                          </div>
                          <div className="flex items-center">
                            <Tooltip color="secondary" content={"Edit Menu"}>
                              <span className="mr-3">
                                <RiEdit2Line
                                  onClick={() => handleEditMenu(section)}
                                  className="text-[18px] text-[#5F35D2] cursor-pointer"
                                />
                              </span>
                            </Tooltip>
                            <Tooltip color="danger" content={"Delete Menu"}>
                              <span>
                                <RiDeleteBin6Line
                                  onClick={() => {
                                    setSelectedMenu(section);
                                    setIsOpenViewMenu(false);
                                    setIsOpenDeleteMenu(true);
                                  }}
                                  className="text-[18px] text-[#dc2626] cursor-pointer"
                                />
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4">
                        <EmptyState
                          title="No menu sections in this category"
                          description="Create a new menu to add items to this category."
                          actionButton={{
                            text: "Create Menu",
                            onClick: () => {
                              setIsOpenViewMenu(false);
                              onOpen();
                            }
                          }}
                        />
                      </div>
                    )
                  )}
                </ScrollShadow>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Menu Modal */}
      <DeleteModal
        isOpen={isOpenDeleteMenu}
        toggleModal={() => {
          setIsOpenDeleteMenu(false);
          setIsOpenViewMenu(true);
        }}
        handleDelete={removeMenu}
        isLoading={loading}
        text="Are you sure you want to delete this menu?"
      />
      
      {/* Create Section Modal */}
      <Modal
        isOpen={isOpenCreateSection}
        size="md"
        onOpenChange={(open) => {
          if (!open) {
            setSectionName('');
          }
          setIsOpenCreateSection(open);
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Create new section
                </h2>
                <p className="text-sm text-grey600 mb-4">
                  Create sections to manage your order
                </p>
                <CustomInput
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSectionName(e.target.value)
                  }
                  value={sectionName}
                  label="Name of section"
                  placeholder="Enter section name"
                />
                <Spacer y={2} />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={() => {
                    setSectionName('');
                    setIsOpenCreateSection(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    console.log('Create section:', sectionName);
                    // TODO: Add API call to create section
                    setSectionName('');
                    setIsOpenCreateSection(false);
                    toast.success('Section created successfully');
                  }}
                  disabled={!sectionName || !sectionName.trim()}
                  className="bg-primaryColor"
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Edit Section Modal */}
      <Modal
        isOpen={isOpenEditSection}
        size="md"
        onOpenChange={(open) => {
          if (!open) {
            setEditingSectionName('');
            setEditingSectionId('');
          }
          setIsOpenEditSection(open);
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Update section
                </h2>
                <p className="text-sm text-grey600 mb-4">
                  Update section name
                </p>
                <CustomInput
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingSectionName(e.target.value)
                  }
                  value={editingSectionName}
                  label="Name of section"
                  placeholder="Enter section name"
                />
                <Spacer y={2} />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={handleCancelEditSection}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateSection}
                  disabled={!editingSectionName || !editingSectionName.trim()}
                  className="bg-[#5F35D2] text-white"
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RestaurantMenu;