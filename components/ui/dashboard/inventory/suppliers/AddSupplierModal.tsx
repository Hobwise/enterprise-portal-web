import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
} from "@nextui-org/react";
import React, { useState } from "react";
import { X } from "lucide-react";
import {CustomInput} from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { FaArrowRight } from "react-icons/fa6";
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
    // Clear error when user types
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
    
    // In edit mode, check if changes were made
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
      size="2xl"
      hideCloseButton
      classNames={{
        base: "max-w-3xl",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2 className="text-xl font-bold text-[#3D424A]">
                  {isEdit ? "Edit Supplier" : "Add Supplier"}
                </h2>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-gray-500 hover:text-gray-700"
                isDisabled={isLoading}
              >
                <X size={20} />
              </Button>
            </ModalHeader>
            <ModalBody className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 rounded-lg bg-[#F7F6FA]">
                <div className="col-span-1">
                  <CustomInput
                    type="text"
                    label="Supplier Name"
                    placeholder="Rachel Laurence"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    errorMessage={errors.name}
                    isInvalid={!!errors.name}
                    classNames={{
                        inputWrapper: "h-[45px]",
                        label: "text-[#344054] font-medium mb-1.5",
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <CustomInput
                    type="text"
                    label="Company Name"
                    placeholder="Mall Mart"
                    value={formData.companyName}
                    onChange={handleInputChange("companyName")}
                    errorMessage={errors.companyName}
                    isInvalid={!!errors.companyName}
                    classNames={{
                        inputWrapper: "h-[45px]",
                        label: "text-[#344054] font-medium mb-1.5",
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <CustomInput
                    type="email"
                    label="Email Address"
                    placeholder="mallmartyaba@gmail.com"
                    value={formData.emailAddress}
                    onChange={handleInputChange("emailAddress")}
                    errorMessage={errors.emailAddress}
                    isInvalid={!!errors.emailAddress}
                     classNames={{
                        inputWrapper: "h-[45px]",
                        label: "text-[#344054] font-medium mb-1.5",
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <CustomInput
                    type="number"
                    label="Phone Number"
                    placeholder="09012345678"
                    value={formData.phoneNumber}
                    onChange={handleInputChange("phoneNumber")}
                    errorMessage={errors.phoneNumber}
                    isInvalid={!!errors.phoneNumber}
                     classNames={{
                        inputWrapper: "h-[45px]",
                        label: "text-[#344054] font-medium mb-1.5",
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <CustomInput
                    type="text"
                    label="Physical Address"
                    placeholder="123 Herbert Macaulay Way, Sabo Yaba, Lagos"
                    value={formData.physicalAddress}
                    onChange={handleInputChange("physicalAddress")}
                    errorMessage={errors.physicalAddress}
                    isInvalid={!!errors.physicalAddress}
                     classNames={{
                        inputWrapper: "h-[45px]",
                        label: "text-[#344054] font-medium mb-1.5",
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-8 mb-2">
                <CustomButton
                  onClick={handleSubmit}
                  className="text-white h-[48px] px-12"
                  backgroundColor="bg-primaryColor"
                  disabled={isButtonDisabled}
                >
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Spinner size="sm" color="current" />
                        <span>{isEdit ? "Updating..." : "Registering..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isEdit ? "Update Supplier" : "Register Supplier"}</span>
                        <FaArrowRight />
                      </>
                    )}
                  </div>
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddSupplierModal;
