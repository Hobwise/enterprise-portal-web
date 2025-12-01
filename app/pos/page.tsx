"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useDisclosure } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/ui/dashboard/header";
import CheckoutModal from "@/components/ui/dashboard/orders/place-order/checkoutModal";
import { getJsonItemFromLocalStorage, formatPrice, notify, clearItemLocalStorage } from "@/lib/utils";
import { getOrder } from "@/app/api/controllers/dashboard/orders";
import toast from "react-hot-toast";

// Hooks
import { usePOSMenu } from "@/hooks/usePOSMenu";
import { usePOSNavigation } from "@/hooks/usePOSNavigation";
import { useOrderCart } from "@/hooks/useOrderCart";

// Components
import { POSHeader } from "@/components/ui/dashboard/pos/POSHeader";
import { MenuItemCard } from "@/components/ui/dashboard/pos/MenuItemCard";
import { OrderSummaryPanel } from "@/components/ui/dashboard/pos/OrderSummaryPanel";
import { ItemDetailsModal } from "@/components/ui/dashboard/pos/ItemDetailsModal";
import { VarietySelectionModal } from "@/components/ui/dashboard/pos/VarietySelectionModal";

// Types
import { MenuItem, Variety } from "./types";

// Constants
import { LOADING_SKELETON_COUNT } from "./constants";

