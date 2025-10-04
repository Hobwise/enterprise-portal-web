"use client";
import { CustomButton } from "@/components/customButton";
import { CheckIcon } from "@/components/ui/dashboard/orders/place-order/data";
import { cn, formatPrice } from "@/lib/utils";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
} from "@nextui-org/react";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoAddCircleOutline, IoClose } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";
import noImage from "../../public/assets/images/no-image.svg";

const ViewModal = ({
  selectedItems,
  isOpenVariety,
  selectedMenu,
  toggleVarietyModal,
  handleCardClick,
  handleDecrement,
  handleIncrement,
  totalPrice,
  handlePackingCost,
  handleCheckoutOpen,
}: any) => {
  const getItemCount = (itemId: string) => {
    const item = selectedItems.find((item: any) => item.id === itemId);
    return item ? item.count : 0;
  };

  const itemIsPacked = (itemId: string) =>
    selectedItems.find((item: any) => item.id === itemId)?.isPacked;

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((item: any) => item.id === itemId);
  };

  return (
    <Modal
      classNames={{
        base: "max-h-full",
        wrapper: "overflow-hidden",
      }}
      size="xl"
      isOpen={isOpenVariety}
      onOpenChange={toggleVarietyModal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="overflow-y-auto max-h-full p-0 relative">
              {/* Close Button - Top Right */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                aria-label="Close modal"
              >
                <IoClose className="w-6 h-6 text-gray-700" />
              </button>

              {/* Image Section */}
              <div className="relative h-[280px] w-full">
                <Image
                  src={
                    selectedMenu.image
                      ? `data:image/jpeg;base64,${selectedMenu.image}`
                      : noImage
                  }
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-t-2xl"
                  aria-label="uploaded image"
                  alt="uploaded image(s)"
                />
              </div>

              {/* Content Section */}
              <div className="p-6 text-black">
                <h1 className="text-2xl font-bold mb-2">
                  {selectedMenu?.itemName}
                </h1>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {selectedMenu?.itemDescription}
                </p>

                {/* Section Name & Waiting Time */}
                <div className="flex flex-col gap-2 mb-4 text-sm">
                  <p className="text-gray-700 font-medium">
                    {selectedMenu?.menuName}
                  </p>
                  {selectedMenu?.waitingTimeMinutes > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MdAccessTime className="w-4 h-4" />
                      <span>
                        {selectedMenu?.waitingTimeMinutes} mins preparation time
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-3xl font-bold text-primaryColor">
                    {formatPrice(selectedMenu?.price)}
                  </p>
                </div>

                {/* Packing Cost Option */}
                {isItemSelected(selectedMenu.id) &&
                  selectedMenu?.packingCost > 0 &&
                  !selectedMenu?.varieties && (
                    <div className="mb-6 border border-gray-200 rounded-lg p-4">
                      <Checkbox
                        size="sm"
                        isSelected={itemIsPacked(selectedMenu.id)}
                        onValueChange={(isSelected) =>
                          handlePackingCost(selectedMenu.id, isSelected)
                        }
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-black">
                            Pack this item
                          </span>
                          <span className="text-xs text-gray-600">
                            Additional {formatPrice(selectedMenu.packingCost)}
                          </span>
                        </div>
                      </Checkbox>
                    </div>
                  )}
              </div>

              {/* Varieties Section (if applicable) */}
              {selectedMenu?.varieties &&
                selectedMenu?.varieties?.length > 0 && (
                  <div className="px-6 pb-4">
                    <h3 className="font-semibold mb-3 text-black">
                      Choose Size
                    </h3>

                    {/* Base Item Option */}
                    <div className="flex justify-between items-start py-3 border-b border-gray-100 bg-purple-50 rounded-lg px-3 mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-black">Regular (Base Item)</p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(selectedMenu?.price)}
                        </p>
                        {/* Packing Cost for Base Item */}
                        {isItemSelected(selectedMenu.id) && selectedMenu.packingCost > 0 && (
                          <div className="mt-2">
                            <Checkbox
                              size="sm"
                              isSelected={itemIsPacked(selectedMenu.id)}
                              onValueChange={(isSelected) =>
                                handlePackingCost(selectedMenu.id, isSelected)
                              }
                            >
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-600">
                                  Pack this item
                                </span>
                                <span className="text-xs font-medium text-black">
                                  +{formatPrice(selectedMenu.packingCost)}
                                </span>
                              </div>
                            </Checkbox>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isItemSelected(selectedMenu.id) && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleDecrement(selectedMenu.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="bordered"
                              className="border-gray-300 min-w-8 w-8 h-8"
                            >
                              <FaMinus className="text-xs" />
                            </Button>
                            <span className="font-bold text-black min-w-[20px] text-center">
                              {getItemCount(selectedMenu.id)}
                            </span>
                            <Button
                              onClick={() => handleIncrement(selectedMenu.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="bordered"
                              className="border-gray-300 min-w-8 w-8 h-8"
                            >
                              <FaPlus className="text-xs" />
                            </Button>
                          </div>
                        )}
                        {!isItemSelected(selectedMenu.id) && (
                          <Button
                            onClick={() => {
                              handleCardClick(
                                {
                                  ...selectedMenu,
                                  isVariety: false,
                                },
                                false
                              );
                            }}
                            size="sm"
                            className="bg-primaryColor text-white hover:bg-primaryColor/90"
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Variety Options */}
                    {selectedMenu?.varieties?.map((item: any) => {
                      const isVarietySelected = isItemSelected(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-black">
                              {item.unit && `${item.unit}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item?.price)}
                            </p>
                            {/* Packing Cost for Variety */}
                            {isVarietySelected &&
                              selectedMenu.packingCost > 0 && (
                                <div className="mt-2">
                                  <Checkbox
                                    size="sm"
                                    isSelected={itemIsPacked(item.id)}
                                    onValueChange={(isSelected) =>
                                      handlePackingCost(item.id, isSelected)
                                    }
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-xs text-gray-600">
                                        Pack this item
                                      </span>
                                      <span className="text-xs font-medium text-black">
                                        +{formatPrice(selectedMenu.packingCost)}
                                      </span>
                                    </div>
                                  </Checkbox>
                                </div>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isVarietySelected && (
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleDecrement(item.id)}
                                  isIconOnly
                                  radius="sm"
                                  size="sm"
                                  variant="bordered"
                                  className="border-gray-300 min-w-8 w-8 h-8"
                                >
                                  <FaMinus className="text-xs" />
                                </Button>
                                <span className="font-bold text-black min-w-[20px] text-center">
                                  {getItemCount(item.id)}
                                </span>
                                <Button
                                  onClick={() => handleIncrement(item.id)}
                                  isIconOnly
                                  radius="sm"
                                  size="sm"
                                  variant="bordered"
                                  className="border-gray-300 min-w-8 w-8 h-8"
                                >
                                  <FaPlus className="text-xs" />
                                </Button>
                              </div>
                            )}
                            {!isVarietySelected && (
                              <Button
                                onClick={() => {
                                  handleCardClick(
                                    {
                                      ...item,
                                      isVariety: true,
                                      itemName: selectedMenu.itemName,
                                      menuName: selectedMenu.menuName,
                                      image: selectedMenu.image,
                                      packingCost: selectedMenu.packingCost,
                                    },
                                    false
                                  );
                                }}
                                size="sm"
                                className="bg-gray-100 text-black hover:bg-gray-200"
                              >
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Action Button */}
              <div className="px-6 pb-6">
                {!selectedMenu?.varieties &&
                  !isItemSelected(selectedMenu.id) && (
                    <CustomButton
                      onClick={() => {
                        handleCardClick(
                          {
                            ...selectedMenu,
                            isVariety: false,
                          },
                          false
                        );
                        onClose(); // Close modal after adding
                      }}
                      className="w-full h-12 text-white font-semibold flex items-center justify-center gap-2"
                      backgroundColor="bg-primaryColor"
                    >
                      <IoAddCircleOutline className="w-5 h-5" />
                      Add Items
                    </CustomButton>
                  )}

                {!selectedMenu?.varieties &&
                  isItemSelected(selectedMenu.id) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-lg p-3">
                        <Button
                          onClick={() => handleDecrement(selectedMenu.id)}
                          isIconOnly
                          radius="sm"
                          variant="bordered"
                          className="border-gray-300 min-w-10 w-10 h-10"
                        >
                          <FaMinus className="text-sm" />
                        </Button>
                        <span className="font-bold text-xl text-black min-w-[30px] text-center">
                          {getItemCount(selectedMenu.id)}
                        </span>
                        <Button
                          onClick={() => handleIncrement(selectedMenu.id)}
                          isIconOnly
                          radius="sm"
                          variant="bordered"
                          className="border-gray-300 min-w-10 w-10 h-10"
                        >
                          <FaPlus className="text-sm" />
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewModal;
