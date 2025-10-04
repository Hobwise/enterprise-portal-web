"use client";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
import { useState } from "react";
import { getCustomerOrderByReference } from "../api/controllers/customerOrder";
import { toast } from "sonner";
import { IoArrowBack } from "react-icons/io5";
import RestaurantBanner from "./RestaurantBanner";

interface TrackingDetailsPageProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderData: any) => void;
  businessName?: string;
  businessId?: string;
  cooperateId?: string;
  menuConfig?: {
    image?: string;
    backgroundColour?: string;
    textColour?: string;
  };
  baseString?: string;
}

const TrackingDetailsPage = ({
  isOpen,
  onClose,
  onTrackOrder,
  businessName,
  businessId,
  cooperateId,
  menuConfig,
  baseString,
}: TrackingDetailsPageProps) => {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    if (!businessId) {
      toast.error("Business information is missing. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await getCustomerOrderByReference(
        trackingId.trim(),
        businessId,
        cooperateId
      );

      console.log("API Response:", trackingId);

      if (response?.isSuccessful && response?.data) {
        onTrackOrder(response.data);
        setTrackingId(""); // Reset input
      } else {
        // Handle error response
        const errorMessage =
          response?.error?.responseDescription ||
          response?.error?.message ||
          "Order not found. Please check your tracking ID.";

        console.log("Showing error toast:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error("Failed to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
        aria-label="Go back"
      >
        <IoArrowBack className="text-gray-700 text-2xl" />
      </button>

      {/* Restaurant Banner */}
      <RestaurantBanner
        businessName={businessName}
        menuConfig={menuConfig}
        showMenuButton={false}
        baseString={baseString}
      />

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-black mb-3">Tracking Details</h2>
        <p className="text-base text-gray-600 mb-8">
          Enter your tracking id to view the progress of your order preparation
        </p>

        {/* Tracking ID Input */}
        <div className="mb-8">
          <CustomInput
            type="text"
            name="trackingId"
            placeholder="Enter tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleTrackOrder();
              }
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <CustomButton
            onClick={onClose}
            className="flex-1 h-14 bg-white border-2 border-gray-300 text-black font-medium text-base"
          >
            Back
          </CustomButton>
          <CustomButton
            onClick={handleTrackOrder}
            disabled={!trackingId.trim() || loading}
            loading={loading}
            className="flex-1 h-14 text-white font-semibold text-base"
            backgroundColor="bg-primaryColor"
          >
            Track order
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default TrackingDetailsPage;
