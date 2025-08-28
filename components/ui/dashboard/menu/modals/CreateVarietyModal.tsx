
import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface CreateVarietyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItem: any;
  varietyName: string;
  setVarietyName: (name: string) => void;
  varietyPrice: string;
  setVarietyPrice: (price: string) => void;
  loading: boolean;
  handleCreateVariety: () => void;
  backToItemDetails: () => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (itemId: string) => Promise<void>;
}

const CreateVarietyModal = ({
  isOpen,
  onOpenChange,
  selectedItem,
  varietyName,
  setVarietyName,
  varietyPrice,
  setVarietyPrice,
  loading,
  handleCreateVariety,
  backToItemDetails,
  onEditItem,
  onDeleteItem,
}: CreateVarietyModalProps) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const [showErrors, setShowErrors] = React.useState(false);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
    // Reset error state when modal opens
    setShowErrors(false);
  }, [isOpen]);

  const handleSaveVariety = () => {
    // Check if required fields are filled
    if (!varietyName.trim() || !varietyPrice.trim()) {
      setShowErrors(true);
      
      // Focus on the first empty required field
      if (!varietyName.trim() && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (!varietyPrice.trim() && priceInputRef.current) {
        priceInputRef.current.focus();
      }
      return;
    }
    
    // If validation passes, proceed with creation
    handleCreateVariety();
    setShowErrors(false);
  };

  if (!selectedItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      size="md"
      onOpenChange={onOpenChange}
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              {/* <div className="flex items-center justify-between p-6 border-b">
                <button
                  onClick={backToItemDetails}
                  className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to item details</span>
                </button>
                <div className="flex items-center gap-2">
                  {onEditItem && (
                    <button 
                      onClick={() => onEditItem(selectedItem)}
                      className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Item</span>
                    </button>
                  )}
                  {onDeleteItem && (
                    <button
                      onClick={async () => {
                        await onDeleteItem(selectedItem.id);
                      }}
                      className="text-red-600 px-6 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Item</span>
                    </button>
                  )}
                </div>
              </div> */}

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Create variety
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add a variety for {selectedItem.name}
                  </p>
                </div>

              {/* Item Card */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={
                    selectedItem.image && selectedItem.image.trim() !== ''
                      ? selectedItem.image.startsWith('data:') || selectedItem.image.startsWith('http')
                        ? selectedItem.image
                        : `data:image/jpeg;base64,${selectedItem.image}`
                      : '/assets/images/no-image.svg'
                  }
                  alt={selectedItem.name}
                  className="w-20 h-20 rounded-lg object-cover bg-orange-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {selectedItem.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedItem.category}
                  </p>
                  <p className="font-semibold text-gray-900">
                    ₦
                    {selectedItem.price.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {selectedItem.description}
              </p>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name of new variety <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={varietyName}
                    onChange={(e) => {
                      setVarietyName(e.target.value);
                      if (showErrors) setShowErrors(false);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700 ${
                      showErrors && !varietyName.trim() 
                        ? 'border-red-500 ring-1 ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter variety name"
                  />
                  {showErrors && !varietyName.trim() && (
                    <p className="text-red-500 text-xs mt-1">Variety name is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a price <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={priceInputRef}
                    type="number"
                    value={varietyPrice}
                    onChange={(e) => {
                      setVarietyPrice(e.target.value);
                      if (showErrors) setShowErrors(false);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700 ${
                      showErrors && !varietyPrice.trim() 
                        ? 'border-red-500 ring-1 ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter price"
                  />
                  {showErrors && !varietyPrice.trim() && (
                    <p className="text-red-500 text-xs mt-1">Price is required</p>
                  )}
                </div>
              </div>
              </div>
            </ModalBody>
            <ModalFooter className="mb-3">
              <Button
                color="default"
                variant="bordered"
                onPress={backToItemDetails}
              >
                Back to item
              </Button>
              <Button
                onPress={handleSaveVariety}
                disabled={loading}
                className="bg-[#5F35D2] text-white"
              >
                {loading ? 'Creating...' : 'Save new variety'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateVarietyModal;
