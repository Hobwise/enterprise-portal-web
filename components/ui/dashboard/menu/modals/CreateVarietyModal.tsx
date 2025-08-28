
import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from '@nextui-org/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface CreateVarietyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItem: any;
  varietyName: string;
  setVarietyName: (name: string) => void;
  varietyDescription: string;
  setVarietyDescription: (description: string) => void;
  varietyPrice: string;
  setVarietyPrice: (price: string) => void;
  varietyImagePreview: string;
  handleRemoveVarietyImage: () => void;
  isUploadingVarietyImage: boolean;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    handleFile: (file: File) => void
  ) => void;
  handleVarietyImageFile: (file: File) => void;
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
  varietyDescription,
  setVarietyDescription,
  varietyPrice,
  setVarietyPrice,
  varietyImagePreview,
  handleRemoveVarietyImage,
  isUploadingVarietyImage,
  handleFileChange,
  handleVarietyImageFile,
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
      size="5xl"
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
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
                        if (window.confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
                          await onDeleteItem(selectedItem.id);
                        }
                      }}
                      className="text-red-600 px-6 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Item</span>
                    </button>
                  )}
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
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
                      Add a description
                    </label>
                    <textarea
                      value={varietyDescription}
                      onChange={(e) => setVarietyDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] resize-none text-gray-700"
                    />
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

                {/* Right Column - Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images
                  </label>
                  <div
                    className={`h-[280px] bg-[#6D42E2]/10 flex items-center justify-center rounded-lg p-12 text-center ${
                      varietyImagePreview
                        ? 'border-solid border-gray-300'
                        : 'border-gray-300'
                    }`}
                  >
                    {varietyImagePreview ? (
                      <div className="relative">
                        <img
                          src={varietyImagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemoveVarietyImage}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center flex-col items-center w-1/2 mb-4">
                          <div className="w-20 h-20  rounded-lg flex items-center justify-center">
                            {isUploadingVarietyImage ? (
                              <Spinner size="lg" />
                            ) : (
                              <svg
                                width="36"
                                height="36"
                                viewBox="0 0 36 36"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M27.0104 31.8327H3.67708V8.49935H18.6771V5.16602H3.67708C1.84375 5.16602 0.34375 6.66602 0.34375 8.49935V31.8327C0.34375 33.666 1.84375 35.166 3.67708 35.166H27.0104C28.8438 35.166 30.3438 33.666 30.3438 31.8327V16.8327H27.0104V31.8327ZM14.0271 26.5493L10.7604 22.616L6.17708 28.4993H24.5104L18.6104 20.6493L14.0271 26.5493ZM30.3438 5.16602V0.166016H27.0104V5.16602H22.0104C22.0271 5.18268 22.0104 8.49935 22.0104 8.49935H27.0104V13.4827C27.0271 13.4993 30.3438 13.4827 30.3438 13.4827V8.49935H35.3438V5.16602H30.3438Z"
                                  fill="#6D42E2"
                                />
                              </svg>
                            )}
                          </div>
                          {!isUploadingVarietyImage && (
                            <p className="text-sm text-gray-600">
                              Drag and drop files to upload or{' '}
                              <label className="text-[#5F35D2] cursor-pointer hover:text-[#7C69D8] font-medium">
                                click here
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(e, handleVarietyImageFile)
                                  }
                                />
                              </label>{' '}
                              to browse
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
