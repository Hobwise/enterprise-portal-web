"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Button,
  Divider,
  Spacer,
} from "@nextui-org/react";
import { HiArrowLongLeft } from "react-icons/hi2";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { X } from "lucide-react";
import { editOrder, getOrder } from "@/app/api/controllers/dashboard/orders";
import {
  getJsonItemFromLocalStorage,
  formatPrice,
  clearItemLocalStorage,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import { CustomButton } from "@/components/customButton";
import SpinnerLoader from "../menu/SpinnerLoader";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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
}

const UpdateOrderModal: React.FC<UpdateOrderModalProps> = ({
  isOpen,
  onOpenChange,
  orderData,
  onOrderUpdated,
  onProcessPayment,
}) => {
  const router = useRouter();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  // State management
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] =
    useState<boolean>(false);
  const [storedOrderData, setStoredOrderData] = useState<OrderData | null>(
    null
  );
  const [fullOrderData, setFullOrderData] = useState<any>(null);

  // Fetch order details from API (exact logic from menuList.tsx)
  const getOrderDetails = async () => {
    // Get fresh order data from localStorage when modal opens
    const orderFromStorage = getJsonItemFromLocalStorage("order");

    if (!orderFromStorage?.id) {
      toast.error("Order data not found");
      return;
    }

    // Store order data in component state
    setStoredOrderData(orderFromStorage);

    setIsLoadingOrderDetails(true);
    const response = await getOrder(orderFromStorage.id);

    setIsLoadingOrderDetails(false);
    if (response?.data?.isSuccessful) {
      // Store the full order data for display
      setFullOrderData(response?.data?.data);

      const updatedArray = response?.data?.data.orderDetails.map(
        (item: any) => {
          const { unitPrice, quantity, itemID, ...rest } = item;

          return {
            ...rest,
            id: itemID,
            itemID: itemID,
            price: unitPrice,
            count: quantity,
            packingCost: item.packingCost || 0,
            isVariety: item.isVariety || false,
            isPacked: item.isPacked || false,
          };
        }
      );
      setSelectedItems(() => updatedArray);
      // Don't clear localStorage here - wait until successful update
    } else if (response?.data?.error) {
      toast.error("Failed to load order details");
    }
  };

  // Load order details when modal opens
  useEffect(() => {
    if (isOpen) {
      getOrderDetails();
    }
  }, [isOpen]);

  // Increment handler
  const handleIncrement = useCallback(
    (id: string) => {
      if (isUpdating) return;

      setIsUpdating(true);

      setSelectedItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === id
            ? { ...item, count: Math.min(item.count + 1, 999) }
            : item
        );
        setTimeout(() => setIsUpdating(false), 100);
        return updatedItems;
      });
    },
    [isUpdating]
  );

  // Decrement handler
  const handleDecrement = useCallback(
    (id: string) => {
      if (isUpdating) return;

      setIsUpdating(true);

      setSelectedItems((prevItems) => {
        const updatedItems = prevItems
          .map((item) =>
            item.id === id
              ? { ...item, count: Math.max(1, item.count - 1) }
              : item
          )
          .filter((item) => item.count > 0);

        setTimeout(() => setIsUpdating(false), 100);
        return updatedItems;
      });
    },
    [isUpdating]
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

  // Handle Add Item - navigate to place-order page with current order
  const handleAddItem = () => {
    // Save the current order data to localStorage so place-order page can pick it up
    if (storedOrderData) {
      saveJsonItemToLocalStorage("order", storedOrderData);
      router.push("/dashboard/orders/place-order");
    } else {
      toast.error("Order data not available");
    }
  };

  // Save order changes
  const handleSaveOrder = async () => {
    if (!storedOrderData || selectedItems.length === 0) {
      toast.error("Order data or items not found");
      return;
    }

    setIsSaving(true);

    try {
      const orderDetails = selectedItems.map((item) => ({
        itemID: item.itemID,
        quantity: item.count,
        unitPrice: item.price,
        isVariety: item.isVariety || false,
        isPacked: item.isPacked || false,
      }));

      const updatePayload = {
        placedByName: storedOrderData.placedByName,
        placedByPhoneNumber: storedOrderData.placedByPhoneNumber,
        userId: userInformation?.id || "",
        quickResponseID: storedOrderData.qrReference,
        status: storedOrderData.status,
        comment: storedOrderData.comment || "",
        additionalCostName: "",
        additionalCost: 0,
        totalAmount: calculateTotalPrice() * 1.075,
        estimatedCompletionTime: new Date().toISOString(),
        orderDetails,
      };

      const response = await editOrder(storedOrderData.id, updatePayload);

      if (response && "data" in response && response.data?.isSuccessful) {
        toast.success("Order updated successfully");
        // Clear localStorage only after successful update
        clearItemLocalStorage("order");
        onOrderUpdated();
        onOpenChange(false);
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([]);
      setIsLoadingOrderDetails(false);
    }
  }, [isOpen]);

  const totalItems = selectedItems.reduce(
    (total, item) => total + item.count,
    0
  );

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
                <h2 className="text-lg font-bold text-black">{businessInformation?.[0]?.businessName || "N/A"}</h2>
                <p className="text-base font-medium text-[#808794]">
                  {businessInformation?.[0]?.businessAddress || "Location not available"}
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
                      storedOrderData?.qrReference ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center w-full gap-6 justify-between mb-1">
                  <span className="text-textGrey">Served by:</span>
                  <span className="ml-2 font-semibold text-black">
                    {fullOrderData?.placedByName || 
                      "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-6">
            {/* Business Name Header */}
            {/* <div className="mb-6">
              <h1 className="text-lg font-[700] text-black">
                {businessInformation?.[0]?.businessName || 'Business Name'}
              </h1>
              <p className="text-sm text-textGrey">
                {totalItems} Item{totalItems !== 1 ? 's' : ''} 
              </p>
            </div> */}

            {/* Cart Items */}
            {isLoadingOrderDetails ? (
              <div className="flex flex-col h-[40vh] justify-center items-center">
                <SpinnerLoader size="md" />
                <Spacer y={3} />
                <p className="text-sm text-textGrey">
                  Loading order details...
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
                              isDisabled={isUpdating}
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
                            {formatPrice(item?.price)}
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
                    <div className="flex justify-between items-center">
                      <h4 className="text-[14px] font-[400] text-textGrey">
                        VAT (7.5%)
                      </h4>
                      <p className="text-[14px] font-[500] text-textGrey">
                        {formatPrice(calculateTotalPrice() * 0.075)}
                      </p>
                    </div>
                    <Divider className="bg-primaryGrey my-3" />
                    <div className="flex justify-center flex-col items-center">
                      <h4 className="text-[16px] font-[600] text-textGrey">
                        Grand Total
                      </h4>
                      <p className="text-[18px] font-[700] text-primaryColor">
                        {formatPrice(calculateTotalPrice() * 1.075)}
                      </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 mt-6">
                      {/* {storedOrderData?.status === 0 && onProcessPayment && (
                        <CustomButton
                        className="h-[50px] flex-1 bg-green-600 text-white"
                        onClick={onProcessPayment}
                          disabled={selectedItems.length === 0}
                        >
                          Process Payment
                        </CustomButton>
                      )} */}
                      <CustomButton
                        onClick={handleAddItem}
                        className="h-[50px] flex-1 bg-white text-black border border-primaryGrey flex-shrink-0"
                        disabled={!storedOrderData}
                      >
                        <div className="flex  items-center gap-2">
                          <Plus className="w-4 h-4" />
                          <span>Add Item</span>
                        </div>
                      </CustomButton>
                      <CustomButton
                        // onClick={handleSaveOrder}
                           onClick={onProcessPayment}
                          disabled={selectedItems.length === 0}
                        className="text-white h-[50px] flex-1"
                        backgroundColor="bg-primaryColor"
                        loading={isSaving}
                        // disabled={selectedItems.length === 0}
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
