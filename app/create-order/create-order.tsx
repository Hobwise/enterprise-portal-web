'use client';
import { Chip, Divider, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { useEffect, useMemo, useState, useCallback } from "react";

import { CustomButton } from "@/components/customButton";
import Error from "@/components/error";
import { togglePreview } from "@/components/ui/dashboard/menu/preview-menu/data";

import { CheckIcon } from "@/components/ui/dashboard/orders/place-order/data";

import useMenuConfig from "@/hooks/cachedEndpoints/useMenuConfiguration";
import { useGlobalContext } from "@/hooks/globalProvider";
import { formatPrice } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { HiArrowLongLeft } from "react-icons/hi2";
import {
  IoAddCircleOutline,
  IoSearchOutline,
  IoCart,
  IoChevronBack,
  IoChevronForward,
  IoClose,
} from "react-icons/io5";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { BiPackage } from "react-icons/bi";
import { IoCalendarOutline } from "react-icons/io5";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { CustomInput } from "@/components/CustomInput";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { HiMenuAlt3 } from "react-icons/hi";
import noMenu from "../../public/assets/images/no-menu-1.jpg";

import useCustomerMenuCategories from "@/hooks/cachedEndpoints/useCustomerMenuCategories";
import useCustomerMenuItems from "@/hooks/cachedEndpoints/useCustomerMenuItems";
import MenuToolbar from "@/components/ui/dashboard/menu/MenuToolbar";
import ViewModal from "./viewMore";
import CartModal from "./CartModal";
import ServingInfoModal, { ServingInfoData } from "./ServingInfoModal";
import OrderTrackingPage from "./OrderTrackingModal";
import TrackingDetailsPage from "./TrackingDetailsModal";
import RestaurantBanner from "./RestaurantBanner";
import {
  placeCustomerOrder,
  getCustomerOrderByReference,
  updateCustomerOrder,
} from "../api/controllers/customerOrder";
import { toast } from "sonner";

const CreateOrder = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  let businessName = searchParams.get("businessName") || "";
  let businessId = searchParams.get("businessID");
  let cooperateID = searchParams.get("cooperateID");
  let qrId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const viewOnlyStorageKey = `menuViewOnly_${businessId}_${
    cooperateID || "default"
  }`;

  const [isViewOnlyMode, setIsViewOnlyMode] = useState(() => {
    if (typeof window !== "undefined") {
      // Check URL parameter first
      if (mode === "view") {
        sessionStorage.setItem(viewOnlyStorageKey, "true");
        return true;
      }

      // Then check sessionStorage
      const stored = sessionStorage.getItem(viewOnlyStorageKey);
      if (stored === "true") {
        return true;
      }

      return false;
    }
    return mode === "view";
  });

  // Sync with URL parameter and persist to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (mode === "view") {
        setIsViewOnlyMode(true);
        sessionStorage.setItem(viewOnlyStorageKey, "true");
      } else {
        setIsViewOnlyMode(false);
        sessionStorage.removeItem(viewOnlyStorageKey);
      }
    }
  }, [mode, viewOnlyStorageKey]);

  const { data: menuConfig, isLoading: menuConfigLoading } = useMenuConfig(
    businessId,
    cooperateID
  );
  const { menuIdTable, setMenuIdTable, setPage } = useGlobalContext();

  // Dynamic color from menu config (fallback to primary color)
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryColorStyle = { backgroundColor: primaryColor };
  const textColorStyle = { color: primaryColor };

  const [selectedMenu, setSelectedMenu] = useState([]);
  const [isOpenVariety, setIsOpenVariety] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal states for the new flow
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isServingInfoOpen, setIsServingInfoOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTrackingDetailsOpen, setIsTrackingDetailsOpen] = useState(false);

  // Order state
  const [orderData, setOrderData] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderErrors, setOrderErrors] = useState<any>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false); // Track if updating existing order
  const [originalOrderItems, setOriginalOrderItems] = useState<Item[]>([]); // Store original order items for comparison
  const [servingInfo, setServingInfo] = useState<ServingInfoData | null>(null); // Store serving info for prefilling

  // Menu state - using React Query hooks
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCustomerMenuCategories(
    businessId || undefined,
    cooperateID || undefined
  );

  const {
    data: menuItemsData,
    totalCount,
    isLoading: itemsLoading,
    isError: itemsError,
    refetch: refetchItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCustomerMenuItems(selectedCategoryId, debouncedSearchQuery, 10);

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      const firstCategory = categories[0];
      setSelectedCategoryId(firstCategory.id);
      setMenuIdTable(firstCategory.name);
    }
  }, [categories, selectedCategoryId, setMenuIdTable]);

  // Add waiting time to menu items
  const menuItems = useMemo(() => {
    if (!menuItemsData || !Array.isArray(menuItemsData) || !categories)
      return [];

    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    return menuItemsData.map((item: any) => ({
      ...item,
      waitingTimeMinutes: selectedCategory?.waitingTimeMinutes || 0,
      // Propagate VAT config from the selected category/section to each item
      isVatEnabled: (selectedCategory as any)?.isVatEnabled ?? false,
      vatRate: (selectedCategory as any)?.vatRate ?? 0,
    }));
  }, [menuItemsData, categories, selectedCategoryId]);

  const isLoading = categoriesLoading || itemsLoading;
  const isError = categoriesError || itemsError;

  const [activeSubCategory, setActiveSubCategory] = useState<string>("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [categoryScrollRef, setCategoryScrollRef] =
    useState<HTMLDivElement | null>(null);

  const handleTabClick = (categoryId: string, categoryName: string) => {
    setPage(1);
    setSelectedCategoryId(categoryId);
    setMenuIdTable(categoryName);
  };

  // Refetch menu data
  const refetch = async () => {
    await refetchCategories();
    if (selectedCategoryId) {
      await refetchItems();
    }
  };

  // Infinite scroll handler - load more items from server
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled near bottom of page
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = 300; // Load more when 300px from bottom

      if (
        scrollPosition >= documentHeight - threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle category scroll
  const scrollCategories = (direction: "left" | "right") => {
    if (!categoryScrollRef) return;
    const scrollAmount = 200;
    const newScrollLeft =
      direction === "left"
        ? categoryScrollRef.scrollLeft - scrollAmount
        : categoryScrollRef.scrollLeft + scrollAmount;

    categoryScrollRef.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  // Check scroll position
  const checkScrollPosition = () => {
    if (!categoryScrollRef) return;
    setShowLeftArrow(categoryScrollRef.scrollLeft > 0);
    setShowRightArrow(
      categoryScrollRef.scrollLeft <
        categoryScrollRef.scrollWidth - categoryScrollRef.clientWidth - 10
    );
  };

  // keep toolbar active state in sync with current menu selection
  useEffect(() => {
    if (menuIdTable) {
      setActiveSubCategory(menuIdTable as string);
    }
  }, [menuIdTable]);

  const menuSections = useMemo(() => {
    return (
      categories?.map((category: any) => ({
        id: category.id,
        name: category.name,
        totalCount: menuItems?.length || 0, // This would need category-specific counts
      })) || []
    );
  }, [categories, menuItems]);

  // No need for client-side filtering anymore - data is filtered on server
  const matchingObjectArray = menuItems || [];

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (selectedItems.length > 0) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedItems]);

  const convertActiveTile = (activeTile: number | undefined) => {
    const previewStyles: { [key: string]: string } = {
      0: "List left",
      1: "List Right",
      2: "Single column 1",
      3: "Single column 2",
      4: "Double column",
    };

    return previewStyles[activeTile?.toString() || "0"];
  };

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

  const toggleVarietyModal = (menu: any) => {
    setSelectedMenu(menu);

    setIsOpenVariety(!isOpenVariety);
  };

  const handleCardClick = (menuItem: Item, isItemPacked: boolean) => {
    const existingItem = selectedItems.find((item) => item.id === menuItem.id);
    if (existingItem) {
      setSelectedItems(selectedItems.filter((item) => item.id !== menuItem.id));
    } else {
      // setSelectedMenu(menuItem);
      setSelectedItems((prevItems: Item[]) => [
        ...prevItems,
        {
          ...menuItem,
          count: 1,
          isPacked: isItemPacked,
          packingCost: menuItem.isVariety
            ? (selectedMenu as any)?.packingCost || 0
            : menuItem.packingCost || 0,
        },
      ]);
    }
  };

  const handleQuickAdd = (menuItem: Item, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Directly add item to cart
    const existingItem = selectedItems.find((item) => item.id === menuItem.id);
    if (existingItem) {
      // If item already exists, increment count
      handleIncrement(menuItem.id);
    } else {
      // Add new item to cart
      setSelectedItems((prevItems: Item[]) => [
        ...prevItems,
        {
          ...menuItem,
          count: 1,
          isPacked: false,
          packingCost: menuItem.packingCost || 0,
        },
      ]);
    }
  };

  const handleDecrement = (id: string) => {
    setSelectedItems(
      (prevItems: Item[]) =>
        prevItems
          .map((item: Item) => {
            if (item.id === id) {
              if (item.count > 1) {
                return { ...item, count: item.count - 1 };
              } else {
                // Remove item when count reaches 0
                return null;
              }
            }
            return item;
          })
          .filter((item): item is Item => item !== null) // Remove null items with type guard
    );
  };

  const handleIncrement = (id: string) => {
    setSelectedItems((prevItems: Item[]) =>
      prevItems.map((item: Item) =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      )
    );
  };
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

  // Helper function to check if order items have changed
  const hasOrderChanged = (original: Item[], current: Item[]) => {
    if (original.length !== current.length) return true;

    // Create sorted arrays for comparison
    const sortedOriginal = [...original].sort((a, b) =>
      a.id.localeCompare(b.id)
    );
    const sortedCurrent = [...current].sort((a, b) => a.id.localeCompare(b.id));

    // Check if any item differs
    for (let i = 0; i < sortedOriginal.length; i++) {
      const orig = sortedOriginal[i];
      const curr = sortedCurrent[i];

      if (
        orig.id !== curr.id ||
        orig.count !== curr.count ||
        orig.isPacked !== curr.isPacked
      ) {
        return true;
      }
    }

    return false;
  };

  const handlePackingCost = (itemId: string, isPacked: boolean) => {
    setSelectedItems((prevItems: Item[]) =>
      prevItems.map((item: Item) =>
        item.id === itemId ? { ...item, isPacked } : item
      )
    );
  };

  const baseString = "data:image/jpeg;base64,";

  // Handle remove item from cart
  const handleRemoveItem = (id: string) => {
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Handle opening cart modal
  const handleCheckoutOpen = () => {
    if (selectedItems.length > 0) {
      setIsCartOpen(true);
    }
  };

  // Handle proceeding to serving info
  const handleProceedToServingInfo = () => {
    setIsServingInfoOpen(true);
  };

  // Handle submitting serving info and placing order
  const handleSubmitServingInfo = async (servingInfoData: ServingInfoData) => {
    setOrderLoading(true);
    setOrderErrors(null);

    try {
      // Store serving info for prefilling on future updates
      setServingInfo(servingInfoData);

      // If updating an existing order and nothing changed, just go back to tracking
      if (
        isUpdatingOrder &&
        !hasOrderChanged(originalOrderItems, selectedItems)
      ) {
        setIsServingInfoOpen(false);
        setIsOrderTrackingOpen(true);
        setOrderLoading(false);
        toast.info("No changes detected. Returning to order tracking.");
        return;
      }
      // Compute totals with dynamic per-item VAT
      let subtotal = 0;
      let packingCost = 0;
      let vat = 0;
      selectedItems.forEach((item: any) => {
        const itemTotal = (Number(item.price) || 0) * (Number(item.count) || 0);
        subtotal += itemTotal;
        let itemPackingTotal = 0;
        if (item.isPacked && item.packingCost) {
          itemPackingTotal = (Number(item.packingCost) || 0) * (Number(item.count) || 0);
          packingCost += itemPackingTotal;
        }
        if (item.isVatEnabled && item.vatRate && item.vatRate > 0) {
          const itemSubtotal = itemTotal + itemPackingTotal;
          vat += itemSubtotal * item.vatRate;
        }
      });
      // Round to 2dp
      subtotal = Math.round(subtotal * 100) / 100;
      packingCost = Math.round(packingCost * 100) / 100;
      vat = Math.round(vat * 100) / 100;
      const total = Math.round((subtotal + packingCost + vat) * 100) / 100;

      const orderDetails = selectedItems.map((item) => ({
        itemId: item.id,
        quantity: item.count,
        unitPrice: item.price,
        isVariety: item.isVariety || false,
        isPacked: item.isPacked || false,
      }));

      const payload = {
        status: 0,
        placedByName: servingInfoData.name,
        placedByPhoneNumber: servingInfoData.phoneNumber,
        quickResponseID: qrId || "",
        comment: servingInfoData.comment,
        totalAmount: Math.round(total * 100) / 100,
        orderDetails,
      };

      let response;

      // Check if we're updating an existing order or creating a new one
      if (isUpdatingOrder && orderData?.id) {
        response = await updateCustomerOrder(orderData.id, payload);
      } else {
        response = await placeCustomerOrder(
          payload,
          businessId || "",
          cooperateID || ""
        );
      }

      if (response?.isSuccessful && response?.data) {
        let orderDataToStore = response.data;
        if (
          response.data.orderDetails &&
          response.data.orderDetails.length > 0
        ) {
          const orderID = response.data.orderDetails[0]?.orderID;
          if (orderID && !response.data.reference) {
            orderDataToStore = { ...response.data, reference: orderID };
          }
        }

        // Attach VAT metadata for display in tracking modal immediately after placing
        const enabledRates = Array.from(
          new Set(
            selectedItems
              .filter((i: any) => i.isVatEnabled && i.vatRate && i.vatRate > 0)
              .map((i: any) => Number(i.vatRate))
          )
        );
        if (enabledRates.length > 0) {
          (orderDataToStore as any).isVatEnabled = true;
          // If multiple rates, store the first; UI can handle plural if needed
          (orderDataToStore as any).vatRate = enabledRates[0];
        } else {
          (orderDataToStore as any).isVatEnabled = false;
          (orderDataToStore as any).vatRate = 0;
        }

        setOrderData(orderDataToStore);
        setIsServingInfoOpen(false);
        setIsOrderTrackingOpen(true);
        setIsUpdatingOrder(false); // Reset update flag
        toast.success(
          isUpdatingOrder
            ? "Order updated successfully!"
            : "Order placed successfully!"
        );
      } else {
        // Handle error response
        const errorMessage =
          response?.error?.responseDescription ||
          response?.error?.message ||
          `Failed to ${
            isUpdatingOrder ? "update" : "place"
          } order. Please try again.`;
        setOrderErrors(response?.errors || {});
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle adding more items from order tracking
  const handleAddMoreItemsFromTracking = () => {
    if (orderData && orderData.orderDetails) {
      // Transform order details into cart items format with all necessary fields
      const cartItems: Item[] = orderData.orderDetails.map((detail: any) => {
        const basePrice = detail.unitPrice || 0;

        return {
          id: detail.itemID,
          itemID: detail.itemID,
          itemName: detail.itemName,
          menuName: detail.menuName,
          itemDescription: detail.itemDescription || "",
          price: basePrice,
          currency: "NGN",
          isAvailable: true,
          hasVariety: detail.isVariety || false,
          image: detail.image || "",
          isVariety: detail.isVariety || false,
          varieties: detail.varieties || null,
          count: detail.quantity || 1,
          packingCost: detail.packingCost || 0,
          isPacked: detail.isPacked || false,
          menuID: detail.menuID || "",
          waitingTimeMinutes: detail.waitingTimeMinutes || 0,
        };
      });

      setSelectedItems(cartItems);
      setOriginalOrderItems(cartItems); // Store original items for comparison
      setIsUpdatingOrder(true); // Set flag to update existing order

      // Extract and store serving info from order data for prefilling
      if (orderData.placedByName || orderData.placedByPhoneNumber) {
        setServingInfo({
          name: orderData.placedByName || "",
          phoneNumber: orderData.placedByPhoneNumber || "",
          comment: orderData.comment || "",
        });
      }
    }
    setIsOrderTrackingOpen(false);
    // Scroll to top to show menu
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle checkout from order tracking - go to confirmation page
  const handleCheckoutFromTracking = async (updatedOrderData?: any) => {
    const currentOrderData = updatedOrderData || orderData;
    let orderReference =
      currentOrderData?.reference ||
      currentOrderData?.orderReference ||
      currentOrderData?.Reference ||
      currentOrderData?.OrderReference ||
      currentOrderData?.trackingId ||
      currentOrderData?.TrackingId;

    // If no direct reference found, try to extract from orderDetails
    if (
      !orderReference &&
      currentOrderData?.orderDetails &&
      currentOrderData.orderDetails.length > 0
    ) {
      orderReference = currentOrderData.orderDetails[0]?.orderID;
    }
    // Check if we already have complete order data
    if (
      currentOrderData?.orderDetails &&
      currentOrderData.orderDetails.length > 0
    ) {
      // We already have the order data, just transform it
      const fullOrderData = currentOrderData;

      // Transform order details into cart items format with all necessary fields
      const cartItems: Item[] = fullOrderData.orderDetails.map(
        (detail: any) => {
          const basePrice = detail.unitPrice || 0;

          return {
            id: detail.itemID,
            itemID: detail.itemID,
            itemName: detail.itemName,
            menuName: detail.menuName,
            itemDescription: detail.itemDescription || "",
            price: basePrice,
            currency: "NGN",
            isAvailable: true,
            hasVariety: detail.isVariety || false,
            image: detail.image || "",
            isVariety: detail.isVariety || false,
            varieties: detail.varieties || null,
            count: detail.quantity || 1,
            packingCost: detail.packingCost || 0,
            isPacked: detail.isPacked || false,
            menuID: detail.menuID || "",
            waitingTimeMinutes: detail.waitingTimeMinutes || 0,
          };
        }
      );

      setSelectedItems(cartItems);
      setOriginalOrderItems(cartItems); // Store original items for comparison
      setOrderData(fullOrderData); // Update with full order data
      setIsUpdatingOrder(true); // Set flag to update existing order

      // Extract and store serving info from order data for prefilling
      if (fullOrderData.placedByName || fullOrderData.placedByPhoneNumber) {
        setServingInfo({
          name: fullOrderData.placedByName || "",
          phoneNumber: fullOrderData.placedByPhoneNumber || "",
          comment: fullOrderData.comment || "",
        });
      }

      setIsOrderTrackingOpen(false);
      // Open cart modal
      setTimeout(() => {
        setIsCartOpen(true);
      }, 0);
    } else {
      toast.error("Unable to load order details. Please try again.");
    }
  };

  // Handle track order submission from TrackingDetailsModal
  const handleTrackOrderSubmit = (orderData: any) => {
    setOrderData(orderData);
    setIsTrackingDetailsOpen(false);
    setIsOrderTrackingOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-white">
      {/* Header Section with Banner */}
      {menuConfigLoading ? (
        <div className="relative w-full">
          <div className="h-[192px] w-full bg-gray-200 animate-pulse" />
        </div>
      ) : (
        <RestaurantBanner
          businessName={businessName || ""}
          menuConfig={menuConfig}
          showMenuButton={true}
          onMenuClick={() => setIsMenuOpen(true)}
          baseString={baseString}
        />
      )}

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white">
        {menuConfigLoading ? (
          <div className="w-full md:max-w-2xl mx-auto h-10 bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <div className="relative w-full md:max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              style={{ outlineColor: primaryColor }}
              className="w-full pl-10 text-black pr-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none bg-gray-50"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              {searchQuery !== debouncedSearchQuery ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              ) : (
                <HiOutlineMicrophone className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Filter with Arrows */}
      {menuConfigLoading ? (
        <div className="px-4 py-3 bg-white">
          <div className="flex gap-3 overflow-hidden">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 h-9 w-24 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : (
        categories &&
        categories.length > 0 && (
          <div className="relative px-4 py-3 bg-white">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                aria-label="Scroll left"
                onClick={() => scrollCategories("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
              >
                <IoChevronBack className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Category Pills */}
            <div
              ref={(el) => {
                if (el && el !== categoryScrollRef) {
                  setCategoryScrollRef(el);
                  setTimeout(() => checkScrollPosition(), 100);
                }
              }}
              onScroll={checkScrollPosition}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category: any) => {
                const isSelected = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleTabClick(category.id, category.name)}
                    style={isSelected ? primaryColorStyle : {}}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                aria-label="Scroll right"
                onClick={() => scrollCategories("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
              >
                <IoChevronForward className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        )
      )}

      {/* Menu Items - Dynamic Layout */}
      <div className="pb-20">
        {/* Loading State - Skeleton Loaders */}
        {isLoading && (
          <div className="px-4">
            {/* Skeleton for grid/list layouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  {/* Image Skeleton */}
                  <div className="h-48 bg-gray-200"></div>

                  {/* Content Skeleton */}
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Error
              imageHeight="h-24"
              imageWidth="w-24"
              onClick={() => refetch()}
              title="Unable to Load Menu"
              message="We couldn't load the menu at this time. This could be due to a network issue or the menu may be temporarily unavailable. Please check your connection and try again."
            />
          </div>
        )}

        {/* Menu Items */}
        {!isLoading &&
          !isError &&
          (() => {
            const layoutName = convertActiveTile(menuConfig?.layout);
            const preview = togglePreview(layoutName);
            const isGridLayout = [
              "Double column",
              "Single column 2",
              "Single column 1",
            ].includes(layoutName || "");

            return (
              <div className={`${preview?.main || "relative px-4"}`}>
                {matchingObjectArray?.map((item) => {
                  const isSelected =
                    selectedItems.find((selected) => selected.id === item.id) ||
                    selectedItems.some((menu) =>
                      item.varieties?.some(
                        (variety: any) => variety.id === menu.id
                      )
                    );
                  const isListLayout = layoutName?.includes("List");
                  const isCompactGrid = layoutName === "Single column 2";

                  return (
                    <div
                      key={item.id || item.menuID}
                      className={`my-3 relative`}
                    >
                      <div
                        className={`${
                          isListLayout
                            ? "flex flex-1 min-h-[120px] items-center gap-3 w-full bg-white rounded-xl p-3 shadow-sm"
                            : `${preview?.container} flex flex-col h-full`
                        } ${
                          !isListLayout && item?.isAvailable && !isViewOnlyMode
                            ? "pb-10"
                            : !isListLayout && !item?.isAvailable
                            ? ""
                            : ""
                        } text-black relative transition-all ${
                          item?.isAvailable && !isViewOnlyMode
                            ? "cursor-pointer"
                            : item?.isAvailable
                            ? ""
                            : "bg-gray-100 cursor-not-allowed"
                        }`}
                      >
                        {item?.isAvailable === false && (
                          <Chip
                            className={`capitalize absolute ${
                              menuConfig?.useBackground === false &&
                              (layoutName === "Single column 1" ||
                                layoutName === "Single column 2" ||
                                layoutName === "Double column")
                                ? "bottom-2 right-2"
                                : preview?.chipPosition
                            }  z-20`}
                            color={"danger"}
                            size="sm"
                            variant="flat"
                          >
                            Out of stock
                          </Chip>
                        )}

                        {/* Image for Grid Layouts */}
                        {(layoutName === "Single column 1" ||
                          layoutName === "Single column 2" ||
                          layoutName === "Double column") &&
                          menuConfig?.useBackground !== false && (
                            <div
                              className={`${
                                preview?.imageContainer || ""
                              } relative flex items-center justify-center`}
                            >
                              <div
                                style={{
                                  background: `linear-gradient(to bottom right, ${primaryColor}1A, ${primaryColor}0D, #F3E8FF)`,
                                }}
                                className={`relative flex items-center justify-center overflow-hidden ${
                                  preview?.imageClass || "h-48"
                                }`}
                              >
                                {item.image &&
                                item.image.length > baseString.length ? (
                                  <Image
                                    fill
                                    className={`object-cover ${
                                      !item?.isAvailable
                                        ? "opacity-40 grayscale"
                                        : ""
                                    }`}
                                    src={`${baseString}${item.image}`}
                                    alt={item.itemName}
                                  />
                                ) : (
                                  <Image
                                    fill
                                    className={`object-cover ${
                                      !item?.isAvailable
                                        ? "opacity-40 grayscale"
                                        : ""
                                    }`}
                                    src={noMenu}
                                    alt="No image available"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                        {/* Add Items Button - Based on Layout (Hidden in view-only mode) */}
                        {item?.isAvailable && !isViewOnlyMode && (
                          <>
                            {/* All grid layouts: Full-width button at bottom */}
                            {(layoutName === "Single column 1" ||
                              layoutName === "Single column 2" ||
                              layoutName === "Double column") && (
                              <button
                                onClick={(e) => handleQuickAdd(item, e)}
                                style={primaryColorStyle}
                                className="absolute bottom-0 left-0 right-0 text-white py-2.5 px-3 rounded-b-xl font-medium text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 z-20"
                              >
                                <IoAddCircleOutline className="w-4 h-4" />
                                Add
                              </button>
                            )}
                          </>
                        )}

                        {/* For List Left: Image on left */}
                        {layoutName === "List left" &&
                          menuConfig?.useBackground !== false && (
                            <div
                              className={`${
                                preview?.imageContainer || ""
                              } relative flex-shrink-0 flex items-center justify-center`}
                            >
                              <div
                                style={{
                                  background: `linear-gradient(to bottom right, ${primaryColor}1A, ${primaryColor}0D, #F3E8FF)`,
                                }}
                                className={`relative flex items-center justify-center overflow-hidden ${
                                  preview?.imageClass || "h-32"
                                }`}
                              >
                                {item.image &&
                                item.image.length > baseString.length ? (
                                  <Image
                                    fill
                                    className={`object-cover ${
                                      !item?.isAvailable
                                        ? "opacity-40 grayscale"
                                        : ""
                                    }`}
                                    src={`${baseString}${item.image}`}
                                    alt={item.itemName}
                                  />
                                ) : (
                                  <Image
                                    fill
                                    className={`object-cover ${
                                      !item?.isAvailable
                                        ? "opacity-40 grayscale"
                                        : ""
                                    }`}
                                    src={noMenu}
                                    alt="No image available"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                        {/* Text Content */}
                        <div
                          onClick={() => {
                            if (item?.isAvailable && !isViewOnlyMode) {
                              toggleVarietyModal(item);
                            }
                          }}
                          className={`${preview?.textContainer} flex flex-col ${
                            isListLayout
                              ? "justify-center flex-1"
                              : "justify-start"
                          }`}
                        >
                          <p
                            className={`font-bold ${
                              isCompactGrid ? "text-xs" : "text-sm"
                            } line-clamp-1`}
                          >
                            {item.itemName}
                          </p>
                          <p
                            className={`text-gray-500 ${
                              isCompactGrid ? "text-[10px]" : "text-xs"
                            } line-clamp-2 mt-0.5`}
                          >
                            {item.itemDescription || preview?.text3}
                          </p>
                          <p
                            style={textColorStyle}
                            className={`font-semibold ${
                              isCompactGrid ? "text-xs" : "text-sm"
                            } mt-1`}
                          >
                            {formatPrice(item.price)}
                          </p>
                          {isSelected && (
                            <div className="absolute top-2 left-2">
                              <Chip
                                startContent={<CheckIcon size={14} />}
                                variant="flat"
                                size="sm"
                                style={primaryColorStyle}
                                classNames={{
                                  base: "text-white text-[10px] mt-1.5 h-5",
                                }}
                              >
                                {selectedItems.find(
                                  (selected) => selected.id === item.id
                                )?.count || 0}
                              </Chip>
                            </div>
                          )}
                        </div>

                        {/* For List Right: Image and button grouped on the right */}
                        {layoutName === "List Right" && (
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Image */}
                            {menuConfig?.useBackground !== false && (
                              <div
                                className={`${
                                  preview?.imageContainer || ""
                                } relative flex items-center justify-center`}
                              >
                                <div
                                  style={{
                                    background: `linear-gradient(to bottom right, ${primaryColor}1A, ${primaryColor}0D, #F3E8FF)`,
                                  }}
                                  className={`relative flex items-center justify-center overflow-hidden ${
                                    preview?.imageClass || "h-32"
                                  }`}
                                >
                                  {item.image &&
                                  item.image.length > baseString.length ? (
                                    <Image
                                      fill
                                      className={`object-cover ${
                                        !item?.isAvailable
                                          ? "opacity-40 grayscale"
                                          : ""
                                      }`}
                                      src={`${baseString}${item.image}`}
                                      alt={item.itemName}
                                    />
                                  ) : (
                                    <Image
                                      fill
                                      className={`object-cover ${
                                        !item?.isAvailable
                                          ? "opacity-40 grayscale"
                                          : ""
                                      }`}
                                      src={noMenu}
                                      alt="No image available"
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Button - Always reserve space for alignment */}
                            <div className="flex items-center justify-center w-[48px]">
                              {item?.isAvailable && !isViewOnlyMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAdd(item, e);
                                  }}
                                  style={primaryColorStyle}
                                  className="text-white rounded-lg p-2.5 shadow-lg hover:scale-110 hover:opacity-90 transition-all z-20"
                                  aria-label="Add to cart"
                                >
                                  <IoAddCircleOutline className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* List Left Button - on the right side after text */}
                        {layoutName === "List left" && (
                          <div className="flex-shrink-0 flex items-center justify-center w-[48px]">
                            {item?.isAvailable && !isViewOnlyMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAdd(item, e);
                                }}
                                style={primaryColorStyle}
                                className="text-white rounded-lg p-2.5 shadow-lg hover:scale-110 hover:opacity-90 transition-all z-20"
                                aria-label="Add to cart"
                              >
                                <IoAddCircleOutline className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Empty State - No Results */}
                {matchingObjectArray?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 px-4 col-span-full">
                    <div className="text-gray-300 mb-4">
                      <svg
                        className="w-24 h-24 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No items found
                    </h3>
                    <p className="text-sm text-gray-500 text-center max-w-md">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try a different search term.`
                        : "No menu items available at the moment."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={textColorStyle}
                        className="mt-4 px-4 py-2 hover:underline text-sm font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
      </div>

      {/* Floating Cart Icon with Badge - Only show on menu browsing page (hidden in view-only mode) */}
      {!isViewOnlyMode &&
        selectedItems.length > 0 &&
        !isCartOpen &&
        !isServingInfoOpen &&
        !isOrderTrackingOpen && (
          <button
            onClick={handleCheckoutOpen}
            style={primaryColorStyle}
            className="fixed bottom-6 right-6 hover:opacity-90 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 z-[60]"
            aria-label="View cart"
          >
            <div className="relative">
              <svg
                width="22"
                height="21"
                viewBox="0 0 22 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
              >
                <circle
                  cx="10.9984"
                  cy="2.49844"
                  r="1.5"
                  stroke="white"
                  strokeWidth="1.2"
                />
                <path
                  d="M10.998 6.39648C15.9685 6.39648 19.9978 10.4261 19.998 15.3965V17.7041C19.998 17.9207 19.823 18.0965 19.6064 18.0967H2.39062C2.17401 18.0966 1.99805 17.9207 1.99805 17.7041V15.3965C1.99826 10.4262 6.0278 6.3967 10.998 6.39648Z"
                  stroke="white"
                  strokeWidth="1.2"
                />
                <path
                  d="M1.39844 19.8984H20.5984"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {selectedItems.reduce((total, item) => total + item.count, 0)}
              </span>
            </div>
          </button>
        )}

      {/* Hamburger Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Drawer */}
          <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-black">{businessName}</h2>
              <button
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              {/* View Menu - Active */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  // Scroll to top to show menu
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full flex items-start gap-4 p-4 bg-purple-50 rounded-lg transition-colors text-left"
              >
                <div className="p-2 rounded-lg" style={primaryColorStyle}>
                  <MdOutlineRestaurantMenu className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={textColorStyle}>
                    View Menu
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse our full menu selection
                  </p>
                </div>
              </button>

              {/* Track Order - Hidden in view-only mode */}
              {!isViewOnlyMode && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsTrackingDetailsOpen(true);
                  }}
                  className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left mt-2"
                >
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <BiPackage className="w-6 h-6" style={textColorStyle} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">Track Order</h3>
                    <p className="text-sm text-gray-600">
                      View order preparation in real time
                    </p>
                  </div>
                </button>
              )}

              {/* Book Reservation */}
              <a
                href={`/reservation/select-reservation?businessID=${businessId}&cooperateID=${
                  cooperateID || ""
                }&businessName=${businessName}`}
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left mt-2"
              >
                <div className="p-2 bg-purple-50 rounded-lg">
                  <IoCalendarOutline
                    className="w-6 h-6"
                    style={textColorStyle}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black">Book Reservation</h3>
                  <p className="text-sm text-gray-600">
                    Reserve a table for you and friends
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* New Modal Flow */}
      <CartModal
        isOpen={isCartOpen}
        onOpenChange={() => setIsCartOpen(false)}
        selectedItems={selectedItems}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        handleRemoveItem={handleRemoveItem}
        handlePackingCost={handlePackingCost}
        onProceedToServingInfo={handleProceedToServingInfo}
        businessName={businessName}
        menuConfig={menuConfig}
        baseString={baseString}
      />

      <ServingInfoModal
        isOpen={isServingInfoOpen}
        onOpenChange={() => setIsServingInfoOpen(false)}
        onSubmit={handleSubmitServingInfo}
        onBack={() => {
          setIsServingInfoOpen(false);
          setIsCartOpen(true);
        }}
        loading={orderLoading}
        errors={orderErrors}
        businessName={businessName}
        menuConfig={menuConfig}
        baseString={baseString}
        initialData={servingInfo || undefined}
      />

      <OrderTrackingPage
        isOpen={isOrderTrackingOpen}
        onClose={() => {
          setIsOrderTrackingOpen(false);
          setSelectedItems([]); // Clear selected items when leaving
          setOriginalOrderItems([]); // Clear original items
          setOrderData(null); // Clear order data
          setIsUpdatingOrder(false); // Reset update flag
          setServingInfo(null); // Clear serving info for fresh orders
        }}
        trackingId={orderData?.reference || ""}
        orderStatus={
          orderData?.status === 0
            ? "placed"
            : orderData?.status === 1
            ? "accepted"
            : orderData?.status === 2
            ? "preparing"
            : "served"
        }
        estimatedTime={orderData?.estimatedCompletionTime}
        onAddMoreItems={handleAddMoreItemsFromTracking}
        onCheckout={handleCheckoutFromTracking}
        businessName={businessName}
        menuConfig={menuConfig}
        baseString={baseString}
        orderData={orderData}
        businessId={businessId || ""}
        cooperateId={cooperateID || ""}
      />

      <TrackingDetailsPage
        isOpen={isTrackingDetailsOpen}
        onClose={() => setIsTrackingDetailsOpen(false)}
        onTrackOrder={handleTrackOrderSubmit}
        businessName={businessName || ""}
        businessId={businessId || ""}
        cooperateId={cooperateID || ""}
        menuConfig={menuConfig}
        baseString={baseString}
      />

      <ViewModal
        handleCheckoutOpen={handleCheckoutOpen}
        handleCardClick={handleCardClick}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        selectedMenu={selectedMenu}
        isOpenVariety={isOpenVariety}
        totalPrice={calculateTotalPrice()}
        handlePackingCost={handlePackingCost}
        toggleVarietyModal={toggleVarietyModal}
        selectedItems={selectedItems}
        menuConfig={menuConfig}
      />
    </main>
  );
};

export default CreateOrder;
