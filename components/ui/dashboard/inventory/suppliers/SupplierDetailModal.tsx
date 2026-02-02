import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BiEdit } from "react-icons/bi";
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

  // Local state for mapped items (display)
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
      setSelectedItemId(""); // Reset selection
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
      classNames={{
        base: "max-w-xl",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <ModalBody className="p-6 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button
                    isIconOnly
                    variant="light"
                    className="text-gray-500"
                    onPress={onEdit}
                >
                    <BiEdit size={20} />
                </Button>
                <Button
                    isIconOnly
                    variant="light"
                    onPress={onClose}
                    className="text-gray-500"
                >
                    <X size={20} />
                </Button>
            </div>

            <div className="flex flex-col items-center mb-8 mt-2">
                <h2 className="text-xl font-bold text-[#344054] mb-1">{supplier.name}</h2>
                <p className="text-gray-500 text-sm">{supplier.companyName}</p>
            </div>

            <div className="space-y-4 px-4">

                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Email Address</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Phone Number</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.phoneNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Physical Address</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.address}</span>
                </div>

                <div className="mt-8">
                    <span className="text-gray-500 text-sm block mb-3">Suppliers Item</span>
                    <div className="flex flex-col gap-2 bg-[#5F35D221] p-4 rounded-lg max-h-[260px] overflow-y-auto">
                        {mappedItems.length > 0 ? (
                            mappedItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg p-1 text-center text-[#344054] text-sm shrink-0 relative group">
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
                             <div className="bg-white rounded-lg p-1 text-center text-[#344054] text-sm italic">
                                No items assigned
                            </div>
                        )}
                    </div>
                    
                    {/* Add Item Controls */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                             <Select
                                placeholder="Add item..."
                                className="flex-1"
                                selectedKeys={selectedItemId ? [selectedItemId] : []}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                size="sm"
                                aria-label="Select item to add"
                                classNames={{
                                    trigger: "bg-gray-50 border border-gray-200 hover:bg-gray-100",
                                    value: "text-small"
                                }}
                            >
                                {inventoryItems.map((item) => (
                                    <SelectItem className="text-black" key={item.id} value={item.id} textValue={item.itemName}>
                                        {item.itemName}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Button 
                                isIconOnly
                                className="bg-primaryColor text-white min-w-[32px] w-[32px] h-[32px]" 
                                size="sm"
                                isDisabled={!selectedItemId}
                                onPress={handleAddItem}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>
                        {isModified && (
                            <Button 
                                className="w-full mt-3 bg-primaryColor text-white font-medium" 
                                size="sm"
                                onPress={handleSaveItems}
                                isLoading={isMappingItems}
                            >
                                Save Changes
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="h-4"></div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SupplierDetailModal;
