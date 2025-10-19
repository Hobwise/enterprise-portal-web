"use client";
import { CustomButton } from "@/components/customButton";
import { useEffect, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiArrowLongLeft } from "react-icons/hi2";
import { toast } from "sonner";
import RestaurantBanner from "./RestaurantBanner";
import { getCustomerOrderByReference } from "../api/controllers/customerOrder";
import { HiMenuAlt3 } from "react-icons/hi";

interface OrderTrackingPageProps {
  isOpen: boolean;
  onClose: () => void;
  trackingId: string;
  orderStatus: "placed" | "accepted" | "preparing" | "served";
  estimatedTime?: string;
  onAddMoreItems: () => void;
  onCheckout: (updatedOrderData?: any) => void;
  businessName?: string;
  menuConfig?: {
    image?: string;
    backgroundColour?: string;
    textColour?: string;
  };
  baseString?: string;
  orderData?: any; // Full order data from API
  businessId?: string;
  cooperateId?: string;
}

const OrderTrackingPage = ({
  isOpen,
  onClose,
  trackingId,
  orderStatus,
  estimatedTime,
  onAddMoreItems,
  onCheckout,
  businessName,
  menuConfig,
  baseString,
  orderData: initialOrderData,
  businessId,
  cooperateId,
}: OrderTrackingPageProps) => {
  // Dynamic color from menu config
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryColorStyle = { backgroundColor: primaryColor };
  const textColorStyle = { color: primaryColor };
  const borderColorStyle = { borderColor: primaryColor };

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderData, setOrderData] = useState<any>(initialOrderData);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<number | null>(null);

  // Log the trackingId when component mounts or when it changes
  useEffect(() => {
    console.log("OrderTrackingModal - trackingId prop:", trackingId);
    console.log("OrderTrackingModal - initialOrderData:", initialOrderData);
  }, [trackingId, initialOrderData]);

  // Request notification permission on mount
  useEffect(() => {
    if (
      isOpen &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [isOpen]);

  // Function to show browser notification
  const showBrowserNotification = (title: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `order-${trackingId}`,
        requireInteraction: false,
        silent: false,
      });

      setTimeout(() => notification.close(), 10000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else if (Notification.permission === "denied") {
      toast.info(title, { description: message });
    }
  };

  // Sync initialOrderData to state when it changes
  useEffect(() => {
    if (initialOrderData) {
      setOrderData(initialOrderData);
      // Set initial status for comparison
      if (previousStatus === null && initialOrderData.status !== undefined) {
        setPreviousStatus(initialOrderData.status);
      }
    }
  }, [initialOrderData, previousStatus, trackingId]);

  // Polling for order status updates
  useEffect(() => {
    if (!isOpen || !trackingId || !businessId) return;

    const pollOrderStatus = async () => {
      try {
        const response = await getCustomerOrderByReference(
          trackingId,
          businessId,
          cooperateId || ""
        );

        if (response && response.data) {
          let newOrderData = response.data;

          // Extract the reference from orderDetails if available and not already present
          if (newOrderData.orderDetails && newOrderData.orderDetails.length > 0) {
            const orderID = newOrderData.orderDetails[0]?.orderID;
            if (orderID && !newOrderData.reference) {
              newOrderData = { ...newOrderData, reference: orderID };
              console.log("Added reference field to polled orderData:", orderID);
            }
          }

          console.log("Polled order data:", newOrderData);
          console.log("Polled order data keys:", Object.keys(newOrderData));
          const newStatus = newOrderData.status;

          // Check if status has changed and show notification
          if (previousStatus !== null && previousStatus !== newStatus) {
            const statusMessages: {
              [key: number]: {
                title: string;
                message: string;
              };
            } = {
              0: {
                title: "Order Placed 📝",
                message: "Your order has been received!",
              },
              3: {
                title: "Order Accepted ✅",
                message: "Your order has been accepted and is being prepared.",
              },
              2: {
                title: "Order Ready 🎉",
                message: "Your order is ready for pickup!",
              },
              1: {
                title: "Order Completed ✨",
                message: "Your order has been completed. Enjoy!",
              },
            };

            const statusUpdate = statusMessages[newStatus];
            if (statusUpdate) {
              showBrowserNotification(statusUpdate.title, statusUpdate.message);
            }
          }

          setPreviousStatus(newStatus);
          setOrderData(newOrderData);
        }
      } catch (error) {
      }
    };

    // Poll immediately when modal opens
    pollOrderStatus();

    // Check if we should continue polling
    const shouldContinuePolling = () => {
      if (!estimatedTime) return true;
      const target = new Date(estimatedTime).getTime();
      const now = new Date().getTime();
      return now < target;
    };

    // Set up 30-second polling interval
    const pollInterval = setInterval(() => {
      if (shouldContinuePolling()) {
        pollOrderStatus();
      } else {
        clearInterval(pollInterval);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [isOpen, trackingId, businessId, cooperateId, estimatedTime]);

  // Timer countdown
  useEffect(() => {
    if (!estimatedTime) return;

    const calculateTimeLeft = () => {
      const target = new Date(estimatedTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [estimatedTime]);

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    toast.success("Tracking ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMenuClick = () => {
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    // Clear any selected items from the parent component
    if (onClose) {
      onClose();
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  // Map status enum to timeline steps
  // Status enum: Open=0, Closed=1, Cancelled=2, AwaitingConfirmation=3
  const getTimelineSteps = () => {
    const status = orderData?.status;

    switch (status) {
      case 3: // AwaitingConfirmation
        return [
          {
            key: "placed",
            label: "Order Placed",
            description: "You have successfully placed an order",
          },
          {
            key: "awaiting",
            label: "Awaiting Confirmation",
            description:
              "Your order is awaiting confirmation from the restaurant",
          },
        ];
      case 0: // Open
        return [
          {
            key: "placed",
            label: "Order Placed",
            description: "You have successfully placed an order",
          },
          {
            key: "preparing",
            label: "Preparing Order",
            description: "Be patient we are now preparing your order",
          },
          {
            key: "served",
            label: "Order Served",
            description: "You will receive your order right away",
          },
        ];
      case 1: // Closed
        return [
          {
            key: "placed",
            label: "Order Placed",
            description: "You have successfully placed an order",
          },
          {
            key: "preparing",
            label: "Preparing Order",
            description: "Be patient we are now preparing your order",
          },
          {
            key: "served",
            label: "Order Served",
            description: "You will receive your order right away",
          },
        ];
      case 2: // Cancelled
        return [
          {
            key: "placed",
            label: "Order Placed",
            description: "You have successfully placed an order",
          },
          {
            key: "cancelled",
            label: "Order Cancelled",
            description: "Your order has been cancelled",
          },
        ];
      default:
        return [
          {
            key: "placed",
            label: "Order Placed",
            description: "You have successfully placed an order",
          },
        ];
    }
  };

  const getCurrentStepIndex = () => {
    const status = orderData?.status;

    // Check if time has expired (timer shows 00:00)
    const isTimeExpired = timeLeft === "00:00";

    // Return current step index (steps before this are complete, this step is in progress)
    switch (status) {
      case 3: // AwaitingConfirmation - currently on step 1 (awaiting confirmation)
        return 1;
      case 0: // Open - currently on step 1 (preparing) - step 0 complete
        // If time expired, mark all steps as complete
        if (isTimeExpired) {
          return 999; // Use large number to mark all steps as complete
        }
        return 1;
      case 1: // Closed - all steps complete (served)
        return 999; // Use large number to mark all steps as complete
      case 2: // Cancelled - currently on step 1 (cancelled)
        return 1;
      default:
        return 0;
    }
  };

  const steps = getTimelineSteps();
  const currentStepIndex = getCurrentStepIndex();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {/* Hamburger Menu Button */}
      <button
        onClick={handleMenuClick}
        className="absolute top-4 left-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
        aria-label="Menu"
      >
        <HiMenuAlt3 className="text-gray-700 text-2xl" />
      </button>

      {/* Restaurant Banner */}
      <RestaurantBanner
        businessName={businessName}
        menuConfig={menuConfig}
        showMenuButton={false}
        baseString={baseString}
      />

      {/* Header with Timer */}
      <div className="mt-4 mb-6 px-4 max-w-4xl flex flex-col mx-auto">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Only show timer for open orders (status 0 or 3) */}
            {orderData?.status !== 1 && orderData?.status !== 2 && (
              <div className="w-full flex justify-end">
                {timeLeft && timeLeft !== "00:00" && (
                  <div className="text-3xl font-bold text-green-500">
                    {timeLeft}
                  </div>
                )}
                {timeLeft === "00:00" && (
                  <div className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                    Your order is ready
                  </div>
                )}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-black mb-4">Order Tracking</h2>

          {/* Tracking ID */}
          {trackingId && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-600">Tracking ID:</p>
                <p className="font-mono text-black font-bold text-base">
                  {trackingId}
                </p>
              </div>
              <button
                onClick={copyTrackingId}
                className="p-3 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Copy tracking ID"
              >
                {copied ? (
                  <FaCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <FaCopy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          )}

          {/* View Order Button - Shows order details */}
          <button
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            style={{
              ...borderColorStyle,
              ...textColorStyle,
              borderWidth: "2px",
            }}
            className="mt-4 w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {showOrderDetails ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                Hide Order Details
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                View Order Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Details Section */}
        {showOrderDetails && orderData && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-black mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderData.orderDetails?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-white p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">
                      {item.itemName}
                    </h4>
                    <p className="text-sm text-gray-600">{item.menuName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-gray-600">
                        ₦{item.unitPrice.toLocaleString()}
                      </span>
                      {item.isPacked && (
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            ...textColorStyle,
                            backgroundColor: `${primaryColor}50`,
                          }}
                        >
                          Packed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">
                      ₦{item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-black">Total Amount:</span>
                <span style={textColorStyle}>
                  ₦{orderData.totalAmount?.toLocaleString()}
                </span>
              </div>
              {orderData.placedByName && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>Placed by: {orderData.placedByName}</p>
                  {orderData.placedByPhoneNumber && (
                    <p>Phone: {orderData.placedByPhoneNumber}</p>
                  )}
                  {orderData.comment && <p>Note: {orderData.comment}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        <div className="space-y-8 mb-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.key} className="flex gap-6">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div
                    style={
                      isCompleted
                        ? primaryColorStyle
                        : isCurrent
                        ? {
                            backgroundColor: `${primaryColor}33`,
                            borderColor: primaryColor,
                            borderWidth: "2px",
                          }
                        : { backgroundColor: "#E5E7EB" }
                    }
                    className={`w-12 h-12 rounded-full flex items-center justify-center`}
                  >
                    {isCompleted && <FaCheck className="w-6 h-6 text-white" />}
                    {isCurrent && (
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={primaryColorStyle}
                      />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      style={
                        isCompleted
                          ? primaryColorStyle
                          : { backgroundColor: "#E5E7EB" }
                      }
                      className={`w-1 h-16`}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-4">
                  <h3
                    style={
                      isCurrent || isCompleted
                        ? textColorStyle
                        : { color: "#9CA3AF" }
                    }
                    className={`font-semibold text-lg`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Elapsed Message - Only show for open orders (not cancelled or closed) */}
        {timeLeft === "00:00" &&
          orderData?.status !== 1 &&
          orderData?.status !== 2 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-orange-800 mb-1">
                    Your order is ready!
                  </h4>
                  <p className="text-sm text-orange-700">
                    Your food is ready for pickup. Please contact staff to
                    collect your order.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Action Buttons - Disable for cancelled (2) or closed (1) orders */}
        <div className="flex gap-4 mt-8">
          <CustomButton
            onClick={onAddMoreItems}
            disabled={orderData?.status === 1 || orderData?.status === 2}
            style={
              orderData?.status === 1 || orderData?.status === 2
                ? {
                    backgroundColor: "#F3F4F6",
                    borderColor: "#D1D5DB",
                    color: "#9CA3AF",
                    borderWidth: "2px",
                  }
                : {
                    ...borderColorStyle,
                    ...textColorStyle,
                    backgroundColor: "white",
                    borderWidth: "2px",
                  }
            }
            className={`flex-1 h-14 ${
              orderData?.status === 1 || orderData?.status === 2
                ? "cursor-not-allowed"
                : ""
            } font-semibold flex items-center justify-center gap-2 text-base`}
          >
            <IoAddCircleOutline className="w-6 h-6" />
            Add items
          </CustomButton>
          <CustomButton
            onClick={() => {
              // Pass the updated order data (which includes reference) to parent
              onCheckout(orderData);
            }}
            disabled={orderData?.status === 2 || orderData?.status === 1}
            style={
              orderData?.status === 1 || orderData?.status === 1
                ? { backgroundColor: "#D1D5DB", color: "#6B7280" }
                : primaryColorStyle
            }
            className={`flex-1 h-14 ${
              orderData?.status === 1 || orderData?.status === 1
                ? "cursor-not-allowed"
                : "text-white"
            } font-semibold flex items-center justify-center gap-2 text-base`}
          >
            <span>Checkout order</span>
            <HiArrowLongLeft className="w-6 h-6 rotate-180" />
          </CustomButton>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-black mb-4">
              Save Your Order ID
            </h3>

            {/* Tracking ID Display */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Copy your order ID to track your order later:
              </p>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-600">Order ID:</p>
                  <p className="font-mono text-black font-bold text-base">
                    {trackingId}
                  </p>
                </div>
                <button
                  onClick={copyTrackingId}
                  className="p-3 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Copy order ID"
                >
                  {copied ? (
                    <FaCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <FaCopy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <CustomButton
                onClick={handleCancelLeave}
                className="flex-1 h-12 bg-white border-2 border-gray-300 text-gray-700 font-semibold"
              >
                Stay
              </CustomButton>
              <CustomButton
                onClick={handleConfirmLeave}
                className="flex-1 h-12 text-white font-semibold"
                style={primaryColorStyle}
              >
                Leave Page
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
