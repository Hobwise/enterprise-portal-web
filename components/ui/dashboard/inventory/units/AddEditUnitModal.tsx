'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
  Switch,
} from '@nextui-org/react';
import { X } from 'lucide-react';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { FaArrowRight } from 'react-icons/fa6';
import type { InventoryUnit } from '@/app/api/controllers/dashboard/inventory';

interface AddEditUnitModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: UnitFormData) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  initialData?: InventoryUnit | null;
}

export interface UnitFormData {
  name: string;
  code: string;
  category: number;
  isActive: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 0, label: 'Weight' },
  { value: 1, label: 'Volume' },
  { value: 2, label: 'Length' },
  { value: 3, label: 'Count' },
];

const AddEditUnitModal: React.FC<AddEditUnitModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
  isEdit = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    code: '',
    category: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UnitFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (isEdit && initialData) {
        setFormData({
          name: initialData.name,
          code: initialData.code,
          category: initialData.unitCategory,
          isActive: initialData.isActive,
        });
      } else {
        setFormData({
          name: '',
          code: '',
          category: 0,
          isActive: true,
        });
      }
    }
  }, [isOpen, initialData, isEdit]);

  const handleInputChange =
    (field: 'name' | 'code') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UnitFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Unit name is required';
    if (!formData.code.trim()) newErrors.code = 'Unit code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(formData);
  };

  const isButtonDisabled = React.useMemo(() => {
    if (isLoading) return true;
    if (isEdit && initialData) {
      return (
        formData.name === initialData.name &&
        formData.code === initialData.code &&
        formData.category === initialData.unitCategory &&
        formData.isActive === initialData.isActive
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
      classNames={{ base: 'max-w-xl' }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2 className="text-xl font-bold text-[#3D424A]">
                  {isEdit ? 'Edit Unit' : 'Add Unit'}
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
                    label="Unit Name"
                    placeholder="e.g. Kilogram"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    errorMessage={errors.name}
                    isInvalid={!!errors.name}
                    classNames={{
                      inputWrapper: 'h-[45px]',
                      label: 'text-[#344054] font-medium mb-1.5',
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <CustomInput
                    type="text"
                    label="Unit Code"
                    placeholder="e.g. kg"
                    value={formData.code}
                    onChange={handleInputChange('code')}
                    errorMessage={errors.code}
                    isInvalid={!!errors.code}
                    classNames={{
                      inputWrapper: 'h-[45px]',
                      label: 'text-[#344054] font-medium mb-1.5',
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[#344054] font-medium mb-1.5 text-sm">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: Number(e.target.value),
                      }))
                    }
                    className="w-full h-[45px] px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white text-sm"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex items-end pb-1">
                  <div className="flex items-center justify-between w-full p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                    <Switch
                      isSelected={formData.isActive}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, isActive: val }))
                      }
                      size="sm"
                      classNames={{
                        wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
                      }}
                    />
                  </div>
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
                        <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isEdit ? 'Update Unit' : 'Create Unit'}</span>
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

export default AddEditUnitModal;
