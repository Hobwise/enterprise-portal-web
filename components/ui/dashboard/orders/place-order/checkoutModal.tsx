"use client";
import {
  completeOrderWithPayment,
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
import { IoClose } from "react-icons/io5";
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

type ValidationErrors = {
  placedByName?: string;
  placedByPhoneNumber?: string;
  quickResponseID?: string;
  additionalCostName?: string;
};



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
  categoriesData,
}: any) => {

  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  // Use cooperateID prop if provided, otherwise get from userInformation
  const effectiveCooperateID = cooperateID || userInformation?.cooperateID;

  // Debug logging for cooperateID (can be removed in production)
  // console.log('CheckoutModal cooperateID debug:', {
  //   propCooperateID: cooperateID,
  //   userCooperateID: userInformation?.cooperateID,
  //   effectiveCooperateID: effectiveCooperateID,
  //   businessId: businessId || businessInformation[0]?.businessId
  // });
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
    additionalCostName?: boolean;
  }>({});
  const [reference, setReference] = useState("");
  const [screen, setScreen] = useState(1);
  const [mobileSubStep, setMobileSubStep] = useState<'1A' | '1B' | '1C'>('1A');

  const [qr, setQr] = useState<{ id: string; label: string; name?: string; value?: string }[]>([]);
  const [order, setOrder] = useState<Order>({
    placedByName: orderDetails?.placedByName || "",
    placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
    quickResponseID: orderDetails?.quickResponseID || orderDetails?.qrReference || "",
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

    // Validate customer name (optional, will default to "anonymous" if empty)
    if (order.placedByName?.trim()) {
      if (order.placedByName.trim().length < 2) {
        errors.push('Customer name must be at least 2 characters long');
        fieldErrors.placedByName = true;
      } else if (!/^[a-zA-Z\s]+$/.test(order.placedByName.trim())) {
        errors.push('Customer name can only contain letters and spaces');
        fieldErrors.placedByName = true;
      }
    }

    // Validate phone number (optional, but if provided must be valid)
    if (order.placedByPhoneNumber?.trim()) {
      const phoneNumber = order.placedByPhoneNumber.trim().replace(/\D/g, ''); // Remove non-digits
      if (phoneNumber.length < 10 || phoneNumber.length > 11) {
        errors.push('Phone number must be 10-11 digits');
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

    // Validate additional cost name if additional cost is provided
    if (additionalCost > 0 && !additionalCostName?.trim()) {
      errors.push('Additional cost name is required when amount is provided');
      fieldErrors.additionalCostName = true;
    }

    // Set validation errors for UI
    setValidationErrors(fieldErrors);

    return { isValid: errors.length === 0, errors };
  };

  // Validate customer information step (1B to 1C)
  const validateCustomerInfo = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fieldErrors: any = {};

    // Validate customer name (optional, will default to "anonymous" if empty)
    if (order.placedByName?.trim()) {
      if (order.placedByName.trim().length < 2) {
        errors.push('Customer name must be at least 2 characters long');
        fieldErrors.placedByName = true;
      } else if (!/^[a-zA-Z\s]+$/.test(order.placedByName.trim())) {
        errors.push('Customer name can only contain letters and spaces');
        fieldErrors.placedByName = true;
      }
    }

    // Validate phone number (optional, but if provided must be valid)
    if (order.placedByPhoneNumber?.trim()) {
      const phoneNumber = order.placedByPhoneNumber.trim().replace(/\D/g, ''); // Remove non-digits
      if (phoneNumber.length < 10 || phoneNumber.length > 11) {
        errors.push('Phone number must be 10-11 digits');
        fieldErrors.placedByPhoneNumber = true;
      }
    }

    // Validate table selection
    if (!order.quickResponseID?.trim()) {
      errors.push('Table selection is required');
      fieldErrors.quickResponseID = true;
    }

    // Set validation errors for UI
    setValidationErrors(fieldErrors);

    return { isValid: errors.length === 0, errors };
  };

  // Handle mobile sub-step navigation with validation
  const handleMobileNavigation = (targetStep: '1A' | '1B' | '1C') => {
    // If moving from 1B to 1C, validate customer information
    if (mobileSubStep === '1B' && targetStep === '1C') {
      const validation = validateCustomerInfo();
      if (!validation.isValid) {
        return; // Stop navigation if validation fails
      }
    }

    // If validation passes or moving to previous steps, navigate
    setMobileSubStep(targetStep);
  };

  // Handle checkout button click - validate first, then proceed
  const handleCheckoutClick = async () => {
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

    // Set loading state before processing order
    setLoading(true);

    // Process the order and wait for completion
    try {
      if (id) {
        await updateOrder();
      } else {
        await placeOrder();
      }

      // Transition to payment screen immediately after successful order placement
      // Cache operations are now non-blocking, so no delay needed
      setScreen(2);
      setLoading(false);
    } catch (error) {
      console.error('Error during checkout:', error);
      setLoading(false);
      notify({
        title: "Error",
        text: "Failed to process checkout. Please try again.",
        type: "error",
      });
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
          // Invalidate all order-related queries to force refetch from backend
          await queryClient.invalidateQueries({
            queryKey: ['orderCategories'],
            refetchType: 'active'
          });
          await queryClient.invalidateQueries({
            queryKey: ['orderDetails'],
            refetchType: 'active'
          });
          await queryClient.invalidateQueries({
            queryKey: ['orders'],
            refetchType: 'active'
          });

          // Force immediate refetch of all active queries
          await queryClient.refetchQueries({
            queryKey: ['orderCategories'],
            type: 'active'
          });
          await queryClient.refetchQueries({
            queryKey: ['orderDetails'],
            type: 'active'
          });
          await queryClient.refetchQueries({
            queryKey: ['orders'],
            type: 'active'
          });

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

  // Handle cancel payment - same as "Pay Later" logic
  const handleCancelPayment = async () => {
    // Clear screen states
    setScreen(1);
    setOrderId("");
    setReference("");
    setSelectedPaymentMethod(0);

    try {
      if (pathname === '/dashboard/orders') {
        // Already on orders page - just close modal and refresh data
        // Invalidate all order-related queries to force refetch from backend
        await queryClient.invalidateQueries({
          queryKey: ['orderCategories'],
          refetchType: 'active'
        });
        await queryClient.invalidateQueries({
          queryKey: ['orderDetails'],
          refetchType: 'active'
        });
        await queryClient.invalidateQueries({
          queryKey: ['orders'],
          refetchType: 'active'
        });

        // Force immediate refetch of all active queries
        await queryClient.refetchQueries({
          queryKey: ['orderCategories'],
          type: 'active'
        });
        await queryClient.refetchQueries({
          queryKey: ['orderDetails'],
          type: 'active'
        });
        await queryClient.refetchQueries({
          queryKey: ['orders'],
          type: 'active'
        });

        // Call the refetch function to update the table immediately
        if (onOrderSuccess) {
          onOrderSuccess();
        }

        // Close the modal
        onOpenChange(false);
        } else {
        // Not on orders page - close modal and navigate there
        onOpenChange(false);
        router.push("/dashboard/orders");
        }
      } catch (error) {
      console.error('Error in Cancel Payment:', error);
      // Still close the modal even if refresh fails
      onOpenChange(false);
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

  const getVatRateDecimal = (): number => {
    if (!selectedItems || selectedItems.length === 0) return 0;

    for (const item of selectedItems) {
      // Prefer category-based VAT when available
      if (item?.categoryId && categoriesData) {
        const category = categoriesData.find((cat: any) => cat.categoryId === item.categoryId);
        if (category?.isVatEnabled && category?.vatRate && category.vatRate > 0) {
          return category.vatRate > 1 ? category.vatRate / 100 : category.vatRate;
        }
      }

      // Fallback to item-level VAT if present (used in POS/other flows)
      if (item?.isVatEnabled && item?.vatRate && item.vatRate > 0) {
        return item.vatRate > 1 ? item.vatRate / 100 : item.vatRate;
      }
    }

    return 0;
  };

  // Calculate detailed total price directly from selectedItems to ensure accuracy
  const calculateDetailedTotalPrice = (): { itemsSubtotal: number; packingSubtotal: number; vatAmount: number } => {
    let itemsSubtotal = 0;
    let packingSubtotal = 0;
    let vatAmount = 0;

    // First, calculate total subtotals for all items
    selectedItems.forEach((item: any) => {
      // Round each item calculation to prevent floating point errors
      const itemPrice = Number(item.price) || 0;
      const itemCount = Number(item.count) || 0;
      const itemTotal = Math.round(itemPrice * itemCount * 100) / 100;

      itemsSubtotal += itemTotal;

      // Add packing cost only if item is packed
      if (item.isPacked && item.packingCost > 0) {
        const packingCostPerItem = Number(item.packingCost) || 0;
        const packingTotal = Math.round(packingCostPerItem * itemCount * 100) / 100;
        packingSubtotal += packingTotal;
      }
    });

    // Round subtotals
    itemsSubtotal = Math.round(itemsSubtotal * 100) / 100;
    packingSubtotal = Math.round(packingSubtotal * 100) / 100;

    // Calculate VAT on the total subtotal (items + packing), not per item
    const vatRateDecimal = getVatRateDecimal();
    if (vatRateDecimal > 0) {
      const totalSubtotal = itemsSubtotal + packingSubtotal;
      vatAmount = Math.round(totalSubtotal * vatRateDecimal * 100) / 100;
    }

    vatAmount = Math.round(vatAmount * 100) / 100;

    return { itemsSubtotal, packingSubtotal, vatAmount };
  };

  const { itemsSubtotal, packingSubtotal, vatAmount } = calculateDetailedTotalPrice();
  console.log(vatAmount)
  const subtotal = itemsSubtotal + packingSubtotal;
  // Round final total to 2 decimal places
  const finalTotalPrice = Math.round((subtotal + vatAmount + (Number(additionalCost) || 0)) * 100) / 100;

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
    let itemsSubtotal = 0;
    let packingSubtotal = 0;
    let vatCalc = 0;

    try {
      // First, calculate total subtotals for all items
      items.forEach((item, index) => {
        if (!item.id || item.price === undefined || item.count === undefined) {
          errors.push(`Item ${index + 1}: Missing required data (id, price, or count)`);
        return;
        }

        // Use same calculation logic as main function
        const itemPrice = Number(item.price) || 0;
        const itemCount = Number(item.count) || 0;
        const itemTotal = Math.round(itemPrice * itemCount * 100) / 100;

        itemsSubtotal += itemTotal;

        // Add packing cost only if item is packed
        if (item.isPacked && item.packingCost > 0) {
          const packingCostPerItem = Number(item.packingCost) || 0;
          const packingTotal = Math.round(packingCostPerItem * itemCount * 100) / 100;
          packingSubtotal += packingTotal;
        }

        // Log each item calculation
        const category = item.categoryId && categoriesData 
          ? categoriesData.find((cat: any) => cat.categoryId === item.categoryId)
          : null;
        console.log(`Item ${index + 1} (${item.itemName || item.id}):`, {
          price: itemPrice,
          count: itemCount,
          itemTotal,
          isPacked: item.isPacked,
          packingCost: item.packingCost,
          packingTotal: item.isPacked ? Math.round((Number(item.packingCost) || 0) * itemCount * 100) / 100 : 0,
          isVatEnabled: category?.isVatEnabled || false,
          vatRate: category?.vatRate || 0,
        });
      });

      // Round subtotals
      itemsSubtotal = Math.round(itemsSubtotal * 100) / 100;
      packingSubtotal = Math.round(packingSubtotal * 100) / 100;

      // Calculate VAT on the total subtotal (items + packing), not per item
      const vatRateDecimal = getVatRateDecimal();
      if (vatRateDecimal > 0) {
        const totalSubtotal = itemsSubtotal + packingSubtotal;
        vatCalc = Math.round(totalSubtotal * vatRateDecimal * 100) / 100;
      }

      vatCalc = Math.round(vatCalc * 100) / 100;

      const baseSubtotal = itemsSubtotal + packingSubtotal;
      const additionalCostRounded = Math.round((Number(addCost) || 0) * 100) / 100;
      const finalCalc = Math.round((baseSubtotal + vatCalc + additionalCostRounded) * 100) / 100;

      const breakdown = {
        itemsSubtotal,
        packingCosts: packingSubtotal,
        baseSubtotal,
        vatAmount: vatCalc,
        additionalCost: additionalCostRounded,
        finalTotal: finalCalc
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
    // Name is optional (will default to "anonymous" if empty)
    // Phone is optional
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
    // Debug log at start
    console.log('PlaceOrder called with:', {
      selectedItems: selectedItems?.length || 0,
      order,
      additionalCost,
      finalTotalPrice
    });

    // Safety check: Ensure we have required data
    if (!selectedItems || selectedItems.length === 0) {
      notify({
        title: "Error",
        text: "No items selected for checkout",
        type: "error",
      });
      throw new Error("No items selected for checkout");
    }

    if (!order.quickResponseID) {
      notify({
        title: "Error",
        text: "Please select a table",
        type: "error",
      });
      throw new Error("Please select a table");
    }

    let payload: any = {};
    try {
      const transformedArray = selectedItems.map((item: any) => {
        const finalItemID = item.itemID || item.id;
        // console.log(`Item transform: ${item.itemName} - id: ${item.id}, itemID: ${item.itemID}, using: ${finalItemID}`);
        return {
          itemID: finalItemID,  // Use itemID if available, fallback to id
          quantity: item.count,
          unitPrice: item.price,
          isVariety: item.isVariety,
          isPacked: item.isPacked,
          packingCost: item?.packingCost || 0,
        };
      });

      // Default name to "anonymous" if not provided
      const customerName = order.placedByName?.trim() || "anonymous";

      payload = {
        status: 0,
        placedByName: customerName,
        placedByPhoneNumber: order.placedByPhoneNumber?.trim() || "",
        quickResponseID: order.quickResponseID,
        comment: order.comment,
        additionalCost: Math.round((Number(additionalCost) || 0) * 100) / 100,
        additionalCostName: additionalCostName || '',
        totalAmount: finalTotalPrice,  // Already rounded in calculation
        orderDetails: transformedArray,
      };
    } catch (error) {
      console.error('Error building payload:', error);
      notify({
        title: "Error",
        text: "Failed to prepare order data",
        type: "error",
      });
      throw new Error("Failed to prepare order data");
    }

    // Verify calculations
    const calculationVerification = verifyCalculation(selectedItems, additionalCost);
    if (!calculationVerification.isValid) {
      notify({
        title: "Calculation Error",
        text: calculationVerification.errors.join(', '),
        type: "error",
      });
      throw new Error(calculationVerification.errors.join(', '));
    }

    // Check if calculated total matches our frontend total
    const _calculationDifference = Math.abs(calculationVerification.calculated - payload.totalAmount);
    // if (_calculationDifference > 0.01) {
    //   console.warn('Calculation mismatch detected:', {
    //     frontendTotal: payload.totalAmount,
    //     verifiedTotal: calculationVerification.calculated,
    //     difference: _calculationDifference,
    //     breakdown: calculationVerification.breakdown
    //   });
    // }

    // Validate payload before sending
    const validation = validateOrderPayload(payload);
    if (!validation.isValid) {
      notify({
        title: "Validation Error",
        text: validation.errors.join(', '),
        type: "error",
      });
      throw new Error(validation.errors.join(', '));
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

    console.log('Calling createOrder with:', {
      id,
      cooperateID: effectiveCooperateID,
      payloadSize: JSON.stringify(payload).length
    });

    const data = await createOrder(id, payload, effectiveCooperateID);

    console.log('CreateOrder response:', data);

    // Handle undefined response
    if (!data) {
      console.error('CreateOrder returned undefined');
      console.error('Request details:', { id, cooperateID: effectiveCooperateID, payload });
      notify({
        title: "Error!",
        text: "Failed to create order. Please check your connection and try again.",
        type: "error",
      });
      throw new Error('Failed to create order');
    }

    setResponse(data as ApiResponse);

    if (hasDataProperty(data)) {
      const apiData = data as ApiResponse;
      if (apiData.data?.isSuccessful) {
        setOrderId(apiData.data?.data?.id || "");
        notify({
          title: "Success!",
          text: "Order placed successfully",
          type: "success",
        });

        // Clear cache synchronously (fast operation)
        ordersCacheUtils.clearAll();

        // Run cache/query operations in background without blocking screen transition
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['orderCategories'],
            refetchType: 'active'
          }),
          queryClient.invalidateQueries({
            queryKey: ['orderDetails'],
            refetchType: 'active'
          }),
          queryClient.invalidateQueries({
            queryKey: ['orders'],
            refetchType: 'active'
          })
        ]).then(() => {
          // Only refetch if on orders page
          if (pathname === '/dashboard/orders') {
            return Promise.all([
              queryClient.refetchQueries({
                queryKey: ['orderCategories'],
                type: 'active'
              }),
              queryClient.refetchQueries({
                queryKey: ['orderDetails'],
                type: 'active'
              }),
              queryClient.refetchQueries({
                queryKey: ['orders'],
                type: 'active'
              })
            ]);
          }
        }).catch(error => {
          console.error('Background refresh error:', error);
        });

        // Screen transition will happen in handleCheckoutClick immediately
        // Note: onOrderSuccess is NOT called here to preserve cart items during payment flow
        // It will be called after successful payment completion in finalizeOrder
      } else if (apiData.data?.error) {
        console.error('Order creation failed:', apiData.data?.error);
        console.error('Failed payload:', payload);
        notify({
          title: "Order Creation Failed",
          text: apiData.data?.error || "Unknown error",
          type: "error",
        });
        throw new Error(apiData.data?.error || "Order creation failed");
      }
    } else if (data && 'errors' in data) {
      // Handle validation errors
      const errorData = data as ApiResponse;
      const validationErrors = Object.entries(errorData.errors || {})
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      console.error('Validation errors:', errorData.errors);
      console.error('Failed payload:', payload);
      notify({
        title: "Validation Failed",
        text: validationErrors,
        type: "error",
      });
      throw new Error('Validation failed');
        } else {
      console.error('Unexpected response format:', data);
      console.error('Failed payload:', payload);
      notify({
        title: "Error!",
        text: "Unexpected error occurred. Please check the console for details.",
        type: "error",
      });
      throw new Error('Unexpected error occurred');
    }
  };
  const updateOrder = async () => {
    // Safety check: Ensure we have required data
    if (!selectedItems || selectedItems.length === 0) {
      notify({
        title: "Error",
        text: "No items selected for checkout",
        type: "error",
      });
      throw new Error("No items selected for checkout");
    }

    if (!order.quickResponseID) {
      notify({
        title: "Error",
        text: "Please select a table",
        type: "error",
      });
      throw new Error("Please select a table");
    }
    const transformedArray = selectedItems.map((item: any) => {
      const finalItemID = item.itemID || item.id;
      // console.log(`Update Item transform: ${item.itemName} - id: ${item.id}, itemID: ${item.itemID}, using: ${finalItemID}`);
      return {
        itemID: finalItemID,  // Use itemID if available, fallback to id
        quantity: item.count,
        unitPrice: item.price,
        isVariety: item.isVariety,
        isPacked: item.isPacked,
        packingCost: item.packingCost || 0,
      };
    });

    // Default name to "anonymous" if not provided
    const customerName = order.placedByName?.trim() || "anonymous";

    const payload = {
      status: 0,
      placedByName: customerName,
      placedByPhoneNumber: order.placedByPhoneNumber?.trim() || "",
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      totalAmount: finalTotalPrice,  // Already rounded in calculation
      additionalCost: Math.round((Number(additionalCost) || 0) * 100) / 100,
      additionalCostName: additionalCostName || '',
      orderDetails: transformedArray,
    };

    // Verify calculations
    const calculationVerification = verifyCalculation(selectedItems, additionalCost);
    if (!calculationVerification.isValid) {
      notify({
        title: "Calculation Error",
        text: calculationVerification.errors.join(', '),
        type: "error",
      });
      throw new Error(calculationVerification.errors.join(', '));
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
      notify({
        title: "Validation Error",
        text: validation.errors.join(', '),
        type: "error",
      });
      throw new Error(validation.errors.join(', '));
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

    if (!id) {
      notify({
        title: "Error",
        text: "Cannot update order: Order ID is missing",
        type: "error",
      });
      throw new Error("Cannot update order: Order ID is missing");
    }

    let data;
    try {
      data = await editOrder(id, payload);
      // Clear phone validation errors for existing orders
      if (data && 'errors' in data && data.errors?.placedByPhoneNumber) {
        const { placedByPhoneNumber, ...otherErrors } = data.errors;
        setResponse({ ...data, errors: otherErrors } as ApiResponse);
        } else {
        setResponse(data as ApiResponse);
      }
    } catch (error) {
      console.error('editOrder API call failed:', error);
      console.error('Payload that was sent:', JSON.stringify(payload, null, 2));
      notify({
        title: "Error!",
        text: "Failed to update order. Please try again.",
        type: "error",
      });
      throw new Error("Failed to update order");
    }

    if (hasDataProperty(data) && data.data?.isSuccessful) {
      setOrderId(data.data.data?.id || "");
      notify({
        title: "Success!",
        text: "Order updated successfully",
        type: "success",
      });

      // Clear cache synchronously (fast operation)
      ordersCacheUtils.clearAll();

      // Run cache/query operations in background without blocking screen transition
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['orderCategories'],
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ['orderDetails'],
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders'],
          refetchType: 'active'
        })
      ]).then(() => {
        // Only refetch if on orders page
        if (pathname === '/dashboard/orders') {
          return Promise.all([
            queryClient.refetchQueries({
              queryKey: ['orderCategories'],
              type: 'active'
            }),
            queryClient.refetchQueries({
              queryKey: ['orderDetails'],
              type: 'active'
            }),
            queryClient.refetchQueries({
              queryKey: ['orders'],
              type: 'active'
            })
          ]);
        }
      }).catch(error => {
        console.error('Background refresh error:', error);
      });

      // Screen transition will happen in handleCheckoutClick immediately
      // Note: onOrderSuccess is NOT called here to preserve cart items during payment flow
      // It will be called after successful payment completion in finalizeOrder

      // Stay on screen 2 (payment selection) - user needs to choose payment method
      // Screen is already set to 2 by handleCheckoutClick
    } else if (hasDataProperty(data) && data.data?.error) {
      console.error('Order update failed:', data.data.error);
      console.error('Payload that was sent:', JSON.stringify(payload, null, 2));
      notify({
        title: "Order Update Failed",
        text: data.data.error,
        type: "error",
      });
      throw new Error(data.data.error || "Order update failed");
    } else if (data && 'errors' in data) {
      // Handle validation errors
      const errorData = data as ApiResponse;
      const validationErrors = Object.entries(errorData.errors || {})
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      console.error('Validation errors:', errorData.errors);
      console.error('Payload that was sent:', JSON.stringify(payload, null, 2));
      notify({
        title: "Validation Failed",
        text: validationErrors,
        type: "error",
      });
      throw new Error('Validation failed');
    } else {
      console.error('Unexpected response format:', data);
      console.error('Payload that was sent:', JSON.stringify(payload, null, 2));
      notify({
        title: "Error!",
        text: "Unexpected error occurred. Please check the console for details.",
        type: "error",
      });
      throw new Error('Unexpected error occurred');
    }
  };

  const getPaymentConfirmationText = () => {
    switch (selectedPaymentMethod) {
      case 0: // Cash
        return "This is confirmation that the total order sum has been paid by the customer in full with cash deposit";
      case 1: // POS
        return "This is confirmation that the total order sum has been paid by the customer in full with POS card deposit";
      case 2: // Bank Transfer
        return "This is confirmation that the total order sum has been transferred by the customer in full to account";
      default:
        return "confirm that customer has paid for order";
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

      const data = await completeOrderWithPayment(payload, orderId);

      if (hasDataProperty(data) && data.data?.isSuccessful) {
        // Clear loading state immediately
        setIsLoading(false);

        notify({
          title: "Payment made!",
          text: "Payment has been made, awaiting confirmation",
          type: "success",
        });

        // Clear all screen states BEFORE closing modal to prevent re-renders
        setScreen(1);
        setOrderId("");
        setReference("");
        setSelectedPaymentMethod(0);

        // Call onOrderSuccess to clear cart (on POS page) BEFORE closing modal
        // This ensures cart is cleared after payment is confirmed
        if (onOrderSuccess) {
          onOrderSuccess();
        }

        // Close modal or navigate
        if (pathname === '/dashboard/orders') {
          // Already on orders page - just close modal
          onOpenChange(false);
        } else {
          // Not on orders page - navigate there
          router.push("/dashboard/orders");
        }

        // Background cleanup operations (users won't see these)
        // Clear cache and invalidate queries - be more aggressive to ensure fresh data
        ordersCacheUtils.clearAll();

        // Invalidate all order-related queries to force refetch from backend
        await queryClient.invalidateQueries({
          queryKey: ['orderCategories'],
          refetchType: 'active'
        });
        await queryClient.invalidateQueries({
          queryKey: ['orderDetails'],
          refetchType: 'active'
        });
        await queryClient.invalidateQueries({
          queryKey: ['orders'],
          refetchType: 'active'
        });

        // Force immediate refetch of all active queries
        await queryClient.refetchQueries({
          queryKey: ['orderCategories'],
          type: 'active'
        });
        await queryClient.refetchQueries({
          queryKey: ['orderDetails'],
          type: 'active'
        });
        await queryClient.refetchQueries({
          queryKey: ['orders'],
          type: 'active'
        });

        // Note: onOrderSuccess was already called above (before closing modal)
        // to ensure cart is cleared at the right time

      } else if (hasDataProperty(data) && data.data?.error) {
        notify({
          title: "Error!",
          text: data.data.error,
          type: "error",
        });
        setIsLoading(false);
      } else {
        notify({
          title: "Error!",
          text: "Failed to process payment. Please try again.",
          type: "error",
        });
        setIsLoading(false);
      }
    } catch (error) {
      notify({
        title: "Error!",
        text: "Network error. Please check your connection and try again.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const getQrID = async () => {
    const id = businessId ? businessId : businessInformation[0]?.businessId;

    const data = await getQRByBusiness(id, effectiveCooperateID);

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
    if (orderDetails) {
      // If we have a qrReference (table name), find the corresponding ID from the qr array
      let tableId = orderDetails?.quickResponseID || "";

      // If quickResponseID is empty or is actually a table name, find the ID
      if (!tableId || qr.some((table: any) => table.label === tableId)) {
        const tableName = orderDetails?.qrReference || tableId;
        const matchingTable = qr.find((table: any) => table.label === tableName);
        tableId = matchingTable?.id || tableId;
      }

      setOrder({
        placedByName: orderDetails?.placedByName || "",
        placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
        quickResponseID: tableId,
        comment: orderDetails?.comment || "",
      });
    }
  }, [orderDetails, qr]);
  useEffect(() => {
    getQrID();
  }, []);

  console.log(orderDetails?.quickResponseID || orderDetails?.qrReference || orderDetails)

  // Reset screen and states when modal opens
  useEffect(() => {
    if (isOpen) {
      setScreen(1);
      setOrderId(id || ""); // Use the id prop if provided, otherwise empty string
      setReference("");
      setSelectedPaymentMethod(0);
      setIsPayLaterLoading(false);
    }
  }, [isOpen, id]);

  return (
    <div className="">
      <Modal
        classNames={{
          base: screen === 1
            ? "md:overflow-none overflow-hidden md:h-auto max-w-[100vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px] m-0 md:m-auto mb-safe"
            : "md:overflow-none overflow-hidden md:h-auto max-w-[100vw] md:max-w-[90vw] md:max-w-[500px] m-0 md:m-auto",
          body: "px-4 py-2 md:px-6 flex-1 overflow-y-auto",
          header: "px-4 py-3 md:px-6 flex-shrink-0",
          wrapper: "!fixed !inset-0 items-center justify-center",
        }}
        isDismissable={false}
        hideCloseButton={true}
        size={screen === 1 ? "5xl" : "md"}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            // When closing the modal, reset all states
            setScreen(1);
            setMobileSubStep('1A');
            setReference("");
            setIsPayLaterLoading(false);
            setSelectedPaymentMethod(0);
            setOrderId("");
            setOrder({
              placedByName: orderDetails?.placedByName || "",
              placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
              quickResponseID: orderDetails?.quickResponseID || orderDetails?.qrReference || "",
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
                  {/* Desktop Layout */}
                  <div className="hidden md:block">
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
                            <IoClose className="text-xl" />
                          </CustomButton>

                          <CustomButton
                            loading={loading}
                            disabled={loading}
                            onClick={handleCheckoutClick}
            className="py-2 px-4 mb-0 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-2 items-center justify-center">
                              <p>Checkout {formatPrice(finalTotalPrice, 'NGN')} </p>
              <HiArrowLongLeft className="text-[22px] rotate-180" />
            </div>
          </CustomButton>
        </div>
                      </div>
                      <Divider className="bg-primaryGrey" />
                    </ModalHeader>
      </div>

                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {mobileSubStep === '1A' && (
                      <ModalHeader className="flex flex-col gap-3 bg-white border-b border-gray-200 sticky bottom-0 z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-semibold text-black">
                              Review Items
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Step 1 of 3
                            </p>
                          </div>
                          <CustomButton
                            onClick={onOpenChange}
                            className="py-2 px-3 mb-0 bg-white border border-gray-300 text-sm"
                          >
                            <IoClose className="text-lg" />
                          </CustomButton>
                        </div>
                      </ModalHeader>
                    )}

                    {mobileSubStep === '1B' && (
                      <ModalHeader className="flex flex-col gap-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-semibold text-black">
                              Customer Details
              </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Step 2 of 3
                            </p>
                          </div>
                          <CustomButton
                            onClick={() => handleMobileNavigation('1A')}
                            className="py-2 px-3 mb-0 bg-white border border-gray-300 text-sm"
                          >
                            Back
                          </CustomButton>
                        </div>
                      </ModalHeader>
                    )}

                    {mobileSubStep === '1C' && (
                      <ModalHeader className="flex flex-col gap-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-semibold text-black">
                              Review Order
          </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Step 3 of 3
                            </p>
        </div>
                          <CustomButton
                            onClick={() => handleMobileNavigation('1B')}
                            className="py-2 px-3 mb-0 bg-white border border-gray-300 text-sm"
                          >
                            Back
                          </CustomButton>
          </div>
                      </ModalHeader>
                    )}
                </div>
                
                  {/* Desktop ModalBody */}
                  <div className="hidden md:block">
                    <ModalBody>
                      <div className="flex lg:flex-row flex-col gap-3 mb-4">
                        <div className="lg:w-[60%] max-h-[500px]  overflow-y-scroll w-full rounded-lg border border-[#E4E7EC80] p-2">
                        {selectedItems?.map((item: any, index: number) => {
                    return (
                            <React.Fragment key={item.uniqueKey || `${item.id}-${index}`}>
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
                                      
                                       {item.itemName}
                                    </p>
                                    <Spacer y={2} />
                                    <p className="text-grey600">
                                    {item.menuName} {" "}
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
                                        {formatPrice(item?.price, 'NGN')}
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
                                      {formatPrice(item?.price  * item.count, 'NGN')}
                                    </h3>
                                    {item.packingCost > 0 && (
                                      <span
                                        className={cn(
                                          "text-xs text-gray-200",
                                          item.isPacked && "font-bold text-black"
                                        )}
                                      >
                                        {formatPrice(item.packingCost * item.count, 'NGN')} 
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
                                {formatPrice(subtotal, 'NGN')}
                              </p>
                </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">
                                VAT:{" "}
                              </p>
                              <p className="text-black">
                                {formatPrice(vatAmount, 'NGN')}
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
                                  onChange={(e: any) => {
                                    setAdditionalCostName(e.target.value);
                                    // Clear validation error when user starts typing
                                    if (validationErrors.additionalCostName) {
                                      setValidationErrors(prev => ({
                                        ...prev,
                                        additionalCostName: false
                                      }));
                                    }
                                  }}
                                  value={additionalCostName}
                                  name="additionalCostName"
                                  placeholder="Enter cost name"
                                  isInvalid={!!validationErrors.additionalCostName}
                                  errorMessage={validationErrors.additionalCostName ? "Cost name is required" : ""}
                                />
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">Total: </p>
                              <p className="text-black">
                                {formatPrice(finalTotalPrice, 'NGN')}
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
                          label="Name (optional)"
                          placeholder="Enter name (defaults to anonymous)"
                        />
                        <Spacer y={2} />
                        <CustomInput
                          type="tel"
                          errorMessage={
                            !id && response?.errors?.placedByPhoneNumber?.[0]
                          }
                          isInvalid={!!validationErrors.placedByPhoneNumber}
                          onChange={handleInputChange}
                          value={order.placedByPhoneNumber}
                          name="placedByPhoneNumber"
                          label="Phone number (optional)"
                          placeholder="Enter phone number"
                        />
                        <Spacer y={2} />

                        <SelectInput
                          errorMessage={response?.errors?.quickResponseID?.[0]}
                          isInvalid={!!validationErrors.quickResponseID}
                          label="Select a table"
                          placeholder="Select table"
                          name="quickResponseID"
                          selectedKeys={order?.quickResponseID ? [order.quickResponseID] : []}
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
                  </div>

                  {/* Mobile ModalBody */}
                  <div className="block md:hidden flex-col min-h-0">
                    {mobileSubStep === '1A' && (
                      <ModalBody className="flex-1 overflow-y-auto" style={{ scrollPaddingTop: '2rem', scrollPaddingBottom: '2rem', maxHeight: 'calc(100vh - 12rem)' }}>
                        {/* Mobile Step 1A: Items Review */}
                        <div className="space-y-4 pb-4">
                          {selectedItems?.map((item: any, index: number) => {
                            return (
                              <React.Fragment key={item.id}>
                                <div className="flex flex-col space-y-3 p-4 border border-[#E4E7EC80] rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <Image
                                        className="w-12 h-12 rounded-lg object-cover"
                                        src={
                                          item?.image
                                            ? `data:image/jpeg;base64,${item?.image}`
                                            : noImage
                                        }
                                        width={48}
                                        height={48}
                                        alt={item.itemName}
                                      />
                                      <div>
                                        <h3 className="font-semibold text-sm text-black">
                                          {item.itemName}
                                        </h3>
                                        <p className="text-xs text-grey600">{item.menuName}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-sm text-black">
                                        {formatPrice(item?.price * item.count, 'NGN')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <Button
                                        onPress={() => handleDecrement(item.id)}
                                        isIconOnly
                                        radius="sm"
                                        size="md"
                                        variant="faded"
                                        className="border border-[#EFEFEF] h-10 w-10"
                                        aria-label="minus"
                                      >
                                        <FaMinus className="text-sm" />
                                      </Button>
                                      <span className="font-bold text-lg text-black min-w-[2rem] text-center">
                                        {item.count}
                                      </span>
                                      <Button
                                        onPress={() => handleIncrement(item.id)}
                                        isIconOnly
                                        radius="sm"
                                        size="md"
                                        variant="faded"
                                        className="border border-[#EFEFEF] h-10 w-10"
                                        aria-label="plus"
                                      >
                                        <FaPlus className="text-sm" />
                                      </Button>
                                    </div>

                                    {(item.packingCost > 0) && (
                                      <Checkbox
                                        size="sm"
                                        onChange={(e) => handlePackingCost(item.id, e.target.checked)}
                                        isSelected={item.isPacked}
                                        className="text-sm"
                                      >
                                        <span className="text-sm">
                                           Packing ({formatPrice(item.packingCost, 'NGN')})
                                        </span>
                                      </Checkbox>
                                    )}
                                  </div>
                                </div>
                                {index !== selectedItems?.length - 1 && (
                                  <Divider className="bg-[#E4E7EC80]" />
                                )}
                              </React.Fragment>
                            );
                          })}


                          {/* Continue Button - At bottom */}
                          <div className="bg-white pt-4 pb-safe border-t border-gray-200 mt-6">
                          {/* Mobile Pricing Summary */}
                          <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                                <span className="text-sm text-grey600">Subtotal</span>
                                <span className="font-semibold text-sm text-black">
                                  {formatPrice(subtotal, 'NGN')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-grey600">VAT</span>
                                <span className="font-semibold text-sm text-black">
                                  {formatPrice(vatAmount, 'NGN')}
                                </span>
                    </div>
                    <Divider className="my-2" />
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-base text-black">Total</span>
                                <span className="font-bold text-lg text-primaryColor">
                                  {formatPrice(finalTotalPrice, 'NGN')}
                                </span>
                              </div>
                            </div>
                          </div>
                            <CustomButton
                              onClick={() => handleMobileNavigation('1B')}
                              className="w-full py-5 text-white font-semibold"
                              backgroundColor="bg-primaryColor"
                            >
                              Continue
                            </CustomButton>
                          </div>
                        </div>
                      </ModalBody>
                    )}

                    {mobileSubStep === '1B' && (
                      <ModalBody className="flex-1 overflow-y-auto pb-24" style={{ scrollPaddingTop: '2rem', scrollPaddingBottom: '8rem', maxHeight: 'calc(100vh - 12rem)' }}>
                        {/* Mobile Step 1B: Customer Information */}
                        <div className="space-y-6 pb-[300px]">
                          <CustomInput
                            type="text"
                            value={order.placedByName}
                            name="placedByName"
                            onChange={handleInputChange}
                            label="Customer name (optional)"
                            placeholder="Enter customer name (defaults to anonymous)"
                            isRequired={false}
                            classnames="w-full h-12 mb-4"
                            isInvalid={validationErrors.placedByName}
                            errorMessage={validationErrors.placedByName ? "Name must be at least 2 characters and contain only letters" : ""}
                          />

                          <CustomInput
                            type="tel"
                            value={order.placedByPhoneNumber}
                            name="placedByPhoneNumber"
                            onChange={handleInputChange}
                            label="Phone number (optional)"
                            placeholder="Enter phone number"
                            isRequired={false}
                            classnames={"h-12 w-full mb-4"}
                            isInvalid={validationErrors.placedByPhoneNumber}
                            errorMessage={validationErrors.placedByPhoneNumber ? "Phone number must be 10-11 digits" : ""}
                          />

                          <div className="w-full">
                            <SelectInput
                              label="Select table"
                              placeholder="Choose a table"
                              isRequired={true}
                              name="quickResponseID"
                              selectedKeys={order?.quickResponseID ? [order.quickResponseID] : []}
                              onChange={handleInputChange}
                              value={order.quickResponseID}
                              contents={qr}
                              className="w-full"
                              isInvalid={validationErrors.quickResponseID}
                              errorMessage={validationErrors.quickResponseID ? "Table selection is required" : ""}
                              isMobile={true}
                            />
                          </div>

                          <CustomTextArea
                            value={order.comment}
                            name="comment"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                              setResponse(null);
                              setOrder((prevOrder) => ({
                                ...prevOrder,
                                comment: e.target.value,
                              }));
                            }}
                            label="Add comment (optional)"
                            placeholder="Add any special instructions or comments"
                            classnames="w-full mb-4"
                          />

                          {/* Continue Button - At bottom */}
                          <div className="bg-white pt-4 pb-safe mt-auto">
                            <CustomButton
                              onClick={() => handleMobileNavigation('1C')}
                              className="w-full py-4 text-white font-semibold"
                              backgroundColor="bg-primaryColor"
                            >
                              Continue to Review
                            </CustomButton>
                          </div>
                        </div>
                      </ModalBody>
                    )}

                    {mobileSubStep === '1C' && (
                      <ModalBody className="flex-1 overflow-y-auto pb-24" style={{ scrollPaddingTop: '2rem', scrollPaddingBottom: '8rem', maxHeight: 'calc(100vh - 12rem)' }}>
                        {/* Mobile Step 1C: Final Review */}
                        <div className="space-y-6 pb-4">
                          {/* Customer Information Summary */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-sm text-black mb-3">Customer Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-grey600">Name:</span>
                                <span className="text-black font-medium">{order.placedByName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-grey600">Phone:</span>
                                <span className="text-black font-medium">{order.placedByPhoneNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-grey600">Table:</span>
                                <span className="text-black font-medium">
                                  {(qr as any[]).find((table: any) => table.id === order.quickResponseID)?.name || order.quickResponseID}
                                </span>
                              </div>
                              {order.comment && (
                                <div className="flex justify-between">
                                  <span className="text-grey600">Comment:</span>
                                  <span className="text-black font-medium">{order.comment}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Items Summary */}
                          <div className="p-4 border border-[#E4E7EC80] rounded-lg">
                            <h3 className="font-semibold text-sm text-black mb-3">Order Items ({selectedItems?.length})</h3>
                            <div className="space-y-3">
                              {selectedItems?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-black">{item.itemName}</p>
                                    <p className="text-xs text-grey600">
                                      Qty: {item.count} × {formatPrice(item.price, 'NGN')}
                                      {item.isPacked && ` + Packing (${formatPrice(item.packingCost, 'NGN')})`}
                      </p>
                    </div>
                                  <p className="text-sm font-semibold text-black">
                                    {formatPrice(item.price * item.count + (item.isPacked ? item.packingCost * item.count : 0), 'NGN')}
                                  </p>
                  </div>
                              ))}
                            </div>
                          </div>

                          {/* Final Pricing */}

                          <div className="p-4 bg-primaryColor bg-opacity-10 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-grey600">Subtotal</span>
                                <span className="font-semibold text-black">{formatPrice(subtotal, 'NGN')}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-grey600">VAT</span>
                                <span className="font-semibold text-black">{formatPrice(vatAmount, 'NGN')}</span>
                              </div>
                              <Divider className="my-2" />
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-black">Total</span>
                                <span className="font-bold text-xl text-primaryColor">
                                  {formatPrice(finalTotalPrice, 'NGN')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Checkout Button - At bottom */}
                          <div className="bg-white pt-4 pb-safe mt-auto">
                            <CustomButton
                              loading={loading}
                              disabled={loading}
                              onClick={handleCheckoutClick}
                              className="w-full py-4 text-white font-semibold"
                              backgroundColor="bg-primaryColor"
                            >
                              <div className="flex gap-2 items-center justify-center">
                                <p className="font-semibold">Proceed to Payment</p>
                                <HiArrowLongLeft className="text-[20px] rotate-180" />
                              </div>
                            </CustomButton>
                          </div>
                        </div>
                      </ModalBody>
                    )}
                </div>
              </>
              )}
              {screen === 2 && (
                <>
                  {/* Desktop Layout */}
                  <div className="hidden md:block p-5">
                    <div className="flex justify-between mt-3">
                      <div>
                        <div className=" text-[18px] leading-8 font-semibold">
                          <span className="text-black">
                            Select payment method
                          </span>
                        </div>
                        <p className="text-sm  text-primaryColor xl:mb-8 w-full mb-4">
                          {formatPrice(finalTotalPrice, 'NGN')}
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

                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    <ModalHeader className="flex flex-col gap-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-semibold text-black">
                            Select Payment Method
                          </div>
                          <p className="text-sm text-primaryColor mt-1 font-semibold">
                            {formatPrice(finalTotalPrice, 'NGN')}
                    </p>
                     </div>
                        <CustomButton
                          onClick={() => {
                            setScreen(1);
                            setMobileSubStep('1C');
                          }}
                          className="py-2 px-3 mb-0 bg-white border border-gray-300 text-sm"
                        >
                          Back
                        </CustomButton>
                  </div>
                    </ModalHeader>

                    <ModalBody className="flex-1 overflow-y-auto pb-safe" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                      <div className="space-y-3 py-4">
                        {paymentMethods.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => !isPayLaterLoading && handleClick(item.id)}
                            className={`flex items-center gap-3 p-5 rounded-lg border justify-between transition-all ${
                              selectedPaymentMethod === item.id
                                ? "bg-[#EAE5FF80] border-primaryColor"
                                : "border-gray-200"
                            } ${
                              isPayLaterLoading
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer active:scale-95"
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-base text-black">
                                {item.text}
                                {item.id === 3 && isPayLaterLoading && (
                                  <span className="ml-2 text-sm font-normal">Processing...</span>
                                )}
                              </p>
                              <p className="text-sm text-grey500 mt-1">{item.subText}</p>
                            </div>
                            {item.id === 3 && isPayLaterLoading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primaryColor"></div>
                            ) : (
                              <MdKeyboardArrowRight className="text-2xl text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ModalBody>
                  </div>
              </>
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
                        {getPaymentConfirmationText()}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 p-4 rounded-lg justify-between bg-[#EAE5FF80]`}
                    >
                      <div>
                        <p className="text-sm text-grey500">TOTAL ORDER</p>
                        <p className="font-bold text-black text-[20px]">
                          {" "}
                          {formatPrice(finalTotalPrice, 'NGN')}
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
                        onClick={handleCancelPayment}
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