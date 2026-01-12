import { cn, formatPrice } from "@/lib/utils";
import {
  Checkbox,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
} from "@nextui-org/react";
import { ArrowLeft, Star, Plus } from 'lucide-react';
import { CheckIcon } from "./data";

const ViewModal = ({
  selectedItems,
  isOpenVariety,
  selectedMenu,
  toggleVarietyModal,
  handleCardClick,
  handlePackingCost,
}: any) => {
  const itemIsPacked = (itemId: string) =>
    selectedItems.find((item: any) => item.id === itemId)?.isPacked;


  if (!selectedMenu) return null;

  return (
    <Modal
      isOpen={isOpenVariety}
      size="5xl"
      onOpenChange={toggleVarietyModal}
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
                  onClick={() => toggleVarietyModal()}
                  className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to menu</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 items-center lg:grid-cols-5 gap-8">
                  {/* Main Item */}
                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-6">
                      {/* Image */}
                      <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-xl ">
                          <img
                            // src={
                            //   selectedMenu.image && typeof selectedMenu.image === 'string' && 
                            //   (selectedMenu.image.startsWith('data:') || selectedMenu.image.startsWith('http'))
                            //     ? selectedMenu.image
                            //     : selectedMenu.image && typeof selectedMenu.image === 'string'
                            //       ? `data:image/jpeg;base64,${selectedMenu.image}`
                            //       : noImage
                            // }
                            src={
                              selectedMenu.image && selectedMenu.image.trim() !== ''
                                ? selectedMenu.image.startsWith('data:') || selectedMenu.image.startsWith('http')
                                  ? selectedMenu.image
                                  : `data:image/jpeg;base64,${selectedMenu.image}`
                                : '/assets/images/no-image.svg'
                            }
                            alt={selectedMenu.name}
                            className="w-full h-[20rem] object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                            }}
                        
                          />
                        </div>
                      </div>
                      
                      {/* Item Details */}
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {selectedMenu.itemName}
                          </h2>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#5F35D2]/10 text-[#5F35D2] mb-3">
                            {selectedMenu.menuName}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed">
                          {selectedMenu.itemDescription || 'No description available'}
                        </p>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-3xl font-bold text-[#5F35D2]">
                            ₦{selectedMenu.price?.toLocaleString('en-NG', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>

                        {/* Packing Cost Checkbox */}
                        {selectedItems.find(
                          (selected: any) =>
                            selected.id === selectedMenu.id ||
                            selectedMenu.varieties?.some(
                              (variety: any) => selected.id === variety.id
                            )
                        ) && (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <Checkbox
                              size="sm"
                              classNames={{
                                base: cn("items-start"),
                                label: "w-full",
                              }}
                              isSelected={itemIsPacked(selectedMenu.id)}
                              onValueChange={(isSelected) =>
                                handlePackingCost(selectedMenu.id, isSelected)
                              }
                            >
                              <div className="flex flex-col">
                                <span className="text-gray-600 font-medium">Pack In</span>
                                <span
                                  className={cn(
                                    "text-sm",
                                    itemIsPacked(selectedMenu.id)
                                      ? "font-bold text-[#5F35D2]"
                                      : "text-gray-400"
                                  )}
                                >
                                  {formatPrice(selectedMenu.packingCost || 0)}
                                </span>
                              </div>
                            </Checkbox>
                          </div>
                        )}

                        {/* Selection Button for Items without Varieties */}
                        {!selectedMenu?.varieties && (
                          <div className="mt-6">
                            {selectedItems.find(
                              (selected: any) => selected.id === selectedMenu.id
                            ) ? (
                              <button
                                onClick={() => {
                                  handleCardClick(
                                    {
                                      ...selectedMenu,
                                      isVariety: false,
                                    },
                                    itemIsPacked(selectedMenu.id)
                                  );
                                  toggleVarietyModal();
                                }}
                                className="w-full py-3 px-6 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                              >
                                Remove item
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleCardClick(
                                    {
                                      ...selectedMenu,
                                      isVariety: false,
                                    },
                                    false
                                  );
                                }}
                                className="w-full py-3 px-6 bg-transparent border text-primaryColor border-[#5F35D2]  rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                              >
                                Add Item
                              </button>
                            )}
                          </div>
                        )}

                        {/* Selection Button for Items with Varieties (Main Item) */}
                        {selectedMenu?.varieties && (
                          <div className="mt-6">
                            {selectedItems.find(
                              (selected: any) => selected.id === selectedMenu.id
                            ) ? (
                              <Chip
                                title="Click to remove"
                                onClick={() =>
                                  handleCardClick(
                                    {
                                      ...selectedMenu,
                                      isVariety: false,
                                    },
                                    itemIsPacked(selectedMenu.id)
                                  )
                                }
                                startContent={<CheckIcon size={18} />}
                                variant="flat"
                                classNames={{
                                  base: "bg-[#5F35D2] cursor-pointer text-white px-4 py-2",
                                }}
                              >
                                Selected (Base Item)
                              </Chip>
                            ) : (
                              <button
                                onClick={() =>
                                  handleCardClick(
                                    {
                                      ...selectedMenu,
                                      isVariety: false,
                                    },
                                    false
                                  )
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#5F35D2] border border-[#5F35D2] rounded-lg hover:bg-[#5F35D2]/10 transition-all duration-200 font-medium"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Base Item</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Varieties Section */}
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl p-6 h-full border border-gray-200/50 shadow-sm">
                      {/* Header with icon and count */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#5F35D2] to-[#7C69D8] rounded-lg flex items-center justify-center shadow-lg">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">Varieties</h3>
                            {selectedMenu?.varieties && selectedMenu.varieties.length > 0 && (
                              <p className="text-sm text-gray-500">
                                {selectedMenu.varieties.length} option{selectedMenu.varieties.length !== 1 ? 's' : ''} available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedMenu?.varieties && selectedMenu.varieties.length > 0 ? (
                            selectedMenu.varieties.map((variety: any) => {
                              const varietySelected = selectedItems.find(
                                (selected: any) => selected.id === variety.id
                              );
                              return (
                                <div
                                  key={variety.id}
                                  className="bg-white p-5 rounded-xl border border-gray-100 hover:border-[#5F35D2]/30 transition-all duration-300 group transform hover:-translate-y-1"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-800 text-base group-hover:text-[#5F35D2] transition-colors">
                                        {variety.unit || variety.name || selectedMenu.itemName}
                                      </h4>
                                      {variety.description && (
                                        <p className="text-sm text-gray-600 font-light mt-2">
                                          {variety.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {variety.isAvailable === false && (
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                          <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-semibold border border-red-200">
                                            Out of Stock
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Variety Price and Selection */}
                                  <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600 text-xs font-bold">₦</span>
                                      <span className="text-xl font-bold text-gray-600">
                                        {variety.price?.toLocaleString('en-NG', {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                    </div>
                                    
                                    {variety.isAvailable !== false && (
                                      <div>
                                        {varietySelected ? (
                                          <Chip
                                            title="Click to remove"
                                            onClick={() =>
                                              handleCardClick(
                                                {
                                                  ...variety,
                                                  isVariety: true,
                                                  itemName: selectedMenu.itemName,
                                                  menuName: selectedMenu.menuName,
                                                  image: selectedMenu.image,
                                                  packingCost: selectedMenu.packingCost,
                                                },
                                                itemIsPacked(variety.id)
                                              )
                                            }
                                            startContent={<CheckIcon size={16} />}
                                            variant="flat"
                                            classNames={{
                                              base: "bg-[#5F35D2] cursor-pointer text-white text-xs px-3 py-1",
                                            }}
                                          >
                                            Selected
                                          </Chip>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              handleCardClick(
                                                {
                                                  ...variety,
                                                  isVariety: true,
                                                  itemName: selectedMenu.itemName,
                                                  menuName: selectedMenu.menuName,
                                                  image: selectedMenu.image,
                                                  packingCost: selectedMenu.packingCost,
                                                },
                                                false
                                              )
                                            }
                                            className="p-2 bg-white text-[#5F35D2] border border-[#5F35D2] rounded-full hover:bg-[#5F35D2]/10 transition-all duration-200"
                                            title="Add variety"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Packing Cost for Variety */}
                                  {varietySelected && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <Checkbox
                                        size="sm"
                                        classNames={{
                                          base: cn("items-start"),
                                          label: "w-full",
                                        }}
                                        isSelected={itemIsPacked(variety.id)}
                                        onValueChange={(isSelected) =>
                                          handlePackingCost(variety.id, isSelected)
                                        }
                                      >
                                        <div className="flex flex-col">
                                          <span className="text-gray-600 text-sm">Pack In</span>
                                          <span
                                            className={cn(
                                              "text-xs",
                                              itemIsPacked(variety.id)
                                                ? "font-bold text-[#5F35D2]"
                                                : "text-gray-400"
                                            )}
                                          >
                                            {formatPrice(selectedMenu.packingCost || 0)}
                                          </span>
                                        </div>
                                      </Checkbox>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                              <div className="relative mb-6">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                  <Star className="w-10 h-10 text-gray-400" />
                                </div>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-700 mb-2">No varieties available</h4>
                              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                                This item doesn't have any varieties to choose from
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
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

export default ViewModal;