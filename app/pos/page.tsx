"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, List, Plus, Minus, X, ShoppingCart, Menu } from "lucide-react";
import Header from "@/components/ui/dashboard/header";
import { getPOSMenu, POSSection } from "@/app/api/controllers/pos";
import { notify, getJsonItemFromLocalStorage, formatPrice } from "@/lib/utils";
import { Checkbox, Button, Divider, Spacer, useDisclosure } from "@nextui-org/react";
import CheckoutModal from "@/components/ui/dashboard/orders/place-order/checkoutModal";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa6";
import noMenu from "../../public/assets/images/no-menu.png";
import { useRouter } from "next/navigation";

// Define Item type matching place-order
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
  image?: string;
  isVariety: boolean;
  varieties: null | any;
  count: number;
  packingCost: number;
  isPacked?: boolean;
};

const POSpage = () => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState("All Menus");
  const [selectedSection, setSelectedSection] = useState("All");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [includePacking, setIncludePacking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posData, setPosData] = useState<POSSection[]>([]);
  const [orderItems, setOrderItems] = useState<Item[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Business information
  const businessInformation = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  // Fetch POS menu data on mount
  useEffect(() => {
    fetchPOSMenuData();
  }, []);

  const fetchPOSMenuData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get businessId from localStorage
      const businesses = getJsonItemFromLocalStorage('business');
      const businessId = businesses?.[0]?.businessId;

      const response = await getPOSMenu(businessId);

      console.log('POS Menu API Response:', response);

      // Check if we have data in the response (following codebase pattern)
      if (response?.data) {
        const menuData = response.data;

        // Check if the response has the expected structure
        if (menuData.isSuccessful && menuData.data) {
          setPosData(menuData.data);
        } else if (menuData.data) {
          // Sometimes API returns data directly without isSuccessful flag
          setPosData(menuData.data);
        } else {
          setError('Failed to load menu data');
          notify({
            title: 'Error',
            text: 'Failed to load menu data',
            type: 'error'
          });
        }
      } else {
        setError('No menu data available');
        notify({
          title: 'Error',
          text: 'No menu data available',
          type: 'error'
        });
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while loading menu');
      notify({
        title: 'Error',
        text: err?.message || 'An error occurred while loading menu',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Extract categories from API data
  const categories = React.useMemo(() => {
    const allCategories = new Set<string>();
    allCategories.add("All Menus");

    posData.forEach((section) => {
      section.menus.forEach((menu) => {
        if (menu.name && menu.name.trim()) {
          allCategories.add(menu.name);
        }
      });
    });

    return Array.from(allCategories);
  }, [posData]);

  // Extract main tabs (sections) from API data
  const mainTabs = React.useMemo(() => {
    return posData.map(section => section.name);
  }, [posData]);

  // Get menu items based on selected section and category
  const menuItems = React.useMemo(() => {
    const items: any[] = [];
    const seenItemIds = new Set<string>();

    const sectionsToProcess = selectedSection === "All"
      ? posData
      : posData.filter(section => section.name === selectedSection);

    sectionsToProcess.forEach((section) => {
      section.menus.forEach((menu) => {
        // Filter by category if not "All Menus"
        if (selectedCategory === "All Menus" || menu.name === selectedCategory) {
          menu.items.forEach((item) => {
            // Create a unique key for each item to avoid duplicates
            const uniqueKey = `${section.id}-${menu.id}-${item.id}`;

            // Only add if we haven't seen this exact combination before
            if (!seenItemIds.has(uniqueKey)) {
              seenItemIds.add(uniqueKey);
              items.push({
                ...item,
                uniqueKey: uniqueKey, // Add unique key for React
                menuName: menu.name,
                menuId: menu.id,
                packingCost: menu.packingCost,
                waitingTimeMinutes: menu.waitingTimeMinutes,
                sectionName: section.name,
                sectionId: section.id,
              });
            }
          });
        }
      });
    });

    return items;
  }, [posData, selectedSection, selectedCategory]);

  const handleDecrement = useCallback((id: string) => {
    if (isUpdating) return; // Prevent concurrent updates

    setIsUpdating(true);

    setOrderItems((prevItems: Item[]) => {
      // Filter out items with count <= 1 first, then decrement others
      const updatedItems = prevItems
        .filter((item: Item) => !(item.id === id && item.count <= 1))
        .map((item: Item) =>
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

    setOrderItems((prevItems) => {
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
          const newItem: Item = {
            ...menuItem,
            id: menuItem.uniqueKey || menuItem.id,
            itemID: menuItem.id,
            itemName: menuItem.itemName,
            menuName: menuItem.menuName,
            itemDescription: menuItem.itemDescription || '',
            price: menuItem.price,
            currency: menuItem.currency,
            isAvailable: menuItem.isAvailable,
            hasVariety: menuItem.hasVariety,
            image: '',
            isVariety: false,
            varieties: null,
            count: 1,
            isPacked: false,
            packingCost: menuItem.packingCost || 0
          };
          setTimeout(() => setIsUpdating(false), 100);
          return [...prevItems, newItem];
        }
        setTimeout(() => setIsUpdating(false), 100);
        return prevItems;
      }
    });
  }, [isUpdating, menuItems]);

  const handlePackingCost = useCallback((itemId: string, isPacked: boolean) => {
    if (isUpdating) return; // Prevent concurrent updates

    setOrderItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          // Find the menu item to get the correct packingCost using itemID
          const menuItem = menuItems?.find((menu: any) => menu.id === item.itemID);
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

  const calculateTotalPrice = () => {
    return orderItems.reduce((acc, item) => {
      const itemTotal = item.price * item.count;
      // Allow packing even when packingCost is 0 or undefined
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      return acc + itemTotal + packingTotal;
    }, 0);
  };

  const subtotal = calculateTotalPrice();
  const vatAmount = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + vatAmount;

  // Add item from API to cart
  const addItemToCart = (item: any) => {
    if (!item.isAvailable) {
      notify({
        title: 'Unavailable',
        text: 'This item is currently unavailable',
        type: 'error'
      });
      return;
    }

    // Use uniqueKey for cart items to prevent duplicates from different sections/menus
    const cartItemId = item.uniqueKey || item.id;
    const existingItem = orderItems.find((orderItem: Item) => orderItem.id === cartItemId);

    if (existingItem) {
      // If item exists, increase count
      handleIncrement(existingItem.id);
    } else {
      // Add new item with proper structure
      const newItem: Item = {
        id: cartItemId,
        itemID: item.id, // Keep original item ID for reference
        itemName: item.itemName,
        menuName: item.menuName,
        itemDescription: item.itemDescription || '',
        price: item.price,
        currency: item.currency,
        isAvailable: item.isAvailable,
        hasVariety: item.hasVariety,
        image: '',
        isVariety: false,
        varieties: null,
        count: 1,
        packingCost: item.packingCost || 0,
        isPacked: false,
      };
      setOrderItems((prev) => [...prev, newItem]);
      notify({
        title: 'Added to cart',
        text: `${item.itemName} added to cart`,
        type: 'success'
      });
    }
  };

  // Calculate total order items for badge
  const orderItemCount = orderItems.reduce((sum, item) => sum + item.count, 0);

  // Modal handlers
  const openOrderModal = () => setIsOrderModalOpen(true);
  const closeOrderModal = () => setIsOrderModalOpen(false);
  const toggleCategoryMenu = () => setIsCategoryMenuOpen(!isCategoryMenuOpen);

  // Item details modal handlers
  const openItemModal = (item: any) => {
    setSelectedItem(item);
    setIncludePacking(false);
    setIsItemModalOpen(true);
  };
  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setSelectedItem(null);
    setIncludePacking(false);
  };

  // Add item from modal to cart
  const addItemFromModal = () => {
    if (!selectedItem || !selectedItem.isAvailable) {
      notify({
        title: 'Unavailable',
        text: 'This item is currently unavailable',
        type: 'error'
      });
      return;
    }

    const cartItemId = selectedItem.uniqueKey || selectedItem.id;
    const existingItem = orderItems.find((orderItem: Item) => orderItem.id === cartItemId);

    if (existingItem) {
      // Update packing if changed and increment
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId
            ? { ...item, isPacked: includePacking, count: item.count + 1 }
            : item
        )
      );
    } else {
      const newItem: Item = {
        id: cartItemId,
        itemID: selectedItem.id,
        itemName: selectedItem.itemName,
        menuName: selectedItem.menuName,
        itemDescription: selectedItem.itemDescription || '',
        price: selectedItem.price,
        currency: selectedItem.currency,
        isAvailable: selectedItem.isAvailable,
        hasVariety: selectedItem.hasVariety,
        image: '',
        isVariety: false,
        varieties: null,
        count: 1,
        packingCost: selectedItem.packingCost || 0,
        isPacked: includePacking,
      };
      setOrderItems((prev) => [...prev, newItem]);
      notify({
        title: 'Added to cart',
        text: `${selectedItem.itemName} added to cart${includePacking ? ' with packing' : ''}`,
        type: 'success'
      });
    }
    closeItemModal();
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex h-screen overflow-hidden bg-white">
      <main className="flex-1 w-full overflow-y-auto  text-black">
        <Header ispos />

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center border-b border-gray-200 px-4 sm:px-6 w-full">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-lg font-medium">Today Menu</h2>
            <p className="text-xs mb-2 lg:mb-6">Showing all items on orders</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pb-3 lg:px-6 lg:py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search here..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-gray-100 focus:border-gray-100 text-sm"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard/orders?from=pos')}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-[#5F35D2] border border-[#5F35D2] rounded-md hover:bg-purple-50 text-sm"
              >
                <List className="w-4 h-4 text-[#5F35D2]" />
                <span className="hidden sm:inline">Order list</span>
              </button>

            </div>
          </div>
        </div>
        {/* Mobile Category Toggle Button */}
        <div className="lg:hidden bg-[#391D84] px-4 py-2">
          <button
            onClick={toggleCategoryMenu}
            className="flex items-center space-x-2 text-white"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">{selectedCategory}</span>
          </button>
        </div>

        {/* Mobile Category Dropdown */}
        {isCategoryMenuOpen && (
          <div className="lg:hidden bg-[#391D84] border-t border-purple-600">
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 gap-1 p-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`py-2 px-3 text-center rounded text-xs transition-colors ${
                      selectedCategory === category
                        ? "bg-[#251258] text-white"
                        : "text-purple-200 hover:bg-purple-700 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="h-[83vh] lg:h-[83vh] bg-gray-50 flex">
          {/* Main Content Container */}
          <div className="flex flex-1 overflow-hidden bg-white">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-48 bg-[#391D84] text-white overflow-y-auto">
              <div className="py-1">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full py-2.5 text-center rounded text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-[#251258] text-white"
                          : "text-purple-200 hover:bg-purple-700 hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Navigation */}
              <div className="bg-[#5F35D2]">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {mainTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedSection(tab)}
                      className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 ${
                        selectedSection === tab
                          ? "text-white bg-[#A07EFF]"
                          : "text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Grid */}
              <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
                {loading ? (
                  // Loading skeleton
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {[...Array(12)].map((_, index) => (
                      <div key={index} className="bg-gray-200 animate-pulse rounded-lg min-h-[120px]" />
                    ))}
                  </div>
                ) : error ? (
                  // Error state
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                      onClick={fetchPOSMenuData}
                      className="px-4 py-2 bg-[#5F35D2] text-white rounded-md hover:bg-purple-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : menuItems.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500">No items available in this category</p>
                  </div>
                ) : (
                  // Menu items grid
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {menuItems.map((item) => (
                      <div
                        key={item.uniqueKey || item.id}
                        onClick={() => item.isAvailable && openItemModal(item)}
                        className={`bg-gradient-to-t from-[#EAE1FF] to-[#fff] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[120px] flex flex-col cursor-pointer ${
                          item.isAvailable ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="p-3 sm:p-4 flex flex-col items-center flex-1 relative">

                          <h3 className="font-medium text-center text-gray-900 text-xs sm:text-sm mb-1 leading-tight">
                            {item.itemName}
                          </h3>

                          <p className="text-xs font-semibold text-purple-700 mt-auto">
                            {formatPrice(item.price, item.currency)}
                          </p>
                          {/* {item.hasVariety && (
                            <span className="text-xs text-blue-600 mt-1">Has varieties</span>
                          )} */}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToCart(item);
                          }}
                          disabled={!item.isAvailable}
                          className={`w-full py-2 px-4 rounded-b-lg text-xs sm:text-sm transition-all duration-200 touch-manipulation ${
                            item.isAvailable
                              ? 'bg-gradient-to-t from-[#5F35D2] to-[#A07EFF] text-white hover:from-purple-700 hover:to-purple-800'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {item.isAvailable ? 'Quick Add' : 'Unavailable'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary - Hidden on mobile/tablet, visible on desktop */}
            <div className="hidden lg:flex w-96 bg-white shadow flex-col relative h-full">
                  {/* Business Name Header */}
                  <div className="px-6 py-2">
                    <h3 className="text-lg text-center font-semibold text-gray-900">
                      {businessInformation?.[0]?.businessName || 'Business Name'}
                    </h3>
                    <p className="text-sm text-center text-gray-500">
                      {businessInformation?.[0]?.address || 'Business Address'}
                    </p>
                  </div>

                  <div className="px-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">POS Terminal</div>
                        <div className="text-gray-500">Served By</div>
                        <div className="font-medium">Staff</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500">{orderItemCount} items selected</div>
                        <div className="text-gray-500">Order Type</div>
                        <div className="font-medium">POS</div>
                      </div>
                    </div>
                  </div>
              {orderItems.length > 0 ? (
                <>

                  {/* Cart Items - Scrollable */}
                  <div className="flex-1 px-6 pt-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div className="">Order Items</div>
                      <h2 className="font-[600]">
                        {orderItems.reduce((total, item) => total + item.count, 0)} items
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {orderItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900">
                                {item.itemName}
                              </h4>
                              <p className="text-xs text-gray-500">{item.menuName}</p>
                              {item.isPacked && (
                                <p className="text-xs text-blue-600">+ Packing</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleDecrement(item.id)}
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
                              <span className="w-8 text-center text-sm font-bold">
                                {item.count}
                              </span>
                              <Button
                                onClick={() => handleIncrement(item.id)}
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
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {formatPrice(item.price * item.count, item.currency)}
                              </div>
                            </div>
                          </div>
                          {index !== orderItems.length - 1 && (
                            <Divider className="bg-[#E4E7EC80]" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Sticky Pricing Section */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (7.5%)</span>
                        <span>{formatPrice(vatAmount)}</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span className="text-primaryColor">{formatPrice(total)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => setOrderItems([])}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 border border-[#6D42E2] text-[#6D42E2] rounded-md hover:bg-red-50 text-sm transition-colors"
                      >
                        <X className="w-4 h-4 text-[#6D42E2]" />
                        <span>Clear Cart</span>
                      </button>
                      <button
                        onClick={onOpen}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#6D42E2] text-white rounded-md text-sm transition-all duration-200"
                      >
                        <span>Process Order</span>
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full justify-center items-center p-6">
                  <div className="flex flex-col justify-center items-center">
                    <Image
                      className="w-[50px] h-[50px]"
                      src={noMenu}
                      alt="no menu illustration"
                    />
                    <Spacer y={3} />
                    <p className="text-sm text-center">
                      Selected items will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Modal - Mobile/Tablet only */}
        {isOrderModalOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeOrderModal}
            />

            {/* Modal Content */}
            <div className="relative w-full bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out animate-slideUp max-h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
                <button
                  onClick={closeOrderModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close order summary"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Order Details */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">POS Terminal</div>
                    <div className="text-gray-500">Served By</div>
                    <div className="font-medium">Staff</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">{orderItemCount} items selected</div>
                    <div className="text-gray-500">Order Type</div>
                    <div className="font-medium">POS</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium w-48 text-xs text-gray-900">
                          {item.itemName}
                        </h4>
                        <p className="text-xs text-gray-500">{item.menuName}</p>
                        {item.isPacked && (
                          <p className="text-xs text-blue-600">+ Packing</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDecrement(item.id)}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation"
                          disabled={isUpdating}
                        >
                          <Minus className="w-3 h-3 text-gray-700" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.count}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.id)}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation"
                          disabled={isUpdating}
                        >
                          <Plus className="w-3 h-3 text-gray-700" />
                        </button>
                      </div>
                      <div className="text-right w-20">
                        <div className="text-sm font-medium">
                          {formatPrice(item.price * item.count, item.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer - Totals and Actions */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (7.5%)</span>
                    <span>{formatPrice(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-primaryColor">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setOrderItems([]);
                      closeOrderModal();
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 border border-[#6D42E2] text-[#6D42E2] rounded-md hover:bg-red-50 text-sm transition-colors touch-manipulation"
                  >
                    <X className="w-4 h-4 text-[#6D42E2]" />
                    <span>Clear Cart</span>
                  </button>
                  <button
                    onClick={() => {
                      closeOrderModal();
                      onOpen();
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-[#6D42E2] to-[#A07EFF] text-white rounded-md text-sm transition-all duration-200 touch-manipulation"
                  >
                    <span>Process Order</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Order Icon - Visible only on mobile/tablet */}
        {orderItemCount > 0 && (
          <button
            onClick={openOrderModal}
            className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-[#5F35D2] to-[#A07EFF] text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50 focus:outline-none focus:ring-4 focus:ring-purple-300"
            aria-label={`Open order summary (${orderItemCount} items)`}
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {orderItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {orderItemCount > 99 ? '99+' : orderItemCount}
                </span>
              )}
            </div>
          </button>
        )}

        {/* Menu Item Details Modal */}
        {isItemModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeItemModal}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 ease-out animate-slideUp">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Menu Item Details</h3>
                <button
                  onClick={closeItemModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close item details"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Item Name */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedItem.itemName}</h4>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-gray-600">Description</label>
                  <p className="text-gray-900">
                    {selectedItem.itemDescription || 'No description available'}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm text-gray-600">Price</label>
                  <p className="text-lg font-semibold text-purple-700">
                    {formatPrice(selectedItem.price, selectedItem.currency)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <p className="text-gray-900">{selectedItem.menuName}</p>
                  </div>

                  {/* Menu Section */}
                  <div>
                    <label className="text-sm text-gray-600">Menu</label>
                    <p className="text-gray-900">{selectedItem.sectionName}</p>
                  </div>
                </div>

                {/* Preparation Time */}
                <div>
                  <label className="text-sm text-gray-600">Preparation Time</label>
                  <p className="text-gray-900">
                    {selectedItem.waitingTimeMinutes || 15} minutes
                  </p>
                </div>

                {/* Packing Option */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    size="sm"
                    isSelected={includePacking}
                    onValueChange={setIncludePacking}
                    className="text-sm font-medium text-gray-900"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">Include Packing</span>
                      <p className="text-xs text-gray-600">
                        Additional {formatPrice(selectedItem.packingCost || 0, selectedItem.currency)}
                      </p>
                    </div>
                  </Checkbox>
                </div>

                {/* Has Variety Note */}
                {selectedItem.hasVariety && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">This item has varieties available</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={addItemFromModal}
                  disabled={!selectedItem.isAvailable}
                  className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedItem.isAvailable
                      ? 'bg-gradient-to-t from-[#5F35D2] to-[#A07EFF] text-white hover:from-purple-700 hover:to-purple-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedItem.isAvailable ? 'Add to Cart' : 'Item Unavailable'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CheckoutModal */}
        <CheckoutModal
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          selectedItems={orderItems}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          id={null}
          orderDetails={null}
          handlePackingCost={handlePackingCost}
          businessId={businessInformation?.[0]?.businessId}
          cooperateID={userInformation?.cooperateID}
        />
      </main>
      </div>
    </>
  );
};

export default POSpage;
