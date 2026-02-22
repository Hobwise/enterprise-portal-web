import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
} from "@nextui-org/react";
import { X, Truck } from "lucide-react";
import { z } from "zod";

interface AddSupplierModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: SupplierFormData;
  isEdit?: boolean;
}

export interface SupplierFormData {
  name: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  physicalAddress: string;
}

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  companyName: z.string().min(1, "Company name is required"),
  phoneNumber: z.string().min(11, "Phone number must be at least 11 digits").regex(/^\d+$/, "Phone number must be digits only"),
  emailAddress: z.string().email("Invalid email address"),
  physicalAddress: z.string().min(1, "Physical address is required"),
});

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    physicalAddress: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});

  React.useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (isEdit && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: "",
          companyName: "",
          phoneNumber: "",
          emailAddress: "",
          physicalAddress: "",
        });
      }
    }
  }, [isOpen, initialData, isEdit]);

  const handleInputChange = (field: keyof SupplierFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      supplierSchema.parse(formData);
      setErrors({});
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SupplierFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SupplierFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const isButtonDisabled = React.useMemo(() => {
    if (isLoading) return true;
    if (isEdit && initialData) {
      return (
        formData.name === initialData.name &&
        formData.companyName === initialData.companyName &&
        formData.emailAddress === initialData.emailAddress &&
        formData.phoneNumber === initialData.phoneNumber &&
        formData.physicalAddress === initialData.physicalAddress
      );
    }
    return false;
  }, [isLoading, isEdit, initialData, formData]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      hideCloseButton
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {(onClose) => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {isEdit ? "Edit Supplier" : "Add Supplier"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isEdit ? "Update supplier details" : "Register a new supplier"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Name & Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      placeholder="Rachel Laurence"
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      className={`w-full px-4 py-3 border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Mall Mart"
                      value={formData.companyName}
                      onChange={handleInputChange("companyName")}
                      className={`w-full px-4 py-3 border ${errors.companyName ? "border-red-500" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="mallmartyaba@gmail.com"
                      value={formData.emailAddress}
                      onChange={handleInputChange("emailAddress")}
                      className={`w-full px-4 py-3 border ${errors.emailAddress ? "border-red-500" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                    />
                    {errors.emailAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="09012345678"
                      value={formData.phoneNumber}
                      onChange={handleInputChange("phoneNumber")}
                      className={`w-full px-4 py-3 border ${errors.phoneNumber ? "border-red-500" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Physical Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Herbert Macaulay Way, Sabo Yaba, Lagos"
                    value={formData.physicalAddress}
                    onChange={handleInputChange("physicalAddress")}
                    className={`w-full px-4 py-3 border ${errors.physicalAddress ? "border-red-500" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                  />
                  {errors.physicalAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.physicalAddress}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" color="current" />
                        <span>{isEdit ? "Updating..." : "Registering..."}</span>
                      </>
                    ) : (
                      <span>{isEdit ? "Update Supplier" : "Register Supplier"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddSupplierModal;
