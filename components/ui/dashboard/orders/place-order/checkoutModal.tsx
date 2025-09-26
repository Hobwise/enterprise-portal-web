"use client";
import {
  completeOrder,
  createOrder,
  editOrder,
} from "@/app/api/controllers/dashboard/orders";
import { getQRByBusiness } from "@/app/api/controllers/dashboard/quickResponse";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { CustomTextArea } from "@/components/customTextArea";
import SelectInput from "@/components/selectInput";
import {
  cn,
  formatPrice,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from "@nextui-org/react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import noImage from "../../../../../public/assets/images/no-image.svg";
import { ordersCacheUtils } from '@/hooks/cachedEndpoints/useOrder';

interface Order {
  placedByName: string;
  placedByPhoneNumber: string;
  quickResponseID: string;
  comment: string;
  orderDetails?: OrderDetail[];
}

interface OrderDetail {
  itemID: string;
  quantity: number;
  unitPrice: number;
}

interface ApiResponse {
  data?: {
    isSuccessful: boolean;
    data?: {
      id: string;
    };
    error?: string;
  };
  errors?: {
    placedByName?: string[];
    placedByPhoneNumber?: string[];
    quickResponseID?: string[];
  };
}


// Type guard to check if response has data property
const hasDataProperty = (response: any): response is ApiResponse => {
  return response && typeof response === 'object' && 'data' in response;
};

const CheckoutModal = ({
  isOpen,
  onOpenChange,
  selectedItems,
  handleDecrement,
  handleIncrement,
  orderDetails,
  id,
  onOrderSuccess,
  businessId,
  cooperateID,
  handlePackingCost,
}: any) => {
  
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPayLaterLoading, setIsPayLaterLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    placedByName?: boolean;
    placedByPhoneNumber?: boolean;
    quickResponseID?: boolean;
  }>({});
  const [reference, setReference] = useState("");
  const [screen, setScreen] = useState(1);

  const [qr, setQr] = useState([]);
  const [order, setOrder] = useState<Order>({
    placedByName: orderDetails?.placedByName || "",
    placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
    quickResponseID: orderDetails?.quickResponseID || "",
    comment: orderDetails?.comment || "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
  const [additionalCost, setAdditionalCost] = useState(0);
  const [additionalCostName, setAdditionalCostName] = useState("");

  useEffect(() => {
    if (orderDetails) {
      setAdditionalCost(orderDetails.additionalCost);
      setAdditionalCostName(orderDetails.additionalCostName);
    }
  }, [orderDetails]);

  // Frontend validation helper function
  const validateCheckoutForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fieldErrors: any = {};

    // Validate customer name
    if (!order.placedByName?.trim()) {
      errors.push('Customer name is required');
      fieldErrors.placedByName = true;
    } else if (order.placedByName.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters long');
      fieldErrors.placedByName = true;
    } else if (!/^[a-zA-Z\s]+$/.test(order.placedByName.trim())) {
      errors.push('Customer name can only contain letters and spaces');
      fieldErrors.placedByName = true;
    }

    // Validate phone number
    if (!order.placedByPhoneNumber?.trim()) {
      errors.push('Customer phone number is required');
      fieldErrors.placedByPhoneNumber = true;
    } else {
      const phoneNumber = order.placedByPhoneNumber.trim().replace(/\D/g, ''); // Remove non-digits
      if (phoneNumber.length !== 11) {
        errors.push('Phone number must be exactly 11 digits long');
        fieldErrors.placedByPhoneNumber = true;
      } else if (!/^[0-9]{11}$/.test(phoneNumber)) {
        errors.push('Phone number can only contain digits');
        fieldErrors.placedByPhoneNumber = true;
      }
    }

    // Validate table selection
    if (!order.quickResponseID?.trim()) {
      errors.push('Table selection is required');
      fieldErrors.quickResponseID = true;
    }

    // Validate selected items
    if (!selectedItems || selectedItems.length === 0) {
      errors.push('At least one item must be selected');
    } else {
      // Validate each selected item
      const invalidItems = selectedItems.filter((item: any) =>
        !item.id ||
        !item.itemName ||
        item.count <= 0 ||
        item.price <= 0
      );
      if (invalidItems.length > 0) {
        errors.push('Some selected items have invalid data');
      }
    }

    // Set validation errors for UI
    setValidationErrors(fieldErrors);

    return { isValid: errors.length === 0, errors };
  };

  // Handle checkout button click - validate first, then proceed
  const handleCheckoutClick = () => {
    // Validate form before proceeding
    const validation = validateCheckoutForm();

    if (!validation.isValid) {
      // Show validation errors
      notify({
        title: "Validation Error",
        text: validation.errors.join(', '),
        type: "error",
      });
      return; // Stop here if validation fails
    }

    // If validation passes, show payment screen
    setScreen(2);

    // Then process the order in background (no await - let it run async)
    if (id) {
      updateOrder();
    } else {
      placeOrder();
    }
  };

  const handleClick = async (methodId: number) => {
    // Clear all screen tracking states after any payment action
    const clearScreenStates = () => {
      setScreen(1);
      onOpenChange();
      setOrderId("");
      setReference("");
      setSelectedPaymentMethod(0);
    };

    if (methodId === 3) {
      // Pay Later logic with page detection
      setIsPayLaterLoading(true);
      clearScreenStates(); // Clear states before navigation

      try {
        if (pathname === '/dashboard/orders') {
          // Already on orders page - just close modal and refresh data
          await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
          await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
          await queryClient.invalidateQueries({ queryKey: ['orders'] });

          // Call the refetch function to update the table immediately
          if (onOrderSuccess) {
            onOrderSuccess();
          }

          // Explicitly close the modal
          onOpenChange(false);
        } else {
          // Not on orders page - navigate there
          router.push("/dashboard/orders");
        }
      } catch (error) {
        console.error('Error in Pay Later:', error);
      } finally {
        setIsPayLaterLoading(false);
      }
    } else if(screen === 3){
      clearScreenStates(); // Clear states before navigation
      router.push("/dashboard/orders");
    }
    else {
      setSelectedPaymentMethod(methodId);
      setScreen(3);
    }
  };

  const paymentMethods = [
    { text: "Pay with cash", subText: " Accept payment using cash", id: 0 },
    { text: "Pay with Pos", subText: " Accept payment using Pos", id: 1 },
    {
      text: "Pay with bank transfer",
      subText: "Accept payment via bank transfer",
      id: 2,
    },
    { text: "Pay Later", subText: "Keep this order open", id: 3 },
  ];

  // Calculate detailed total price directly from selectedItems to ensure accuracy
  const calculateDetailedTotalPrice = () => {
    return selectedItems.reduce((acc: number, item: any) => {
      const itemTotal = item.price * item.count;
      // Add packing cost only if item is packed
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      return acc + itemTotal + packingTotal;
    }, 0);
  };

  const subtotal = calculateDetailedTotalPrice();
  const vatAmount = subtotal * (7.5 / 100);
  const finalTotalPrice = subtotal + vatAmount + (additionalCost || 0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = event.target;

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }

    if (name === "placedByPhoneNumber") {
      if (/^\d{0,11}$/.test(value)) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          [name]: value,
        }));
      }
    } else {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [name]: value,
      }));
    }
  };

  // Verify calculation accuracy
  const verifyCalculation = (items: any[], addCost: number = 0): {
    isValid: boolean;
    calculated: number;
    breakdown: any;
    errors: string[];
  } => {
    const errors: string[] = [];
    let subtotalCalc = 0;
    let packingCalc = 0;

    try {
      items.forEach((item, index) => {
        if (!item.id || !item.price || !item.count) {
          errors.push(`Item ${index + 1}: Missing required data (id, price, or count)`);
          return;
        }

        const itemTotal = item.price * item.count;
        const itemPacking = item.isPacked
          ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
          : 0;

        subtotalCalc += itemTotal;
        packingCalc += itemPacking;

        // Log each item calculation
        console.log(`Item ${index + 1} (${item.itemName || item.id}):`, {
          price: item.price,
          count: item.count,
          itemTotal,
          isPacked: item.isPacked,
          packingCost: item.packingCost,
          itemPacking
        });
      });

      const baseSubtotal = subtotalCalc + packingCalc;
      const vatCalc = baseSubtotal * 0.075;
      const finalCalc = baseSubtotal + vatCalc + addCost;

      const breakdown = {
        itemsSubtotal: subtotalCalc,
        packingCosts: packingCalc,
        baseSubtotal,
        vatAmount: vatCalc,
        additionalCost: addCost,
        finalTotal: Math.round(finalCalc * 100) / 100
      };

      return {
        isValid: errors.length === 0,
        calculated: breakdown.finalTotal,
        breakdown,
        errors
      };
    } catch (error) {
      errors.push(`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        calculated: 0,
        breakdown: {},
        errors
      };
    }
  };

  // Validate payload data before API call
  const validateOrderPayload = (payload: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate required fields
    if (!payload.placedByName?.trim()) {
      errors.push('Customer name is required');
    }
    if (!payload.placedByPhoneNumber?.trim()) {
      errors.push('Customer phone number is required');
    }
    if (!payload.quickResponseID?.trim()) {
      errors.push('Table selection is required');
    }

    // Validate order details
    if (!Array.isArray(payload.orderDetails) || payload.orderDetails.length === 0) {
      errors.push('At least one item must be selected');
    } else {
      payload.orderDetails.forEach((item: any, index: number) => {
        if (!item.itemID) {
          errors.push(`Item ${index + 1}: Missing item ID`);
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          errors.push(`Item ${index + 1}: Invalid quantity`);
        }
        if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Invalid unit price`);
        }
      });
    }

    // Validate total amount
    if (typeof payload.totalAmount !== 'number' || payload.totalAmount < 0) {
      errors.push('Invalid total amount');
    }

    return { isValid: errors.length === 0, errors };
  };

  const placeOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item: any) => ({
      itemID: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacked,
      packingCost: item?.packingCost || 0,
    }));

    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      additionalCost,
      additionalCostName,
      totalAmount: Math.round(finalTotalPrice * 100) / 100,
      orderDetails: transformedArray,
    };

    // Verify calculations
    const calculationVerification = verifyCalculation(selectedItems, additionalCost);
    if (!calculationVerification.isValid) {
      setLoading(false);
      notify({
        title: "Calculation Error",
        text: calculationVerification.errors.join(', '),
        type: "error",
      });
      return;
    }

    // Check if calculated total matches our frontend total
    const calculationDifference = Math.abs(calculationVerification.calculated - payload.totalAmount);
    if (calculationDifference > 0.01) {
      console.warn('Calculation mismatch detected:', {
        frontendTotal: payload.totalAmount,
        verifiedTotal: calculationVerification.calculated,
        difference: calculationDifference,
        breakdown: calculationVerification.breakdown
      });
    }

    // Validate payload before sending
    const validation = validateOrderPayload(payload);
    if (!validation.isValid) {
      setLoading(false);
      notify({
        title: "Validation Error",
        text: validation.errors.join(', '),
        type: "error",
      });
      return;
    }

    // Log payload for debugging
    console.log('Order Payload:', JSON.stringify(payload, null, 2));
    console.log('Frontend Calculation:', {
      subtotal,
      vatAmount,
      additionalCost,
      finalTotal: finalTotalPrice,
      itemsCount: selectedItems.length
    });
    console.log('Verified Calculation:', calculationVerification.breakdown);

    const id = businessId ? businessId : businessInformation[0]?.businessId;
    const data = await createOrder(id, payload, cooperateID);
    setResponse(data as ApiResponse);
    setLoading(false);

    if (hasDataProperty(data) && data.data?.isSuccessful) {
      setOrderId(data.data.data?.id || "");
      notify({
        title: "Success!",
        text: "Order placed successfully",
        type: "success",
      });

      // Clear cache and invalidate queries
      ordersCacheUtils.clearAll();
      await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
      await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Force immediate refresh if on orders page
      if (pathname === '/dashboard/orders') {
        await queryClient.refetchQueries({ queryKey: ['orders'] });
        // Call the refetch function to update the table immediately
        if (onOrderSuccess) {
          onOrderSuccess();
        }
      }

      // Stay on screen 2 (payment selection) - user needs to choose payment method
      // Screen is already set to 2 by handleCheckoutClick
    } else if (hasDataProperty(data) && data.data?.error) {
      console.error('Order creation failed:', data.data.error);
      console.error('Failed payload:', payload);
      notify({
        title: "Order Creation Failed",
        text: data.data.error,
        type: "error",
      });
    } else if (data && 'errors' in data) {
      // Handle validation errors
      const validationErrors = Object.entries(data.errors)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      console.error('Validation errors:', data.errors);
      console.error('Failed payload:', payload);
      notify({
        title: "Validation Failed",
        text: validationErrors,
        type: "error",
      });
    } else {
      console.error('Unexpected response format:', data);
      console.error('Failed payload:', payload);
      notify({
        title: "Error!",
        text: "Unexpected error occurred. Please check the console for details.",
        type: "error",
      });
    }
  };
  const updateOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item: any) => ({
      itemID: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacked,
      packingCost: item.packingCost || 0,
    }));

    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      totalAmount: Math.round(finalTotalPrice * 100) / 100,
      additionalCost,
      additionalCostName,
      orderDetails: transformedArray,
    };

    // Verify calculations
    const calculationVerification = verifyCalculation(selectedItems, additionalCost);
    if (!calculationVerification.isValid) {
      setLoading(false);
      notify({
        title: "Calculation Error",
        text: calculationVerification.errors.join(', '),
        type: "error",
      });
      return;
    }

    // Check if calculated total matches our frontend total
    const calculationDifference = Math.abs(calculationVerification.calculated - payload.totalAmount);
    if (calculationDifference > 0.01) {
      console.warn('Update calculation mismatch detected:', {
        frontendTotal: payload.totalAmount,
        verifiedTotal: calculationVerification.calculated,
        difference: calculationDifference,
        breakdown: calculationVerification.breakdown
      });
    }

    // Validate payload before sending
    const validation = validateOrderPayload(payload);
    if (!validation.isValid) {
      setLoading(false);
      notify({
        title: "Validation Error",
        text: validation.errors.join(', '),
        type: "error",
      });
      return;
    }

    // Log payload for debugging
    console.log('Update Order Payload:', JSON.stringify(payload, null, 2));
    console.log('Update Frontend Calculation:', {
      subtotal,
      vatAmount,
      additionalCost,
      finalTotal: finalTotalPrice,
      itemsCount: selectedItems.length
    });
    console.log('Update Verified Calculation:', calculationVerification.breakdown);

    const data = await editOrder(id, payload);
    setResponse(data as ApiResponse);
    setLoading(false);

    if (hasDataProperty(data) && data.data?.isSuccessful) {
      setOrderId(data.data.data?.id || "");
      notify({
        title: "Success!",
        text: "Order updated successfully",
        type: "success",
      });

      // Clear cache and invalidate queries
      ordersCacheUtils.clearAll();
      await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
      await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Force immediate refresh if on orders page
      if (pathname === '/dashboard/orders') {
        await queryClient.refetchQueries({ queryKey: ['orders'] });
        // Call the refetch function to update the table immediately
        if (onOrderSuccess) {
          onOrderSuccess();
        }
      }

      // Stay on screen 2 (payment selection) - user needs to choose payment method
      // Screen is already set to 2 by handleCheckoutClick
    } else if (hasDataProperty(data) && data.data?.error) {
      console.error('Order update failed:', data.data.error);
      console.error('Failed payload:', payload);
      notify({
        title: "Order Update Failed",
        text: data.data.error,
        type: "error",
      });
    } else if (data && 'errors' in data) {
      // Handle validation errors
      const validationErrors = Object.entries(data.errors)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      console.error('Validation errors:', data.errors);
      console.error('Failed payload:', payload);
      notify({
        title: "Validation Failed",
        text: validationErrors,
        type: "error",
      });
    } else {
      console.error('Unexpected response format:', data);
      console.error('Failed payload:', payload);
      notify({
        title: "Error!",
        text: "Unexpected error occurred. Please check the console for details.",
        type: "error",
      });
    }
  };

  const finalizeOrder = async () => {
    // Validate all form data before processing payment
    const validation = validateCheckoutForm();
    if (!validation.isValid) {
      notify({
        title: "Validation Error",
        text: "Please fix all validation errors before confirming payment: " + validation.errors.join(', '),
        type: "error",
      });
      return;
    }

    if (!orderId) {
      notify({
        title: "Error!",
        text: "Order ID is missing. Please try again.",
        type: "error",
      });
      return;
    }

    if (!userInformation?.id) {
      notify({
        title: "Error!",
        text: "User information is missing. Please refresh and try again.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
        treatedById: userInformation.id,
        paymentMethod: selectedPaymentMethod,
        paymentReference: reference,
        status: 1,
      };

      const data = await completeOrder(payload, orderId);

      if (hasDataProperty(data) && data.data?.isSuccessful) {
        notify({
          title: "Payment made!",
          text: "Payment has been made, awaiting confirmation",
          type: "success",
        });

        // Immediately close modal or navigate to prevent flash
        if (pathname === '/dashboard/orders') {
          // Already on orders page - just close modal
          onOpenChange(false);
        } else {
          // Not on orders page - navigate there
          router.push("/dashboard/orders");
        }

        // Background cleanup operations (users won't see these)
        // Clear cache and invalidate queries
        ordersCacheUtils.clearAll();
        await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
        await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
        await queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Call the refetch function to update the table immediately
        if (onOrderSuccess) {
          onOrderSuccess();
        }

        // Clear all screen states after payment completion
        setScreen(1);
        setOrderId("");
        setReference("");
        setSelectedPaymentMethod(0);

      } else if (hasDataProperty(data) && data.data?.error) {
        notify({
          title: "Error!",
          text: data.data.error,
          type: "error",
        });
      } else {
        notify({
          title: "Error!",
          text: "Failed to process payment. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      notify({
        title: "Error!",
        text: "Network error. Please check your connection and try again.",
        type: "error",
      });
    }
  };

  const getQrID = async () => {
    const id = businessId ? businessId : businessInformation[0]?.businessId;

    const data = await getQRByBusiness(id, cooperateID);

    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      const newData = response.map((item: any) => ({
        ...item,
        label: item.name,
        value: item.id,
      }));

      // Sort alphabetically by label/name
      const sortedData = newData.sort((a: any, b: any) => a.label.localeCompare(b.label));
      setQr(sortedData);
    } else if (data?.data?.error) {
    }
  };

  useEffect(() => {
    setOrder({
      placedByName: orderDetails?.placedByName || "",
      placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
      quickResponseID: orderDetails?.quickResponseID || "",
      comment: orderDetails?.comment || "",
    });
  }, [orderDetails]);

  useEffect(() => {
    getQrID();
  }, []);

  // Reset screen and states when modal opens
  useEffect(() => {
    if (isOpen) {
      setScreen(1);
      setOrderId("");
      setReference("");
      setSelectedPaymentMethod(0);
      setIsPayLaterLoading(false);
    }
  }, [isOpen]);

  return (
    <div className="">
      <Modal
        classNames={{
          base: screen === 1
            ? "md:overflow-none overflow-scroll h-full md:h-auto max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px]"
            : "md:overflow-none overflow-scroll h-full md:h-auto max-w-[90vw] md:max-w-[500px]",
          body: "px-1 md:px-6",
          header: "px-3 md:px-6",
        }}
        isDismissable={false}
        hideCloseButton={true}
        size={screen === 1 ? "5xl" : "md"}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            // When closing the modal, reset all states
            setScreen(1);
            setReference("");
            setIsPayLaterLoading(false);
            setSelectedPaymentMethod(0);
            setOrderId("");
            setOrder({
              placedByName: orderDetails?.placedByName || "",
              placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
              quickResponseID: orderDetails?.quickResponseID || "",
              comment: orderDetails?.comment || "",
            });
            setAdditionalCost(orderDetails?.additionalCost || 0);
            setAdditionalCostName(orderDetails?.additionalCostName || "");
          }
          onOpenChange(open);
        }}
      >
        <ModalContent>
          {() => (
            <>
              {screen === 1 && (
                <>
                  <ModalHeader className="flex flex-col mt-5 gap-1">
                    <div className="flex flex-row flex-wrap  justify-between">
                      <div>
                        <div className="text-[24px] leading-8 font-semibold">
                          <span className="text-black">Confirm order</span>
                        </div>
                        <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
                          Confirm order before checkout
                        </p>
                      </div>

                      <div className="gap-3 flex ">
                        <CustomButton
                          onClick={onOpenChange}
                          className="py-2 px-4 mb-0 bg-white border border-primaryGrey"
                        >
                          Close
                        </CustomButton>

                        <CustomButton
                          loading={loading}
                          disabled={loading}
                          onClick={handleCheckoutClick}
                          className="py-2 px-4 mb-0 text-white"
                          backgroundColor="bg-primaryColor"
                        >
                          <div className="flex gap-2 items-center justify-center">
                            <p>Checkout {formatPrice(finalTotalPrice)} </p>
                            <HiArrowLongLeft className="text-[22px] rotate-180" />
                          </div>
                        </CustomButton>
                      </div>
                    </div>
                    <Divider className="bg-primaryGrey" />
                  </ModalHeader>
                  <ModalBody>
                    <div className="flex lg:flex-row flex-col gap-3 mb-4">
                      <div className="lg:w-[60%] max-h-[500px]  overflow-y-scroll w-full rounded-lg border border-[#E4E7EC80] p-2">
                        {selectedItems?.map((item: any, index: number) => {
                          return (
                            <React.Fragment key={item.id}>
                              <div
                                className="flex justify-between gap-2"
                              >
                                <div className="py-3 w-[250px] rounded-lg  text-black  flex">
                                  <div className="h-[60px] w-[60px]">
                                    <Image
                                      src={
                                        item?.image
                                          ? `data:image/jpeg;base64,${item?.image}`
                                          : noImage
                                      }
                                      width={60}
                                      height={60}
                                      className="object-cover rounded-lg bg-cover h-[60px]"
                                      aria-label="uploaded image"
                                      alt="uploaded image(s)"
                                    />
                                  </div>

                                  <div className="px-3 flex  flex-col text-sm justify-center">
                                    <p className="font-[600]">
                                      {item.menuName}
                                    </p>
                                    <Spacer y={2} />
                                    <p className="text-grey600">
                                      {item.itemName}{" "}
                                      <span className="text-black">
                                        {item.unit && `(${item.unit})`}
                                      </span>
                                    </p>
                                    {item.packingCost > 0 && (
                                      <Checkbox
                                        size="sm"
                                        defaultSelected={item.isPacked}
                                        isSelected={item.isPacked}
                                        onValueChange={(isSelected) =>
                                          handlePackingCost(item.id, isSelected)
                                        }
                                      >
                                        <span className="text-grey600 text-sm">
                                          Pack In
                                        </span>
                                      </Checkbox>
                                    )}
                                    <Spacer y={2} />
                                    <div className="text-black md:w-[150px] md:hidden w-auto grid place-content-end">
                                      <h3 className="font-[600]">
                                        {formatPrice(item?.price)}
                                      </h3>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex  items-center">
                                  <Button
                                    onPress={() => handleDecrement(item.id)}
                                    isIconOnly
                                    size="sm"
                                    radius="sm"
                                    variant="faded"
                                    className="border h-[35px] w-[30px] border-primaryGrey bg-white"
                                    aria-label="minus"
                                  >
                                    <FaMinus />
                                  </Button>
                                  <span className="font-bold  text-black py-2 px-4">
                                    {item.count}
                                  </span>
                                  <Button
                                    onPress={() => handleIncrement(item.id)}
                                    isIconOnly
                                    radius="sm"
                                    size="sm"
                                    variant="faded"
                                    className="border h-[35px] w-[30px] border-primaryGrey bg-white"
                                    aria-label="plus"
                                  >
                                    <FaPlus />
                                  </Button>
                                </div>
                                <div className=" md:w-[150px] hidden w-auto md:grid place-content-center">
                                  <div className="flex flex-col">
                                    <h3 className="font-semibold text-black">
                                      {formatPrice(item?.price  * item.count)}
                                    </h3>
                                    {item.packingCost > 0 && (
                                      <span
                                        className={cn(
                                          "text-xs text-gray-200",
                                          item.isPacked && "font-bold text-black"
                                        )}
                                      >
                                        {formatPrice(item.packingCost)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {index !== selectedItems?.length - 1 && (
                                <Divider className="bg-[#E4E7EC80]" />
                              )}
                            </React.Fragment>
                          );
                        })}
                        <div className="flex justify-end mt-auto">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                              <p className="text-black font-bold">Subtotal: </p>
                              <p className="text-black">
                                {formatPrice(subtotal)}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">
                                Vat (7.5%):{" "}
                              </p>
                              <p className="text-black">
                                {formatPrice(vatAmount)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-black font-bold">
                                Additional cost:{" "}
                              </p>
                              <div className="w-40">
                                <CustomInput
                                  type="number"
                                  size="sm"
                                  startContent={
                                    <span className="text-gray-500">₦</span>
                                  }
                                  onChange={(e: any) =>
                                    setAdditionalCost(+e.target.value)
                                  }
                                  value={String(additionalCost)}
                                  name="additionalCost"
                                  placeholder="Amount"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between  gap-2">
                              <p className="text-black font-bold">
                                Additional cost name:{" "}
                              </p>
                              <div className="w-40">
                                <CustomInput
                                  type="text"
                                  size="sm"
                                  onChange={(e: any) =>
                                    setAdditionalCostName(e.target.value)
                                  }
                                  value={additionalCostName}
                                  name="additionalCostName"
                                  placeholder="Enter cost name"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">Total: </p>
                              <p className="text-black">
                                {formatPrice(finalTotalPrice)}
                              </p>
                            </div>
                            {/* <div className="flex gap-2">
                              <p className="text-black font-bold">
                                Additional cost:{' '}
                              </p>
                  
                            </div> */}
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow bg-[#F7F6FA] z-10 rounded-lg p-4">
                        <CustomInput
                          type="text"
                          onChange={handleInputChange}
                          errorMessage={response?.errors?.placedByName?.[0]}
                          isInvalid={!!validationErrors.placedByName}
                          value={order.placedByName}
                          name="placedByName"
                          label="Name"
                          placeholder="Enter name"
                        />
                        <Spacer y={2} />
                        <CustomInput
                          type="text"
                          errorMessage={
                            response?.errors?.placedByPhoneNumber?.[0]
                          }
                          isInvalid={!!validationErrors.placedByPhoneNumber}
                          onChange={handleInputChange}
                          value={order.placedByPhoneNumber}
                          name="placedByPhoneNumber"
                          label="Phone number"
                          placeholder="Enter phone number"
                        />
                        <Spacer y={2} />

                        <SelectInput
                          errorMessage={response?.errors?.quickResponseID?.[0]}
                          isInvalid={!!validationErrors.quickResponseID}
                          label="Select a table"
                          placeholder="Select table"
                          name="quickResponseID"
                          selectedKeys={[order?.quickResponseID]}
                          onChange={handleInputChange}
                          value={order.quickResponseID}
                          contents={qr}
                        />
                        <Spacer y={2} />
                        <CustomTextArea
                          // defaultValue={menuItem?.itemDescription}
                          value={order.comment}
                          name="comment"
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setResponse(null);
                            setOrder((prevOrder) => ({
                              ...prevOrder,
                              comment: e.target.value,
                            }));
                          }}
                          label="Add comment"
                          placeholder="Add a comment to this order. (optional)"
                        />
                      </div>
                    </div>
                  </ModalBody>
                </>
              )}
              {screen === 2 && (
                <div className="p-5">
                  <div className="flex justify-between mt-3">
                    <div>
                      <div className=" text-[18px] leading-8 font-semibold">
                        <span className="text-black">
                          Select payment method
                        </span>
                      </div>
                      <p className="text-sm  text-primaryColor xl:mb-8 w-full mb-4">
                        {formatPrice(finalTotalPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-black">
                    {paymentMethods.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => !isPayLaterLoading && handleClick(item.id)}
                        className={`flex items-center gap-2 p-4 rounded-lg justify-between ${
                          selectedPaymentMethod === item.id
                            ? "bg-[#EAE5FF80]"
                            : ""
                        } ${
                          isPayLaterLoading
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">
                            {item.text}
                            {item.id === 3 && isPayLaterLoading && (
                              <span className="ml-2 text-sm">Processing...</span>
                            )}
                          </p>
                          <p className="text-sm text-grey500">{item.subText}</p>
                        </div>
                        {item.id === 3 && isPayLaterLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primaryColor"></div>
                        ) : (
                          <MdKeyboardArrowRight />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {screen === 3 && (
                <>
                  <div
                    onClick={() => setScreen(2)}
                    className={`p-4 cursor-pointer text-black flex items-center`}
                  >
                    <IoIosArrowRoundBack className="text-2xl" />
                    <span className="text-sm ">Back</span>
                  </div>
                  <div className="px-5 pb-5">
                    <div>
                      <div className=" text-[18px] leading-8 font-semibold">
                        <span className="text-black">Confirm payment</span>
                      </div>
                      <p className="text-sm  text-grey500 xl:mb-8 w-full mb-4">
                        confirm that customer has paid for order
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 p-4 rounded-lg justify-between bg-[#EAE5FF80]`}
                    >
                      <div>
                        <p className="text-sm text-grey500">TOTAL ORDER</p>
                        <p className="font-bold text-black text-[20px]">
                          {" "}
                          {formatPrice(finalTotalPrice)}
                        </p>
                      </div>
                      <MdKeyboardArrowRight />
                    </div>
                    <Spacer y={4} />
                    <CustomInput
                      type="text"
                      // defaultValue={menuItem?.itemName}
                      value={reference}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReference(e.target.value)}
                      name="itemName"
                      label="Enter ref"
                      placeholder="Provide payment reference"
                    />
                    <Spacer y={5} />
                    <div className="flex md:flex-row flex-col gap-5">
                      <CustomButton
                        onClick={onOpenChange}
                        className="bg-white h-[50px] w-full border border-primaryGrey"
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        loading={isLoading}
                        disabled={isLoading}
                        onClick={finalizeOrder}
                        className="text-white w-full h-[50px]"
                      >
                        <div className="flex gap-2 items-center justify-center">
                          <p>{"Confirm payment"} </p>
                          <HiArrowLongLeft className="text-[22px] rotate-180" />
                        </div>
                      </CustomButton>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>{" "}
    </div>
  );
};

export default CheckoutModal;