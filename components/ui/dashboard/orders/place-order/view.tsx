import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
  Tooltip,
} from '@nextui-org/react';
import Image from 'next/image';
import React from 'react';
import noImage from '../../../../../public/assets/images/no-image.png';
import { CheckIcon } from './data';
import { CustomButton } from '@/components/customButton';
import { formatPrice } from '@/lib/utils';

const ViewModal = ({
  selectedItems,
  isOpenVariety,
  selectedMenu,
  toggleVarietyModal,
  handleCardClick,
}: any) => {
  console.log(selectedItems, 'selectedItems');
  console.log(selectedMenu?.varieties, 'selectedMenu?.varieties');
  return (
    <Modal isOpen={isOpenVariety} onOpenChange={toggleVarietyModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <Spacer y={5} />
              <Image
                src={
                  selectedMenu.image
                    ? `data:image/jpeg;base64,${selectedMenu.image}`
                    : noImage
                }
                width={200}
                height={200}
                className='bg-contain h-[200px]  rounded-lg w-full'
                aria-label='uploaded image'
                alt='uploaded image(s)'
              />
              <div className='text-black'>
                <h1 className='text-[28px] font-semibold'>
                  {selectedMenu?.menuName}
                </h1>
                <Spacer y={2} />
                <p className='text-sm font-sm text-grey600 xl:w-[360px] w-full'>
                  {selectedMenu?.itemDescription}
                </p>
                <Spacer y={2} />
                <p className=' font-[700] '>
                  {formatPrice(selectedMenu?.price)}
                </p>
                <Spacer y={2} />
                <p className='text-grey600 text-sm'>{selectedMenu?.itemName}</p>
                <Spacer y={3} />
              </div>
              {selectedMenu?.varieties ? (
                <>
                  {selectedMenu?.varieties?.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className='flex justify-between cursor-pointer'
                      >
                        <div className='pb-2 rounded-lg text-black  flex w-full'>
                          <div>
                            <Image
                              src={
                                selectedMenu?.image
                                  ? `data:image/jpeg;base64,${selectedMenu?.image}`
                                  : noImage
                              }
                              width={20}
                              height={20}
                              className='object-cover rounded-lg w-20 h-20'
                              aria-label='uploaded image'
                              alt='uploaded image(s)'
                            />
                          </div>
                          <div className='p-3 flex flex-col text-sm justify-center'>
                            <p className='font-[600]'>
                              {selectedMenu.menuName}
                            </p>
                            <Spacer y={1} />
                            <p className='text-grey600 '>
                              {selectedMenu.itemName}
                            </p>
                            <Spacer y={1} />
                            <p className='font-[600] text-primaryColor'>
                              {formatPrice(item?.price)}
                            </p>
                          </div>
                        </div>
                        {selectedItems.find(
                          (selected) => selected.id === item.id
                        ) ? (
                          <Chip
                            title='remove'
                            onClick={() =>
                              handleCardClick({
                                ...item,
                                isVariety: false,
                                itemName: selectedMenu.itemName,
                                menuName: selectedMenu.menuName,
                                image: selectedMenu.image,
                              })
                            }
                            startContent={<CheckIcon size={18} />}
                            variant='flat'
                            classNames={{
                              base: 'bg-primaryColor text-white  text-[12px]',
                            }}
                          >
                            Selected
                          </Chip>
                        ) : (
                          <CustomButton
                            onClick={() =>
                              handleCardClick({
                                ...item,
                                isVariety: true,
                                itemName: selectedMenu.itemName,
                                menuName: selectedMenu.menuName,
                                image: selectedMenu.image,
                              })
                            }
                            className='h-9 w-6 text-black bg-white border border-primaryGrey'
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
                    <Chip
                      onClick={() =>
                        handleCardClick({
                          ...selectedMenu,
                          isVariety: false,
                        })
                      }
                      startContent={<CheckIcon size={18} />}
                      variant='flat'
                      classNames={{
                        base: 'bg-primaryColor text-white cursor-pointer text-[12px]',
                      }}
                    >
                      Selected
                    </Chip>
                  ) : (
                    <CustomButton
                      onClick={() =>
                        handleCardClick({
                          ...selectedMenu,
                          isVariety: false,
                        })
                      }
                      className='bg-white h-9 w-6  text-black border border-primaryGrey'
                    >
                      Select
                    </CustomButton>
                  )}
                  <Spacer y={3} />
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewModal;
