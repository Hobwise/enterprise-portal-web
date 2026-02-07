'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';
import {
  X,
  Edit,
  Package,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import {
  InventoryItemType,
  getInventoryItem,
} from '@/app/api/controllers/dashboard/inventory';
import type { InventoryItem } from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';
import ViewRecipeModal from './ViewRecipeModal';

interface InventoryItemDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: InventoryItem | null;
  onEdit?: (item: InventoryItem) => void;
}

const InventoryItemDetailsModal: React.FC<InventoryItemDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  item,
  onEdit,
}) => {
  const [freshItem, setFreshItem] = useState<InventoryItem | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isViewRecipeOpen, setIsViewRecipeOpen] = useState(false);

  const { data: unitsByBusiness } = useUnitsByBusiness();

  useEffect(() => {
    if (isOpen && item?.id) {
      setIsFetching(true);
      const business = getJsonItemFromLocalStorage('business');
      getInventoryItem(business[0]?.businessId, item.id)
        .then((response) => {
          if (response?.data?.isSuccessful && response.data.data) {
            setFreshItem(response.data.data);
          }
        })
        .catch(() => {
          // Fall back to the passed item prop
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else {
      setFreshItem(null);
    }
  }, [isOpen, item?.id]);

  useEffect(() => {
    if (!isOpen) {
      setIsViewRecipeOpen(false);
    }
  }, [isOpen]);

  if (!item) return null;

  const displayItem = freshItem || item;

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getItemTypeLabel = (type: InventoryItemType) => {
    switch (type) {
      case InventoryItemType.Direct:
        return 'Direct';
      case InventoryItemType.Ingredient:
        return 'Ingredient';
      case InventoryItemType.Produced:
        return 'Produced';
      default:
        return String(type);
    }
  };

  const getItemTypeBadgeClasses = (type: InventoryItemType) => {
    switch (type) {
      case InventoryItemType.Direct:
        return 'bg-blue-100 text-blue-700';
      case InventoryItemType.Ingredient:
        return 'bg-amber-100 text-amber-700';
      case InventoryItemType.Produced:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUnitName = (unitId: string) => {
    const unit = unitsByBusiness.find((u) => u.id === unitId);
    return unit?.name || '';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        size="3xl"
        onOpenChange={onOpenChange}
        hideCloseButton
        scrollBehavior="inside"
      >
        <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
          {() => (
            <ModalBody className="p-0">
              <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#5F35D2]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {displayItem.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getItemTypeBadgeClasses(
                            displayItem.itemType
                          )}`}
                        >
                          {getItemTypeLabel(displayItem.itemType)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            displayItem.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {displayItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(displayItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#5F35D2] bg-[#5F35D2]/10 rounded-lg hover:bg-[#5F35D2]/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onOpenChange(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" color="secondary" />
                    </div>
                  ) : (
                    <>
                      {/* Description */}
                      {displayItem.description && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Description
                          </p>
                          <p className="text-gray-700">
                            {displayItem.description}
                          </p>
                        </div>
                      )}

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#5F35D2]/5 rounded-xl p-4">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            Avg Cost / Unit
                          </p>
                          <p className="text-xl font-bold text-[#5F35D2]">
                            {formatCurrency(displayItem.averageCostPerUnit)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            Reorder Level
                          </p>
                          <p className="text-xl font-bold text-gray-800">
                            {displayItem.reorderLevel}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            Stock Level
                          </p>
                          <p className="text-xl font-bold text-gray-800">
                            {displayItem.stockLevel}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            Stock Status
                          </p>
                          <p className="text-xl font-bold text-gray-800">
                            {displayItem.stockStatus}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                          {/* Left column */}
                          <div className="divide-y divide-gray-100">
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm text-gray-500">Unit</span>
                              <span className="text-sm font-semibold text-gray-800">
                                {displayItem.unit || getUnitName(displayItem.unitId) || '-'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm text-gray-500">Supplier</span>
                              <span className="text-sm font-semibold text-gray-800">
                                {displayItem.supplier || '-'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm text-gray-500">Strictness</span>
                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                {displayItem.strictnessLevel === 0 ? (
                                  <>
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    Safe
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                                    Strict
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Right column */}
                          <div className="divide-y divide-gray-100">
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm text-gray-500">Item Type</span>
                              <span className="text-sm font-semibold text-gray-800">
                                {getItemTypeLabel(displayItem.itemType)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Created
                              </span>
                              <span className="text-sm font-semibold text-gray-800">
                                {formatDate(displayItem.dateCreated)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Updated
                              </span>
                              <span className="text-sm font-semibold text-gray-800">
                                {formatDate(displayItem.dateUpdated)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View Recipes Button (Produced items only) */}
                      {displayItem.itemType === InventoryItemType.Produced && (
                        <button
                          onClick={() => setIsViewRecipeOpen(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5F35D2]/10 text-[#5F35D2] rounded-xl hover:bg-[#5F35D2]/20 font-semibold transition-all duration-200"
                        >
                          <BookOpen className="w-5 h-5" />
                          View Recipes
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      <ViewRecipeModal
        isOpen={isViewRecipeOpen}
        onOpenChange={setIsViewRecipeOpen}
        itemId={displayItem.id}
        itemName={displayItem.name}
      />
    </>
  );
};

export default InventoryItemDetailsModal;
