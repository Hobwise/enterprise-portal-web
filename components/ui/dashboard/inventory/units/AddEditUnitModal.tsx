'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
  Switch,
} from '@nextui-org/react';
import { X, Ruler } from 'lucide-react';
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
      const value = e.target.value;
      if (field === 'code' && value.length > 3) return;
      setFormData((prev) => ({ ...prev, [field]: value }));
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
                    <Ruler className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {isEdit ? 'Edit Unit' : 'Add Unit'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isEdit ? 'Update unit details' : 'Create a new unit'}
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
                {/* Name & Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kilogram"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. kg"
                      value={formData.code}
                      onChange={handleInputChange('code')}
                      className={`w-full px-4 py-3 border ${errors.code ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200`}
                    />
                    {errors.code && (
                      <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                    )}
                  </div>
                </div>

                {/* Category & Active Toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700 text-sm">
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
                        <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <span>{isEdit ? 'Update Unit' : 'Create Unit'}</span>
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

export default AddEditUnitModal;
