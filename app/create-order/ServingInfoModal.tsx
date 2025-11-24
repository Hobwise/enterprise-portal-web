"use client";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
import { CustomTextArea } from "@/components/customTextArea";
import { useState, useEffect } from "react";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";
import RestaurantBanner from "./RestaurantBanner";

interface ServingInfoModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: ServingInfoData) => void;
  onBack?: () => void;
  loading?: boolean;
  errors?: any;
  businessName?: string;
  menuConfig?: {
    image?: string;
    backgroundColour?: string;
    textColour?: string;
  };
  baseString?: string;
  initialData?: ServingInfoData; // Initial data for prefilling form
}

export interface ServingInfoData {
  name: string;
  phoneNumber: string;
  comment: string;
}

const ServingInfoModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  onBack,
  loading = false,
  errors = {},
  businessName,
  menuConfig,
  baseString,
  initialData,
}: ServingInfoModalProps) => {
  // Dynamic color from menu config
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryColorStyle = { backgroundColor: primaryColor };

  const [formData, setFormData] = useState<ServingInfoData>({
    name: "",
    phoneNumber: "",
    comment: "",
  });

  // Prefill form data when modal opens with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        phoneNumber: initialData.phoneNumber || "",
        comment: initialData.comment || "",
      });
    } else if (!isOpen) {
      // Reset form data when modal closes
      setFormData({
        name: "",
        phoneNumber: "",
        comment: "",
      });
    }
  }, [isOpen, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validate phone number (max 11 digits)
    if (name === "phoneNumber") {
      if (!/^\d{0,11}$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRetry = () => {
    // Clear form to allow user to re-enter details
    setFormData({
      name: "",
      phoneNumber: "",
      comment: "",
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isFormValid = true; // Name and phone number are now optional

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen overflow-y-auto">
      {/* Back Button */}
      <button
        onClick={() => {
          if (onBack) {
            onBack();
          } else {
            onOpenChange();
          }
        }}
        className="absolute top-4 left-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
        aria-label="Go back"
      >
        <IoArrowBack className="w-6 h-6 text-gray-700" />
      </button>

      {/* Restaurant Banner */}
      <RestaurantBanner
        businessName={businessName}
        menuConfig={menuConfig}
        showMenuButton={false}
        baseString={baseString}
      />

      {/* Header */}
      <div className="px-4 max-w-4xl flex flex-col mx-auto w-full border-b py-4  border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-black mb-2">Serving Info</h2>
          <p className="text-sm font-normal text-gray-600">
            Enter your details to place order
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 max-w-4xl flex flex-col mx-auto w-full py-6 pb-28">
        {/* Error Banner */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Unable to place order
                </h4>
                <p className="text-xs text-red-600">
                  Please check the form and try again.
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear & Retry
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-20">
          {/* Name Field */}
          <div>
            <CustomInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              errorMessage={errors?.placedByName?.[0]}
              // required
            />
          </div>
          <br />
          {/* Phone Number Field */}
          <div>
            <CustomInput
              type="tel"
              name="phoneNumber"
              label="Phone number"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              errorMessage={errors?.placedByPhoneNumber?.[0]}
              // required
            />
          </div>

          {/* Comment Field */}
          <div>
            <CustomTextArea
              name="comment"
              label="Add comment"
              placeholder="Add a comment to this order"
              value={formData.comment}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className=" border-t border-gray-200 py-4 pb-safe z-20">
          <div className="space-y-3">
            <CustomButton
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              loading={loading}
              style={primaryColorStyle}
              className="w-full h-12 text-white font-semibold flex items-center justify-center gap-2"
            >
              <span>Confirm Order</span>
              <HiArrowLongLeft className="w-5 h-5 rotate-180" />
            </CustomButton>
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  onOpenChange();
                }
              }}
              disabled={loading}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2 disabled:opacity-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServingInfoModal;
