import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { editMenuItem, payloadMenuItem, uploadFile, deleteFile } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';

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
    <Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <div className="bg-white rounded-xl p-3 py-4 w-full max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Edit menu item
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Update item details
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select section
                      </label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                      >
                        <option value="">Select section</option>
                        {categories.map((category) => (
                          <option
                            key={category.categoryId}
                            value={category.categoryName}
                          >
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select menu
                      </label>
                      <select
                        value={selectedMenuType}
                        onChange={(e) => setSelectedMenuType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                      >
                        <option value="">Select menu</option>
                        {menuSections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name of item
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item description
                      </label>
                      <textarea
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        placeholder="Value"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] resize-none text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add item price
                      </label>
                      <input
                        type="number"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        placeholder="Enter value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image
                      </label>
                      <div
                        className={`rounded-lg flex justify-center items-center h-[280px] bg-[#6D42E2]/10 p-8 text-center ${
                          dragActive
                            ? 'border-[#6D42E2] border-2'
                            : 'border-gray-300'
                        } ${imagePreview ? 'border-solid' : ''}`}
                        onDragEnter={(e) => handleDrag(e, setDragActive)}
                        onDragLeave={(e) => handleDrag(e, setDragActive)}
                        onDragOver={(e) => handleDrag(e, setDragActive)}
                        onDrop={(e) =>
                          handleDrop(e, setDragActive, handleImageFile)
                        }
                      >
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={
                                imagePreview && imagePreview.trim() !== ''
                                  ? imagePreview.startsWith('data:') || imagePreview.startsWith('http')
                                    ? imagePreview
                                    : `data:image/jpeg;base64,${imagePreview}`
                                  : '/assets/images/no-image.svg'
                              }
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                              }}
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
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
                            <div className="flex flex-col items-center w-1/2 justify-center mb-4">
                              <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                                {isUploadingImage ? (
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
                              {!isUploadingImage && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Drag and drop files to upload or{' '}
                                  <label className="text-[#5F35D2] cursor-pointer hover:text-[#7C69D8] font-medium">
                                    click here
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileChange(e, handleImageFile)
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

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Back to menu
                  </button>
                  <button
                    onClick={handleUpdateItem}
                    disabled={loading || !itemName || !itemPrice || !selectedMenuType}
                    className="px-6 py-2.5 bg-primaryColor text-white rounded-lg hover:bg-primaryColor font-medium disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update item'}
                  </button>
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