const POSContent = () => {
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedVarietyItem, setSelectedVarietyItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [isLoadingExistingOrder, setIsLoadingExistingOrder] = useState(false);

  // Business information
  const businessInformation = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  // Fetch POS menu data
  const { loading, error, posData, refetch } = usePOSMenu();

  // Navigation and filtering
  const {
    selectedCategory,
    setSelectedCategory,
    selectedMenu,
    setSelectedMenu,
    categories,
    mainTabs,
    menuItems,
  } = usePOSNavigation(posData);

  // Order cart management
  const {
    orderItems,
    isUpdating,
    handleDecrement,
    handleIncrement,
    handlePackingCost,
    addItemToCart,
    clearCart,
    calculateOrderSummary,
  } = useOrderCart(menuItems);

  const orderSummary = calculateOrderSummary();



  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(query) ||
      item.menuName?.toLowerCase().includes(query)
    );
  });

  // Helper function to check if item is in cart
  const isItemInCart = (item: MenuItem): boolean => {
    const itemKey = item.uniqueKey || item.id;
    return orderItems.some((orderItem) => orderItem.id === itemKey);
  };

  // Helper function to get item count from cart
  const getItemCount = (item: MenuItem): number => {
    const itemKey = item.uniqueKey || item.id;
    const cartItem = orderItems.find((orderItem) => orderItem.id === itemKey);
    return cartItem ? cartItem.count : 0;
  };

  // Handle search input change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Modal handlers
  const openOrderModal = () => setIsOrderModalOpen(true);
  const closeOrderModal = () => setIsOrderModalOpen(false);

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setSelectedItem(null);
  };

  const openVarietyModal = (item: MenuItem) => {
    setSelectedVarietyItem(item);
    setIsVarietyModalOpen(true);
  };

  const closeVarietyModal = () => {
    setIsVarietyModalOpen(false);
    setSelectedVarietyItem(null);
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (!item.isAvailable) {
      notify({
        title: 'Unavailable',
        text: 'This item is currently unavailable',
        type: 'error'
      });
      return;
    }

    addItemToCart(item);
  };

  const handleAddItemFromModal = (item: MenuItem, includePacking: boolean) => {
    if (!item.isAvailable) {
      notify({
        title: 'Unavailable',
        text: 'This item is currently unavailable',
        type: 'error'
      });
      return;
    }

    addItemToCart(item);
    closeItemModal();
  };

  // Handle adding variety items to cart
  const handleAddVarietyToCart = (baseItem: MenuItem, variety?: Variety, includePacking?: boolean) => {
    if (variety) {
      // Adding a variety
      const varietyItem: MenuItem = {
        ...baseItem,
        uniqueKey: undefined, // Prevent inheriting base uniqueKey to ensure variety.id is used
        id: variety.id,
        itemName: `${baseItem.itemName} (${variety.unit || variety.name || 'Variety'})`,
        price: variety.price,
        currency: variety.currency || baseItem.currency,
        isVariety: true,
      };

      addItemToCart(varietyItem);
    } else {
      // Adding base item with packing if specified
      const itemToAdd = includePacking ? { ...baseItem, isPacked: true } : baseItem;
      addItemToCart(itemToAdd);
    }
  };

  // Handle removing variety items from cart
  const handleRemoveVarietyFromCart = (itemId: string) => {
    // Find the item in cart and decrement or remove
    handleDecrement(itemId);
  };

  // Load existing order when in add-items mode
  useEffect(() => {
    const loadExistingOrder = async () => {
      // Check if we're in add-items mode (coming from UpdateOrderModal)
      const isAddItemsMode = searchParams.get('mode') === 'add-items';
      const order = getJsonItemFromLocalStorage('order');

      if (isAddItemsMode && order?.id && menuItems.length > 0) {
        setIsLoadingExistingOrder(true);
        try {
          const response = await getOrder(order.id);

          if (response?.data?.isSuccessful) {
            const orderData = response?.data?.data;
            const orderDetails = orderData.orderDetails || [];

            // Debug logging
            console.log('API orderData:', orderData);
            console.log('localStorage order:', order);

            // Transform order details to match POS cart format
            orderDetails.forEach((item: any) => {
              const menuItem = menuItems.find((m: MenuItem) => m.id === item.itemID);

              if (menuItem) {
                const transformedItem = {
                  ...menuItem,
                  id: menuItem.uniqueKey || item.itemID,
                  itemID: item.itemID,
                  itemName: item.itemName || menuItem.itemName,
                  menuName: item.menuName || menuItem.menuName,
                  price: item.unitPrice,
                  isPacked: item.isPacked || false,
                  packingCost: item.packingCost || menuItem.packingCost || 0,
                } as MenuItem;

                // Add item to cart multiple times to match the quantity
                for (let i = 0; i < item.quantity; i++) {
                  addItemToCart(transformedItem);
                }
              }
            });

            // Map qrReference to quickResponseID for CheckoutModal compatibility
            // Use localStorage order as fallback if API response doesn't have the field
            const transformedOrderData = {
              ...orderData,
              quickResponseID: orderData.quickResponseID || orderData.qrReference || order.qrReference,
              placedByName: orderData.placedByName || order.placedByName || '',
              placedByPhoneNumber: orderData.placedByPhoneNumber || order.placedByPhoneNumber || '',
            };

            console.log('Transformed orderData:', transformedOrderData);

            setExistingOrder(transformedOrderData);
            toast.success(`Loading order ${order.reference || order.id}`);

            // Clear the order from localStorage after loading
            clearItemLocalStorage("order");
          } else {
            toast.error("Failed to load order details");
          }
        } catch (error) {
          console.error("Error loading existing order:", error);
          toast.error("Failed to load order details");
        } finally {
          setIsLoadingExistingOrder(false);
        }
      } else if (!isAddItemsMode && order?.id) {
        // Clear the order from localStorage if we're not in add-items mode
        clearItemLocalStorage("order");
      }
    };

    loadExistingOrder();
  }, [searchParams, menuItems.length]);

  console.log('Rendered POSContent with existingOrder:', orderItems);

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
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
        <main className="flex-1 w-full overflow-y-auto text-black">
          <Header ispos />
          <POSHeader onSearch={handleSearch} />

          {/* Mobile Category Tabs */}
     

          <div className="h-[83vh] lg:h-[83vh] bg-gray-50 flex">
            <div className="flex flex-1 overflow-hidden bg-white">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-48 bg-[#391D84] text-white overflow-y-auto">
                <div className="py-1">
                  <div className="space-y-1">
                    {mainTabs.map((category) => (
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
                    {categories.map((menu) => (
                      <button
                        key={menu}
                        onClick={() => setSelectedMenu(menu)}
                        className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 ${
                          selectedMenu === menu
                            ? "text-white bg-[#A07EFF]"
                            : "text-white"
                        }`}
                      >
                        {menu}
                      </button>
                    ))}
                  </div>
                </div>

                     <div className="lg:hidden bg-[#391D84]">
            <div className="flex overflow-x-auto scrollbar-hide">
              {mainTabs.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selectedCategory === category
                      ? "text-white bg-[#251258] border-[#A07EFF]"
                      : "text-purple-200 border-transparent hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

                {/* Menu Grid */}
                <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
                  {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
                        <div key={index} className="bg-gray-200 animate-pulse rounded-lg min-h-[120px]" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-red-500 mb-4">{error}</p>
                      <button
                        onClick={refetch}
                        className="px-4 py-2 bg-[#5F35D2] text-white rounded-md hover:bg-purple-700"
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500">
                        {searchQuery.trim() ? "No items found matching your search" : "No items available in this category"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {filteredMenuItems.map((item) => (
                        <MenuItemCard
                          key={item.uniqueKey || item.id}
                          item={item}
                          onQuickAdd={handleQuickAdd}
                          onViewDetails={openItemModal}
                          isInCart={isItemInCart(item)}
                          count={getItemCount(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary Panel - Desktop */}
              <OrderSummaryPanel
                orderItems={orderItems}
                orderSummary={orderSummary}
                businessName={businessInformation?.[0]?.businessName}
                businessAddress={businessInformation?.[0]?.address}
                staffName={userInformation?.firstName && userInformation?.lastName
                  ? `${userInformation.firstName} ${userInformation.lastName}`
                  : userInformation?.firstName || 'Staff'}
                isUpdating={isUpdating}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onClearCart={clearCart}
                onProcessOrder={onOpen}
              />
            </div>
          </div>

          {/* Mobile Order Summary Modal */}
          {isOrderModalOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex items-end">
              <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={closeOrderModal}
              />
              <div className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-slideUp max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="text-lg font-semibold">Your Order</h3>
                  <button onClick={closeOrderModal} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-4 py-3 border-b">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">POS Terminal</div>
                      <div className="text-gray-500">Served By</div>
                      <div className="font-medium">
                        {userInformation?.firstName && userInformation?.lastName
                          ? `${userInformation.firstName} ${userInformation.lastName}`
                          : userInformation?.firstName || 'Staff'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500">{orderSummary.itemCount} items</div>
                      <div className="text-gray-500">Order Type</div>
                      <div className="font-medium">POS</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium  text-xs">{item.itemName}</h4>
                          <p className="text-xs text-gray-500">{item.menuName}</p>
                          {item.isPacked && <p className="text-xs text-blue-600">+ Packing</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDecrement(item.id)}
                            className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-gray-50"
                            disabled={isUpdating}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.count}</span>
                          <button
                            onClick={() => handleIncrement(item.id)}
                            className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-gray-50"
                            disabled={isUpdating}
                          >
                            <Plus className="w-3 h-3" />
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

                <div className="bg-white border-t p-4">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(orderSummary.subtotal, orderItems?.[0]?.currency || 'NGN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT</span>
                      <span>{formatPrice(orderSummary.vatAmount, orderItems?.[0]?.currency || 'NGN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primaryColor">{formatPrice(orderSummary.total, orderItems?.[0]?.currency || 'NGN')}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        clearCart();
                        closeOrderModal();
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 border border-[#6D42E2] text-[#6D42E2] rounded-md"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                    <button
                      onClick={() => {
                        closeOrderModal();
                        onOpen();
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-[#6D42E2] to-[#A07EFF] text-white rounded-md"
                    >
                      <span>Process Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Cart Button */}
          {orderSummary.itemCount > 0 && (
            <button
              onClick={openOrderModal}
              className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-[#5F35D2] to-[#A07EFF] text-white p-4 rounded-full shadow-lg z-50"
              aria-label={`Open order (${orderSummary.itemCount} items)`}
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {orderSummary.itemCount > 99 ? '99+' : orderSummary.itemCount}
                </span>
              </div>
            </button>
          )}

          {/* Item Details Modal */}
          <ItemDetailsModal
            isOpen={isItemModalOpen}
            item={selectedItem}
            orderItems={orderItems}
            onClose={closeItemModal}
            onAddToCart={handleAddVarietyToCart}
            onRemoveFromCart={handleRemoveVarietyFromCart}
          />

          {/* Variety Selection Modal */}
          <VarietySelectionModal
            isOpen={isVarietyModalOpen}
            item={selectedVarietyItem}
            orderItems={orderItems}
            onClose={closeVarietyModal}
            onAddToCart={handleAddVarietyToCart}
            onRemoveFromCart={handleRemoveVarietyFromCart}
          />

          {/* Checkout Modal */}
          <CheckoutModal
            handleDecrement={handleDecrement}
            handleIncrement={handleIncrement}
            selectedItems={orderItems}
            onOpenChange={onOpenChange}
            isOpen={isOpen}
            id={existingOrder?.id || null}
            orderDetails={existingOrder}
            handlePackingCost={handlePackingCost}
            businessId={businessInformation?.[0]?.businessId}
            cooperateID={userInformation?.cooperateID}
            onOrderSuccess={clearCart}
          />
        </main>
      </div>
    </>
  );
};

const POSpage = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F35D2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POS...</p>
        </div>
      </div>
    }>
      <POSContent />
    </Suspense>
  );
};

export default POSpage;
