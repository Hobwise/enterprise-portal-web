import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { editMenuItem, payloadMenuItem, uploadFile, deleteFile } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Edit, Upload, X, ShoppingBag } from 'lucide-react';

interface EditItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItem: any;
  categories: any[];
  menuSections: any[];
  onItemUpdated: () => void;
}

const EditItemModal = ({
  isOpen,
  onOpenChange,
  selectedItem,
  categories,
  menuSections,
  onItemUpdated,
}: EditItemModalProps) => {
  // Form states
  const [selectedSection, setSelectedSection] = useState(selectedItem?.categoryName || '');
  const [selectedMenuType, setSelectedMenuType] = useState(selectedItem?.menuID || selectedItem?.menuId || '');
  const [itemName, setItemName] = useState(selectedItem?.itemName || '');
  const [itemDescription, setItemDescription] = useState(selectedItem?.itemDescription || '');
  const [itemPrice, setItemPrice] = useState(selectedItem?.price?.toString() || '');

  // Image states
  const [imagePreview, setImagePreview] = useState(selectedItem?.image || '');
  const [imageReference, setImageReference] = useState(selectedItem?.imageReference || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Update form fields when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setSelectedSection(selectedItem?.categoryName || '');
      
      // Try to find the correct menu section ID
      let menuId = selectedItem?.menuID || selectedItem?.menuId || '';
      
      // If not found, try to match by menu name
      if (!menuId && selectedItem?.menuName && menuSections.length > 0) {
        const matchingSection = menuSections.find(section => 
          section.name === selectedItem.menuName
        );
        if (matchingSection) {
          menuId = matchingSection.id;
        }
      }
      
      setSelectedMenuType(menuId);
      setItemName(selectedItem?.itemName || '');
      setItemDescription(selectedItem?.itemDescription || '');
      setItemPrice(selectedItem?.price?.toString() || '');
      setImagePreview(selectedItem?.image || '');
      setImageReference(selectedItem?.imageReference || '');
    }
  }, [selectedItem, menuSections]);

  const handleDrag = (e: React.DragEvent, setActive: (value: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setActive(true);
    } else if (e.type === 'dragleave') {
      setActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    setActive: (value: boolean) => void,
    handleFile: (file: File) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleFile: (file: File) => void
  ) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleImageFile = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile(business[0]?.businessId, formData);

      if (response?.data?.isSuccessful) {
        setImageReference(response.data.data);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (imageReference) {
      try {
        const business = getJsonItemFromLocalStorage('business');
        await deleteFile(business[0]?.businessId, imageReference);
        toast.success('Image removed successfully');
      } catch (error) {
        console.error('Error removing image:', error);
        toast.error('Failed to remove image');
      }
    }
    setImagePreview('');
    setImageReference('');
  };

  const handleUpdateItem = async () => {
    if (!itemName || !itemPrice || !selectedMenuType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: payloadMenuItem = {
        menuID: selectedMenuType,
        itemName: itemName,
        itemDescription: itemDescription,
        price: parseFloat(itemPrice),
        currency: 'NGA',
        isAvailable: true,
        hasVariety: false,
        imageReference: imageReference,
      };

      const response = await editMenuItem(business[0]?.businessId, payload, selectedItem.id);

      if (response && 'errors' in response) {
        toast.error('Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Menu item updated successfully');
        onItemUpdated();
        onOpenChange(false);
      } else {
        toast.error(response?.data?.error || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedItem) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      size="5xl" 
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
            <ModalBody className="p-8">
              <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Enhanced Header */}
               
                <div className="">

                <div className="grid grid-cols-2  gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Edit className="w-5 h-5 text-[#5F35D2]" />
                        <h3 className="text-lg font-semibold text-gray-800">Edit Menu Item</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select menu section
                          </label>
                          <div className="relative">
                            <select
                              value={selectedMenuType}
                              onChange={(e) => setSelectedMenuType(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                            >
                              <option value="">Choose a section</option>
                              {menuSections.map((section) => (
                                <option key={section.id} value={section.id}>
                                  {section.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Item name
                          </label>
                          <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="Enter item name"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Price (₦)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold">₦</span>
                            <input
                              type="number"
                              value={itemPrice}
                              onChange={(e) => setItemPrice(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Description
                          </label>
                          <textarea
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            placeholder="Describe your item..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] resize-none text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Upload className="w-5 h-5 text-[#5F35D2]" />
                        <h3 className="text-lg font-semibold text-gray-800">Item Image</h3>
                      </div>

                      <div
                        className={`rounded-xl border-2 border-dashed transition-all duration-300 ${
                          dragActive
                            ? 'border-[#5F35D2] bg-[#5F35D2]/5'
                            : 'border-gray-200 bg-gray-50 hover:border-[#5F35D2]/50 hover:bg-[#5F35D2]/5'
                        }`}
                        onDragEnter={(e) => handleDrag(e, setDragActive)}
                        onDragLeave={(e) => handleDrag(e, setDragActive)}
                        onDragOver={(e) => handleDrag(e, setDragActive)}
                        onDrop={(e) =>
                          handleDrop(e, setDragActive, handleImageFile)
                        }
                      >
                        {imagePreview ? (
                          <div className="relative p-4">
                            <img
                              src={
                                imagePreview && imagePreview.trim() !== ''
                                  ? imagePreview.startsWith('data:') || imagePreview.startsWith('http')
                                    ? imagePreview
                                    : `data:image/jpeg;base64,${imagePreview}`
                                  : '/assets/images/no-image.svg'
                              }
                              alt="Preview"
                              className="w-full h-60 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                              }}
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-6 left-6 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                              Image uploaded
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 min-h-[280px]">
                            <div className="w-16 h-16 bg-[#5F35D2]/10 rounded-2xl flex items-center justify-center mb-4">
                              {isUploadingImage ? (
                                <Spinner size="lg" color="secondary" />
                              ) : (
                                <Upload className="w-8 h-8 text-[#5F35D2]" />
                              )}
                            </div>
                            
                            {!isUploadingImage && (
                              <>
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                  Upload item image
                                </h4>
                                <p className="text-sm text-gray-500 text-center mb-4 max-w-xs">
                                  Drag and drop your image here, or{' '}
                                  <label className="text-[#5F35D2] cursor-pointer hover:text-[#7C69D8] font-semibold underline">
                                    browse files
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileChange(e, handleImageFile)
                                      }
                                    />
                                  </label>
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>Supported:</span>
                                  <span className="bg-gray-100 px-2 py-1 rounded">JPG</span>
                                  <span className="bg-gray-100 px-2 py-1 rounded">PNG</span>
                                  <span className="bg-gray-100 px-2 py-1 rounded">WebP</span>
                                </div>
                              </>
                            )}
                            
                            {isUploadingImage && (
                              <p className="text-sm text-[#5F35D2] font-medium mt-2">
                                Uploading image...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-4 p-6">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateItem}
                    disabled={loading || !itemName || !itemPrice || !selectedMenuType}
                    className="px-8 py-3 bg-[#5F35D2]  text-white rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="current" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        <span>Update Item</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditItemModal;