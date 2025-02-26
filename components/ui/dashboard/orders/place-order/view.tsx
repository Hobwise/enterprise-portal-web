import { CustomButton } from "@/components/customButton";
import { cn, formatPrice } from "@/lib/utils";
import {
  Checkbox,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
} from "@nextui-org/react";
import Image from "next/image";
import noImage from "../../../../../public/assets/images/no-image.svg";
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

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((item: any) => item.id === itemId);
  };

  return (
    <Modal
      classNames={{
        base: "max-h-[90%]",
        wrapper: "overflow-hidden",
      }}
      isOpen={isOpenVariety}
      onOpenChange={toggleVarietyModal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="overflow-y-auto max-h-[90%]">
              <Spacer y={5} />
              <Image
                src={
                  selectedMenu.image
                    ? `data:image/jpeg;base64,${selectedMenu.image}`
                    : noImage
                }
                width={200}
                height={200}
                style={{ objectFit: "cover" }}
                className="bg-cover h-[200px]  rounded-lg w-full"
                aria-label="uploaded image"
                alt="uploaded image(s)"
              />
              <div className="text-black">
                <h1 className="text-[28px] font-semibold">
                  {selectedMenu?.menuName}
                </h1>
                <Spacer y={2} />
                <p className="text-sm font-sm text-grey600 xl:w-[360px] w-full">
                  {selectedMenu?.itemDescription}
                </p>
                <Spacer y={2} />
                <div className="flex text-sm justify-between">
                  <div>
                    <p className=" font-[700] ">
                      {formatPrice(selectedMenu?.price)}
                    </p>
                    <Spacer y={1} />
                    <p className="text-grey600 text-sm">
                      {selectedMenu?.itemName}
                    </p>
                    <Spacer y={3} />
                    {selectedItems.find(
                      (selected) =>
                        selected.id === selectedMenu.id ||
                        selectedMenu.varieties?.some(
                          (variety) => selected.id === variety.id
                        )
                    ) && (
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
                          <span className="text-grey600 text-sm">Pack In</span>
                          <span
                            className={cn(
                              "text-xs text-gray-200",
                              itemIsPacked(selectedMenu.id) &&
                                "font-bold text-black"
                            )}
                          >
                            {formatPrice(selectedMenu.packingCost)}
                          </span>
                        </div>
                      </Checkbox>
                    )}

                    <Spacer y={3} />
                  </div>
                  {selectedMenu?.varieties && (
                    <div>
                      {selectedItems.find(
                        (selected) => selected.id === selectedMenu.id
                      ) ? (
                        <Chip
                          title="remove"
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
                            base: "bg-primaryColor cursor-pointer text-white  text-[12px]",
                          }}
                        >
                          Selected
                        </Chip>
                      ) : (
                        <CustomButton
                          onClick={() =>
                            handleCardClick(
                              {
                                ...selectedMenu,
                                isVariety: false,
                              },
                              false
                            )
                          }
                          className="h-8 w-4 text-black bg-white border border-primaryGrey"
                        >
                          Select
                        </CustomButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                {selectedMenu?.varieties ? (
                  <>
                    {selectedMenu?.varieties?.map((item) => {
                      const isItemSelected = selectedItems.find(
                        (selected) => selected.id === item.id
                      );
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm cursor-pointer"
                        >
                          <div className="pb-2  rounded-lg text-black  flex w-full">
                            <div>
                              <Image
                                src={
                                  selectedMenu?.image
                                    ? `data:image/jpeg;base64,${selectedMenu?.image}`
                                    : noImage
                                }
                                width={20}
                                height={20}
                                className="object-cover rounded-lg w-20 h-20"
                                aria-label="uploaded image"
                                alt="uploaded image(s)"
                              />
                            </div>
                            <div className="p-3 flex flex-col text-sm justify-center">
                              <span className="font-[600]">
                                {selectedMenu.menuName}
                              </span>

                              <span className="text-grey600 ">
                                {selectedMenu.itemName}{" "}
                                <span className="text-black">
                                  {item.unit && `(${item.unit})`}
                                </span>
                              </span>

                              <span className="font-[600] text-primaryColor">
                                {formatPrice(item?.price)}
                              </span>
                              {isItemSelected && (
                                <Checkbox
                                  size="sm"
                                  classNames={{
                                    base: cn("items-start"),
                                    label: "w-full",
                                  }}
                                  isSelected={itemIsPacked(item.id)}
                                  onValueChange={(isSelected) =>
                                    handlePackingCost(item.id, isSelected)
                                  }
                                >
                                  <div className="flex flex-col">
                                    <span className="text-grey600 text-sm">
                                      Pack In
                                    </span>
                                    <span
                                      className={cn(
                                        "text-xs text-gray-200",
                                        itemIsPacked(item.id) &&
                                          "font-bold text-black"
                                      )}
                                    >
                                      {formatPrice(selectedMenu.packingCost)}
                                    </span>
                                  </div>
                                </Checkbox>
                              )}
                            </div>
                          </div>
                          {selectedItems.find(
                            (selected) => selected.id === item.id
                          ) ? (
                            <Chip
                              title="remove"
                              onClick={() =>
                                handleCardClick(
                                  {
                                    ...item,
                                    isVariety: false,
                                    itemName: selectedMenu.itemName,
                                    menuName: selectedMenu.menuName,
                                    image: selectedMenu.image,
                                    packingCost: selectedMenu.packingCost,
                                  },
                                  itemIsPacked(item.id)
                                )
                              }
                              startContent={<CheckIcon size={18} />}
                              variant="flat"
                              classNames={{
                                base: "bg-primaryColor text-white  text-[12px]",
                              }}
                            >
                              Selected
                            </Chip>
                          ) : (
                            <CustomButton
                              onClick={() =>
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
                                )
                              }
                              className="h-8 text-sm w-4 text-black bg-white border border-primaryGrey"
                            >
                              Select
                            </CustomButton>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div>
                    {selectedItems.find(
                      (selected) => selected.id === selectedMenu.id
                    ) ? (
                      <CustomButton
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
                        title="remove this item"
                        className="bg-white h-10  w-full text-danger-500 border border-danger-500"
                      >
                        Remove item
                      </CustomButton>
                    ) : (
                      <CustomButton
                        onClick={() => {
                          handleCardClick(
                            {
                              ...selectedMenu,
                              isVariety: false,
                            },
                            false
                          );
                          // toggleVarietyModal();
                        }}
                        className="md:bg-white bg-primaryGrey h-10  w-full text-black border border-primaryGrey"
                      >
                        Select
                      </CustomButton>
                    )}
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
