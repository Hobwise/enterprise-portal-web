import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
} from "@nextui-org/react";
import { X, Plus, Trash2, Eye, Pencil } from "lucide-react";
import { Supplier } from "./types";
import useInventory from "@/hooks/cachedEndpoints/useInventory";
import useSuppliers from "@/hooks/cachedEndpoints/useSuppliers";

interface SupplierDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  supplier: Supplier | null;
  onEdit?: () => void;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onOpenChange,
  supplier,
  onEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { items: inventoryItems } = useInventory(searchTerm);
  const { mapSupplierItems, isMappingItems } = useSuppliers();

  const [mappedItems, setMappedItems] = useState<{ id: string; name: string }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (supplier?.items) {
      setMappedItems(supplier.items);
    } else {
      setMappedItems([]);
    }
    setIsModified(false);
  }, [supplier]);

  const handleAddItem = () => {
    if (!selectedItemId) return;

    const itemToAdd = inventoryItems.find(item => item.id === selectedItemId);
    const isAlreadyAdded = mappedItems.some(item => item.id === selectedItemId);

    if (itemToAdd && !isAlreadyAdded) {
      setMappedItems(prev => [...prev, { id: itemToAdd.id, name: itemToAdd.itemName }]);
      setSelectedItemId("");
      setIsModified(true);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setMappedItems(prev => prev.filter(item => item.id !== itemId));
    setIsModified(true);
  };

  const handleSaveItems = () => {
    if (!supplier) return;

    mapSupplierItems({
      supplierId: supplier.supplierId,
      items: mappedItems
    }, {
      onSuccess: () => {
        setIsModified(false);
      }
    });
  };

  if (!supplier) return null;

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
                    <Eye className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {supplier.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {supplier.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onEdit}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit supplier"
                  >
                    <Pencil className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Detail Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Email Address</span>
                    <span className="col-span-2 font-medium text-gray-800">{supplier.email}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Phone Number</span>
                    <span className="col-span-2 font-medium text-gray-800">{supplier.phoneNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Physical Address</span>
                    <span className="col-span-2 font-medium text-gray-800">{supplier.address}</span>
                  </div>
                </div>

                {/* Supplier Items */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Supplier Items
                  </label>
                  <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl max-h-[260px] overflow-y-auto">
                    {mappedItems.length > 0 ? (
                      mappedItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-2 text-center text-gray-800 text-sm shrink-0 relative group border border-gray-100">
                          {item.name}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                            title="Remove item"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-lg p-2 text-center text-gray-500 text-sm italic border border-gray-100">
                        No items assigned
                      </div>
                    )}
                  </div>

                  {/* Add Item Controls */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          value={selectedItemId}
                          onChange={(e) => setSelectedItemId(e.target.value)}
                          aria-label="Select item to add"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none text-sm"
                        >
                          <option value="">Add item...</option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.itemName}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
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
                      <button
                        onClick={handleAddItem}
                        disabled={!selectedItemId}
                        className="flex items-center justify-center w-[36px] h-[36px] bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {isModified && (
                      <button
                        onClick={handleSaveItems}
                        disabled={isMappingItems}
                        className="flex items-center justify-center gap-2 w-full mt-3 px-6 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                      >
                        {isMappingItems ? (
                          <>
                            <Spinner size="sm" color="current" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SupplierDetailModal;
