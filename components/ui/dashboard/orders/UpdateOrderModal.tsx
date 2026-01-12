"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Button,
  Divider,
  Spacer,
} from "@nextui-org/react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { X } from "lucide-react";
import {
  getJsonItemFromLocalStorage,
  formatPrice,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import { CustomButton } from "@/components/customButton";
import SpinnerLoader from "../menu/SpinnerLoader";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import useOrderDetails from "@/hooks/cachedEndpoints/useOrderDetails";
import useMenu from "@/hooks/cachedEndpoints/useMenu";
import useOrderConfiguration from "@/hooks/cachedEndpoints/useOrderConfiguration";

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

interface OrderData {
  id: string;
  placedByName: string;
  placedByPhoneNumber: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  qrReference: string;
  paymentMethod: number;
  paymentReference: string;
  status: 0 | 1 | 2 | 3;
  dateCreated: string;
  comment?: string;
  subTotalAmount?: number;
  vatAmount?: number;
  isVatApplied?: boolean;
  orderDetails?: {
    itemID: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface UpdateOrderModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderData: OrderData | null;
  onOrderUpdated: () => void;
  onProcessPayment?: () => void;
  onProceedToConfirm?: (selectedItems: Item[]) => void;
}

const UpdateOrderModal: React.FC<UpdateOrderModalProps> = ({
  isOpen,
  onOpenChange,
  orderData,
  onOrderUpdated: _onOrderUpdated,
  onProcessPayment,
  onProceedToConfirm,
}) => {
  const router = useRouter();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  // Check if user is a POS user
  const isPOSUser = userInformation?.primaryAssignment === "Point of Sales";

  // State management
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [_storedOrderData, setStoredOrderData] = useState<OrderData | null>(
    null
  );
  const [isDataProcessingComplete, setIsDataProcessingComplete] =
    useState<boolean>(false);
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [additionalCostName, setAdditionalCostName] = useState<string>("");
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [isVatApplied, setIsVatApplied] = useState<boolean>(true);
  const [vatRate, setVatRate] = useState<number>(0);

  // Timer ref for cleanup
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use the orderData prop directly
  const [orderFromProp, setOrderFromProp] = useState<any>(null);

  // Load order data when modal opens
  useEffect(() => {
    if (isOpen && orderData) {
      setIsDataProcessingComplete(false);
      // Use the orderData prop directly instead of localStorage
      setOrderFromProp(orderData);
      setStoredOrderData(orderData);

      if (!orderData?.id) {
        toast.error("Order data not found");
      }
    }
  }, [isOpen, orderData]);

  // Use order configuration hook
  const { data: orderConfig } = useOrderConfiguration();
  const orderConfiguration = orderConfig?.data;

  // Use cached order details hook
  const {
    orderDetails: fullOrderData,
    isLoading: isLoadingOrderDetails,
    isSuccessful,
    error,
  } = useOrderDetails(orderFromProp?.id, {
    enabled: !!orderFromProp?.id && isOpen,
  });

  // Use menu hook to get current menu items with up-to-date packing costs
  const { data: menuData, isLoading: isLoadingMenu } = useMenu();

  // Check if we should show loading state
  useEffect(() => {
    // If modal just opened and we're waiting for data
    if (
      isOpen &&
      orderFromProp?.id &&
      !isLoadingOrderDetails &&
      !isLoadingMenu
    ) {
      // If we have both successful status and menu data but still processing,
      // it means data is ready and we should complete processing
      if (
        isSuccessful &&
        menuData &&
        !isDataProcessingComplete &&
        !fullOrderData
      ) {
        // Data fetch completed but no order details returned
        setIsDataProcessingComplete(true);
      }
    }
  }, [
    isOpen,
    orderFromProp,
    isLoadingOrderDetails,
    isLoadingMenu,
    isSuccessful,
    menuData,
    isDataProcessingComplete,
    fullOrderData,
  ]);

  // Process order details when they're loaded
  useEffect(() => {
    // Only process if modal is open and we have the order prop
    if (!isOpen || !orderFromProp?.id) {
      return;
    }

    // Handle successful data load
    if (fullOrderData && isSuccessful && menuData) {
      // Validate that we have order details
      if (
        !fullOrderData.orderDetails ||
        !Array.isArray(fullOrderData.orderDetails)
      ) {
        toast.error("Invalid order data structure");
        setIsDataProcessingComplete(true);
        return;
      }

      // Filter out invalid items and process valid ones
      const validItems = fullOrderData.orderDetails.filter((item: any) => {
        return (
          item && item.itemID && item.unitPrice != null && item.quantity > 0
        );
      });

      if (validItems.length === 0) {
        toast.error("No valid items found in order");
        setIsDataProcessingComplete(true);
        return;
      }

      // Deduplicate items by merging quantities
      const uniqueItemsMap = new Map<string, any>();
      validItems.forEach((item: any) => {
        if (uniqueItemsMap.has(item.itemID)) {
          const existing = uniqueItemsMap.get(item.itemID);
          existing.quantity += item.quantity;
        } else {
          // Clone the item to avoid mutating original data
          uniqueItemsMap.set(item.itemID, { ...item });
        }
      });

      const deduplicatedItems = Array.from(uniqueItemsMap.values());

      const updatedArray = deduplicatedItems.map((item: any) => {
        const { unitPrice, quantity, itemID, ...rest } = item;

        // Correctly find the item and its category from menuData
        let foundCategory = null;
        let foundMenuItem = null;

        if (menuData) {
          for (const category of menuData) {
            const item = category.items?.find((i: any) => i.id === itemID);
            if (item) {
              foundCategory = category;
              foundMenuItem = item;
              break;
            }
          }
        }

        return {
          ...rest,
          id: itemID,
          itemID: itemID,
          price: unitPrice,
          count: quantity,
          originalCount: quantity, // Track original count for restriction logic
          categoryId: foundCategory?.id, // Important: Add categoryId for reduction logic
          // Use current menu packing cost and item details
          itemName: item.itemName || foundMenuItem?.itemName || "Unknown Item",
          menuName:
            item.menuName ||
            foundMenuItem?.menuName ||
            foundCategory?.name ||
            "",
          itemDescription:
            item.itemDescription || foundMenuItem?.itemDescription || "",
          currency: item.currency || foundMenuItem?.currency || "NGN",
          isAvailable: item.isAvailable ?? foundMenuItem?.isAvailable ?? true,
          hasVariety: item.hasVariety ?? foundMenuItem?.hasVariety ?? false,
          image: item.image || foundMenuItem?.image || "",
          varieties: item.varieties || foundMenuItem?.varieties || null,
          isVariety: item.isVariety || false,
          // Preserve historical isPacked status if available, otherwise default to false
          isPacked: item.isPacked || false,
        };
      });
      setSelectedItems(() => updatedArray);

      // Extract additional cost from order details
      setAdditionalCost(fullOrderData.additionalCost || 0);
      setAdditionalCostName(fullOrderData.additionalCostName || "");

      // Extract VAT information from order details
      const initialVatAmount = fullOrderData.vatAmount || 0;
      const initialSubtotal = fullOrderData.subTotalAmount || 0;
      setIsVatApplied(fullOrderData.isVatApplied ?? true);

      // Derive VAT rate from configuration
      // We prioritize the configuration API over calculated or stored values for the rate
      const configVatRate = orderConfiguration?.vatRate ?? 0;
      setVatRate(configVatRate > 0 ? configVatRate / 100 : 0);

      // Set initial VAT amount based on derived rate and current items
      // If VAT is enabled in config, we calculate it dynamically
      const isVatEnabled = orderConfiguration?.isVatEnabled ?? true;
      setIsVatApplied(isVatEnabled);

      if (isVatEnabled && configVatRate > 0 && initialSubtotal > 0) {
        // If we want to recalculate fresh:
        // setVatAmount(Math.round(initialSubtotal * (configVatRate / 100)));
        // Or keep existing if it matches? Let's recalculate to be safe and consistent with "new endpoint"
        // But we need to use the current calculated subtotal of the items
        // The subtotal from fullOrderData might be slightly different if items were transformed.
        // Let's rely on the useEffect that calculates VAT to set the initial amount correctly once items are set.
        // So here we just set the rate.
      } else {
        setVatAmount(0);
      }

      setIsDataProcessingComplete(true);
    }
    // If data is already loaded (cached) and successful, mark as complete
    else if (
      isSuccessful &&
      !isLoadingOrderDetails &&
      !fullOrderData &&
      menuData
    ) {
      // No order details available but query succeeded - mark as complete
      setIsDataProcessingComplete(true);
    }

    // Handle error case
    if (error) {
      toast.error("Failed to load order details");
      setIsDataProcessingComplete(true);
    }
  }, [
    fullOrderData,
    isSuccessful,
    error,
    menuData,
    isOpen,
    orderFromProp,
    isLoadingOrderDetails,
    orderConfiguration,
  ]);

  // Increment handler
  const handleIncrement = useCallback(
    (id: string) => {
      if (isUpdating) return;

      // Clear any existing timer
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      setIsUpdating(true);

      setSelectedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id
            ? { ...item, count: Math.min(item.count + 1, 999) }
            : item
        )
      );

      // Set timer outside of setState
      updateTimerRef.current = setTimeout(() => {
        setIsUpdating(false);
        updateTimerRef.current = null;
      }, 100);
    },
    [isUpdating]
  );

  // Decrement handler
  const handleDecrement = useCallback(
    (id: string) => {
      if (isUpdating) return;

      // Clear any existing timer
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      setIsUpdating(true);

      setSelectedItems((prevItems) =>
        prevItems
          .map((item) =>
            item.id === id
              ? { ...item, count: Math.max(0, item.count - 1) } // Allow 0 so it can be filtered/removed
              : item
          )
          .filter((item) => item.count > 0)
      );

      // Set timer outside of setState
      updateTimerRef.current = setTimeout(() => {
        setIsUpdating(false);
        updateTimerRef.current = null;
      }, 100);
    },
    [isUpdating, selectedItems, menuData]
  );

  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedItems.reduce((acc, item) => {
      const itemTotal = item.price * item.count;
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      return acc + itemTotal + packingTotal;
    }, 0);
  };

  // Recalculate VAT amount whenever items or VAT settings change
  useEffect(() => {
    const subtotal = calculateTotalPrice();
    if (isVatApplied && vatRate > 0) {
      const newVatAmount = Math.round(subtotal * vatRate);
      setVatAmount(newVatAmount);
    } else {
      setVatAmount(0);
    }
  }, [selectedItems, isVatApplied, vatRate]);

  // Handle Add Item - navigate to place-order page (admin) or POS page (POS users) with current order
  const handleAddItem = () => {
    // Save the current order data to localStorage so the target page can pick it up
    if (orderData) {
      saveJsonItemToLocalStorage("order", orderData);

      // Navigate to appropriate page based on user type
      const query = `?mode=add-items&orderId=${orderData.id}`;
      if (isPOSUser) {
        router.push(`/pos${query}`);
      } else {
        router.push(`/dashboard/orders/place-order${query}`);
      }
    } else {
      toast.error("Order data not available");
    }
  };

  // Reset state and cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state to initial values
      setSelectedItems([]);
      setOrderFromProp(null);
      setStoredOrderData(null);
      setIsDataProcessingComplete(false);
      setIsUpdating(false);
      setIsSaving(false);
      setAdditionalCost(0);
      setAdditionalCostName("");
      setVatAmount(0);
      setIsVatApplied(true);
      // Clear any pending timer
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        hideCloseButton
        classNames={{
          wrapper: "items-center",
          base: "max-w-2xl max-h-[90vh]",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-3 border-b border-primaryGrey">
            <div className="flex items-center justify-between w-full">
              <div className="w-full flex items-center justify-center flex-col">
                <h2 className="text-lg font-bold text-black">
                  {businessInformation?.[0]?.businessName || "N/A"}
                </h2>
                <p className="text-base font-medium text-[#808794]">
                  {businessInformation?.[0]?.businessAddress ||
                    businessInformation?.[0]?.city +
                      " " +
                      " " +
                      businessInformation?.[0]?.state ||
                    ""}
                </p>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>
            </div>
            {/* Order Details Header */}
            <div className="flex items-center justify-between w-full bg-gray-50 p-3 rounded-lg">
              <div className="w-full text-sm">
                <div className="flex items-center w-full gap-6 justify-between mb-1">
                  <span className="text-textGrey">OrderID</span>
                  <span className="ml-2 font-semibold text-black">
                    {orderData?.reference}
                  </span>
                </div>
                <div className="flex items-center w-full gap-6 justify-between mb-1">
                  <span className="text-textGrey">Table:</span>
                  <span className="ml-2 font-semibold text-black">
                    {fullOrderData?.qrReference ||
                      orderData?.qrReference ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center w-full gap-6 justify-between mb-1">
                  <span className="text-textGrey">Served by:</span>
                  <span className="ml-2 font-semibold text-black">
                    {userInformation?.firstName +
                      " " +
                      userInformation?.lastName || "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-6">
            {/* Cart Items */}
            {isLoadingOrderDetails ||
            isLoadingMenu ||
            !isDataProcessingComplete ? (
              <div className="flex flex-col h-[40vh] justify-center items-center">
                <SpinnerLoader size="md" />
                <Spacer y={3} />
                <p className="text-sm text-textGrey">
                  {isLoadingOrderDetails
                    ? "Loading order details..."
                    : isLoadingMenu
                    ? "Loading menu data..."
                    : "Processing order data..."}
                </p>
              </div>
            ) : selectedItems.length > 0 ? (
              <div className="flex-1 ">
                <div className="space-y-4 max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primaryColor scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full hover:scrollbar-thumb-primaryColor/80">
                  {selectedItems?.map((item, index) => (
                    <React.Fragment key={`${item.id}-${index}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-[500] text-base text-[#344054]">
                            {item.itemName || "Menu Item"}
                          </p>
                          <Spacer y={1} />
                          <p className="text-[#475367] text-sm">
                            {item.menuName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Button
                              onPress={() => handleDecrement(item.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="faded"
                              className="border border-[#EFEFEF]"
                              aria-label="minus"
                              isDisabled={
                                isUpdating ||
                                (() => {
                                  // Robust Check: Find category even if id is missing temporarily
                                  let categoryId = (item as any).categoryId;
                                  let category = menuData?.find(
                                    (cat: any) => cat.id === categoryId
                                  );

                                  // Fallback: Scan menuData if category not linked yet
                                  if (!category && menuData) {
                                    for (const cat of menuData) {
                                      if (
                                        cat.items?.some(
                                          (i: any) =>
                                            i.id === item.id ||
                                            i.itemID === item.id
                                        )
                                      ) {
                                        category = cat;
                                        break;
                                      }
                                    }
                                  }

                                  // User Rule: "only when true they can edit" => False = Restricted.
                                  // New Rule: "disable the button for all... only the newly increase item"
                                  // Logic: Disable if (NOT True) AND (Count <= OriginalCount).
                                  // This allows decreasing newly added items (Count > OriginalCount) but locks original items.
                                  const originalCount =
                                    (item as any).originalCount ?? 0;

                                  // Use global configuration for prevention
                                  const preventReduction =
                                    orderConfiguration?.preventOrderItemReduction ??
                                    false;

                                  // If preventReduction is TRUE, we BLOCK reducing below original count.
                                  // The button is disabled if: preventReduction IS true AND current count <= original count
                                  return !!(
                                    preventReduction &&
                                    item.count <= originalCount
                                  );
                                })()
                              }
                            >
                              <FaMinus />
                            </Button>
                            <span className="font-bold text-black py-2 px-4">
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
                          <p className="font-medium text-sm text-[#344054] w-20 text-right">
                            {formatPrice(item?.price * item.count)}
                          </p>
                        </div>
                      </div>
                      {index !== selectedItems?.length - 1 && (
                        <Divider className="bg-primaryGrey" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Payment Summary */}
                <div className="mt-6 pt-4 border-t border-primaryGrey sticky bottom-0 bg-white">
                  {/* <h3 className="text-[16px] font-[600] text-black mb-3">Payment Summary</h3> */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[14px] font-[500] text-black">
                        Subtotal
                      </h4>
                      <p className="text-[14px] font-[600] text-black">
                        {formatPrice(calculateTotalPrice())}
                      </p>
                    </div>
                    {isVatApplied && (
                      <div className="flex justify-between items-center">
                        <h4 className="text-[14px] font-[400] text-textGrey">
                          VAT
                        </h4>
                        <p className="text-[14px] font-[500] text-textGrey">
                          {formatPrice(vatAmount)}
                        </p>
                      </div>
                    )}
                    {additionalCost > 0 && (
                      <div className="flex justify-between items-center">
                        <h4 className="text-[14px] font-[400] text-textGrey">
                          {additionalCostName || "Additional Cost"}
                        </h4>
                        <p className="text-[14px] font-[500] text-textGrey">
                          {formatPrice(additionalCost)}
                        </p>
                      </div>
                    )}
                    <Divider className="bg-primaryGrey my-3" />
                    <div className="flex justify-center flex-col items-center">
                      <h4 className="text-[16px] font-[600] text-textGrey">
                        Grand Total
                      </h4>
                      <p className="text-[18px] font-[700] text-primaryColor">
                        {formatPrice(
                          calculateTotalPrice() + vatAmount + additionalCost
                        )}
                      </p>
                    </div>

                    {/* Make Payment Button - Positioned prominently below total */}
              

                    {/* Footer Buttons */}
                    <div className="flex gap-3 mt-4">
                      <CustomButton
                        onClick={handleAddItem}
                        className="h-[50px] flex-1 bg-white text-black border border-primaryGrey flex-shrink-0"
                        disabled={!orderData}
                      >
                        <div className="flex  items-center gap-2">
                          <Plus className="w-4 h-4" />
                          <span>Add Item</span>
                        </div>
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          // Save current order state before proceeding
                          if (onProceedToConfirm) {
                            onProceedToConfirm(selectedItems);
                          } else if (onProcessPayment) {
                            // Fallback to old behavior if new prop not provided
                            onProcessPayment();
                          }
                        }}
                        disabled={selectedItems.length === 0}
                        className="text-white h-[50px] flex-1"
                        backgroundColor="bg-primaryColor"
                        loading={isSaving}
                      >
                        Process Order
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[40vh] justify-center items-center">
                <img
                  className="w-[50px] h-[50px]"
                  src="/assets/images/no-menu.png"
                  alt="no menu illustration"
                />
                <Spacer y={3} />
                <p className="text-sm text-textGrey">No items in this order</p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateOrderModal;
