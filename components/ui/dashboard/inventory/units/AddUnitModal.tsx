'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, Ruler } from 'lucide-react';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { createItemUnit, CreateItemUnitPayload, getUnitsByBusiness } from '@/app/api/controllers/dashboard/inventory';

interface AddUnitModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  inventoryItemId: string;
}

interface UnitOption {
  id: string;
  name: string;
  code: string;
  unitCategory: number;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  inventoryItemId,
}) => {
  // Form state
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [isPurchasable, setIsPurchasable] = useState(true);
  const [isConsumable, setIsConsumable] = useState(true);
  const [baseUnitEquivalent, setBaseUnitEquivalent] = useState('1');
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch units when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    setLoadingUnits(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await getUnitsByBusiness(business[0]?.businessId);
      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        if (Array.isArray(result)) {
          setUnits(result);
        } else if (result?.units && Array.isArray(result.units)) {
          setUnits(result.units);
        }
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      notify({ title: 'Error!', text: 'Failed to load units', type: 'error' });
    } finally {
      setLoadingUnits(false);
    }
  };

  const resetForm = () => {
    setSelectedUnitId('');
    setIsPurchasable(true);
    setIsConsumable(true);
    setBaseUnitEquivalent('1');
  };

  const handleSubmit = async () => {
    if (!selectedUnitId) {
      notify({ title: 'Error!', text: 'Please select a unit', type: 'error' });
      return;
    }

    const selectedUnit = units.find((u) => u.id === selectedUnitId);
    if (!selectedUnit) {
      notify({ title: 'Error!', text: 'Selected unit not found', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateItemUnitPayload = {
        inventoryItemId,
        unitId: selectedUnit.id,
        unitName: selectedUnit.name,
        unitCode: selectedUnit.code,
        isPurchasable,
        isConsumable,
        baseUnitEquivalent: parseFloat(baseUnitEquivalent) || 1,
      };

      const response = await createItemUnit(business[0]?.businessId, payload);

      if (!response) return;

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response && 'data' in response && response.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Unit created successfully', type: 'success' });
        onSuccess();
        onOpenChange(false);
      } else {
        notify({ title: 'Error!', text: response.data?.error || 'Failed to create unit', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating unit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      onOpenChange={onOpenChange}
      hideCloseButton
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
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
                      Add Unit
                    </h2>
                    <p className="text-sm text-gray-500">
                      Select unit to add
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Unit Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit Name
                  </label>
                  <div className="relative">
                    {loadingUnits ? (
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Spinner size="sm" color="primary" />
                        <span className="ml-2 text-gray-500">Loading units...</span>
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedUnitId}
                          onChange={(e) => setSelectedUnitId(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                        >
                          <option value="">Select a unit</option>
                          {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.code})
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
                      </>
                    )}
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">Purchase</p>
                      <p className="text-xs text-gray-500">
                        Can purchase in this unit
                      </p>
                    </div>
                    <Switch
                      isSelected={isPurchasable}
                      onValueChange={setIsPurchasable}
                      size="sm"
                      classNames={{
                        wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">Consumption</p>
                      <p className="text-xs text-gray-500">
                        Can consume in this unit
                      </p>
                    </div>
                    <Switch
                      isSelected={isConsumable}
                      onValueChange={setIsConsumable}
                      size="sm"
                      classNames={{
                        wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
                      }}
                    />
                  </div>
                </div>

                {/* Base Unit Equivalent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Base Unit Equivalent
                  </label>
                  <input
                    type="number"
                    value={baseUnitEquivalent}
                    onChange={(e) => setBaseUnitEquivalent(e.target.value)}
                    min="0.001"
                    step="0.001"
                    placeholder="Enter base unit equivalent"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    How many base units equal one of this unit
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || loadingUnits}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" color="current" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Unit</span>
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

export default AddUnitModal;
