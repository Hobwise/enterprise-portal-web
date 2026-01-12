
import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';
import { ArrowLeft, Star, Plus, X } from 'lucide-react';

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
      classNames={{
        wrapper: "items-center justify-center",
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "border border-gray-200",
      }}
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Enhanced Header */}
               
                {/* Content */}
                <div className="">
                  {/* Item Preview Card */}
                  <div className="p-6  mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                        <Star className="w-7 h-7 text-[#5F35D2]" />
                      </div>
                        <div>
                      <h2 className="text-lg text-gray-800 font-bold">
                        Create Variety
                      </h2>
                      <p className="text-gray-700 text-xs mt-1">
                        Add a new variety for {selectedItem.name}
                      </p>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <img
                        src={
                          selectedItem.image && selectedItem.image.trim() !== ''
                            ? selectedItem.image.startsWith('data:') || selectedItem.image.startsWith('http')
                              ? selectedItem.image
                              : `data:image/jpeg;base64,${selectedItem.image}`
                            : '/assets/images/no-image.svg'
                        }
                        alt={selectedItem.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedItem.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedItem.category}
                        </p>
                        <p className="font-semibold text-[#5F35D2]">
                          ₦{selectedItem.price.toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* {selectedItem.description && (
                      <p className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-[#5F35D2]/20">
                        {selectedItem.description}
                      </p>
                    )} */}
                  </div>

                  {/* Variety Form */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-[#5F35D2]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Variety Information</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Variety Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={varietyName}
                          onChange={(e) => {
                            setVarietyName(e.target.value);
                            if (showErrors) setShowErrors(false);
                          }}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 ${
                            showErrors && !varietyName.trim() 
                              ? 'border-red-500 ring-1 ring-red-500 bg-red-50' 
                              : ''
                          }`}
                          placeholder="e.g., Large, Medium, Small"
                        />
                        {showErrors && !varietyName.trim() && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                            Variety name is required
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Price (₦) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold">₦</span>
                          <input
                            ref={priceInputRef}
                            type="number"
                            value={varietyPrice}
                            onChange={(e) => {
                              setVarietyPrice(e.target.value);
                              if (showErrors) setShowErrors(false);
                            }}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 ${
                              showErrors && !varietyPrice.trim() 
                                ? 'border-red-500 ring-1 ring-red-500 bg-red-50' 
                                : ''
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                        {showErrors && !varietyPrice.trim() && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                            Price is required
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-end gap-4 w-full">
                <button
                  onClick={backToItemDetails}
                  className="px-8 py-3 border flex-1 border-gray-200 text-sm text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold  transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Item</span>
                  </div>
                </button>
                <button
                  onClick={handleSaveVariety}
                  disabled={loading}
                  className="px-8 py-3 bg-[#5F35D2] text-white text-sm rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="current" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>Save Variety</span>
                    </div>
                  )}
                </button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateVarietyModal;
