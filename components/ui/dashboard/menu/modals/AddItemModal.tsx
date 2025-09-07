
import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';
import { Plus, Upload, X, ShoppingBag } from 'lucide-react';

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
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
              

                <div className="p-8">

                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-[#5F35D2]" />
                        <h3 className="text-lg font-semibold text-gray-800">Add Menu Item</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Menu
                          </label>
                          <div className="relative">
                            <select
                              value={selectedMenuType}
                              onChange={(e) => setSelectedMenuType(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                            >
                              <option value="">Choose a Menu</option>
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
                          handleDrop(e, setDragActive, handleItemImageFile)
                        }
                      >
                        {imagePreview ? (
                          <div className="relative p-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-60 object-cover rounded-lg shadow-sm"
                            />
                            <button
                              onClick={handleRemoveItemImage}
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
                              {isUploadingItemImage ? (
                                <Spinner size="lg" color="secondary" />
                              ) : (
                                <Upload className="w-8 h-8 text-[#5F35D2]" />
                              )}
                            </div>
                            
                            {!isUploadingItemImage && (
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
                                        handleFileChange(e, handleItemImageFile)
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
                            
                            {isUploadingItemImage && (
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
                <div className="flex justify-end gap-4 ">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMenuItem}
                    disabled={loading}
                    className="px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="current" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>Save Item</span>
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

export default AddItemModal;
