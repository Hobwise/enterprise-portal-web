
import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';

interface AddItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: any[];
  menuSections: any[];
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  selectedMenuType: string;
  setSelectedMenuType: (menuType: string) => void;
  itemName: string;
  setItemName: (name: string) => void;
  itemDescription: string;
  setItemDescription: (description: string) => void;
  itemPrice: string;
  setItemPrice: (price: string) => void;
  handleDrag: (e: React.DragEvent, setActive: (value: boolean) => void) => void;
  handleDrop: (
    e: React.DragEvent,
    setActive: (value: boolean) => void,
    handleFile: (file: File) => void
  ) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    handleFile: (file: File) => void
  ) => void;
  handleItemImageFile: (file: File) => void;
  imagePreview: string;
  handleRemoveItemImage: () => void;
  isUploadingItemImage: boolean;
  dragActive: boolean;
  setDragActive: (isActive: boolean) => void;
  loading: boolean;
  handleCreateMenuItem: () => void;
}

const AddItemModal = ({
  isOpen,
  onOpenChange,
  categories,
  menuSections,
  selectedSection,
  setSelectedSection,
  selectedMenuType,
  setSelectedMenuType,
  itemName,
  setItemName,
  itemDescription,
  setItemDescription,
  itemPrice,
  setItemPrice,
  handleDrag,
  handleDrop,
  handleFileChange,
  handleItemImageFile,
  imagePreview,
  handleRemoveItemImage,
  isUploadingItemImage,
  dragActive,
  setDragActive,
  loading,
  handleCreateMenuItem,
}: AddItemModalProps) => {
  return (
    <Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <div className="bg-white rounded-xl p-3 py-4 w-full  max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Add menu item
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add an item to your menu
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
               

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
                        Image
                      </label>
                      <div
                        className={` rounded-lg flex justify-center items-center h-[280px] bg-[#6D42E2]/10 p-8 text-center ${
                          dragActive
                            ? ' border-[#6D42E2] border-2 '
                            : 'border-gray-300'
                        } ${imagePreview ? 'border-solid' : ''}`}
                        onDragEnter={(e) => handleDrag(e, setDragActive)}
                        onDragLeave={(e) => handleDrag(e, setDragActive)}
                        onDragOver={(e) => handleDrag(e, setDragActive)}
                        onDrop={(e) =>
                          handleDrop(e, setDragActive, handleItemImageFile)
                        }
                      >
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              onClick={handleRemoveItemImage}
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
                              <div className="w-20 h-20  rounded-lg flex items-center justify-center">
                                {isUploadingItemImage ? (
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
                              {!isUploadingItemImage && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Drag and drop files to upload or{' '}
                                  <label className="text-[#5F35D2] cursor-pointer hover:text-[#7C69D8] font-medium">
                                    click here
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileChange(e, handleItemImageFile)
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
                    onClick={handleCreateMenuItem}
                    disabled={loading}
                    className="px-6 py-2.5 bg-primaryColor text-white rounded-lg hover:bg-primaryColor font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Save item'}
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

export default AddItemModal;
