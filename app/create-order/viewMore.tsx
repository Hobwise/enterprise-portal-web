import { CustomButton } from '@/components/customButton';
import { CheckIcon } from '@/components/ui/dashboard/orders/place-order/data';
import { formatPrice } from '@/lib/utils';
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
} from '@nextui-org/react';
import Image from 'next/image';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import noImage from '../../public/assets/images/no-image.svg';

const ViewModal = ({
  selectedItems,
  isOpenVariety,
  selectedMenu,
  toggleVarietyModal,
  handleCardClick,
  handleDecrement,
  handleIncrement,
  totalPrice,
}: any) => {
  const getItemCount = (itemId: string) => {
    const item = selectedItems.find((item: any) => item.id === itemId);
    return item ? item.count : 0;
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((item: any) => item.id === itemId);
  };

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
                style={{ objectFit: 'cover' }}
                className='bg-cover h-[200px] rounded-lg w-full'
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
                <div className='flex text-sm justify-between'>
                  <div>
                    <p className='font-[700]'>
                      {formatPrice(selectedMenu?.price)}
                    </p>
                    <Spacer y={1} />
                    <p className='text-grey600 text-sm'>
                      {selectedMenu?.itemName}
                    </p>
                    <Spacer y={3} />
                  </div>
                  {isItemSelected(selectedMenu.id) && (
                    <div className='flex'>
                      <Button
                        onClick={() => handleDecrement(selectedMenu.id)}
                        isIconOnly
                        radius='sm'
                        variant='faded'
                        className='border h-[35px] w-[35px] border-primaryGrey bg-white'
                        aria-label='minus'
                      >
                        <FaMinus />
                      </Button>
                      <span className='font-bold text-black py-2 px-3'>
                        {getItemCount(selectedMenu.id)}
                      </span>
                      <Button
                        onClick={() => handleIncrement(selectedMenu.id)}
                        isIconOnly
                        radius='sm'
                        variant='faded'
                        className='border border-primaryGrey h-[35px] w-[35px] bg-white'
                        aria-label='plus'
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  )}
                  {selectedMenu?.varieties ? (
                    <div className='flex'>
                      {isItemSelected(selectedMenu.id) ? (
                        <Chip
                          title='remove'
                          onClick={() =>
                            handleCardClick({
                              ...selectedMenu,
                              isVariety: false,
                            })
                          }
                          startContent={<CheckIcon size={18} />}
                          variant='flat'
                          classNames={{
                            base: 'bg-primaryColor cursor-pointer text-white text-[12px]',
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
                          className='h-8 w-8 text-black bg-primaryGrey border border-primaryGrey'
                        >
                          Select
                        </CustomButton>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className='max-h-[200px] overflow-scroll'>
                {selectedMenu?.varieties ? (
                  <>
                    {selectedMenu?.varieties?.map((item: any) => {
                      const isVarietySelected = isItemSelected(item.id);
                      return (
                        <div
                          key={item.id}
                          className='flex justify-between gap-3 items-center text-sm cursor-pointer'
                        >
                          <div className='pb-3 rounded-lg text-black flex'>
                            <div className='flex flex-col text-sm justify-center'>
                              <span className='font-[600]'>
                                {selectedMenu.menuName}
                              </span>
                              <span className='text-grey600'>
                                {selectedMenu.itemName}
                              </span>
                              <span className='font-[600] text-primaryColor'>
                                {formatPrice(item?.price)}
                              </span>
                            </div>
                          </div>
                          {isVarietySelected && (
                            <div className='flex items-center'>
                              <Button
                                onClick={() => handleDecrement(item.id)}
                                isIconOnly
                                radius='sm'
                                variant='faded'
                                className='border h-[35px] w-[35px] border-primaryGrey bg-white'
                                aria-label='minus'
                              >
                                <FaMinus />
                              </Button>
                              <span className='font-bold text-black py-2 px-3'>
                                {getItemCount(item.id)}
                              </span>
                              <Button
                                onClick={() => handleIncrement(item.id)}
                                isIconOnly
                                radius='sm'
                                variant='faded'
                                className='border h-[35px] w-[35px] border-primaryGrey bg-white'
                                aria-label='plus'
                              >
                                <FaPlus />
                              </Button>
                            </div>
                          )}
                          <div className='flex flex-col'>
                            {isVarietySelected ? (
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
                                  base: 'bg-primaryColor text-white text-[12px]',
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
                                className='h-8 text-sm w-4 text-black bg-primaryGrey border border-primaryGrey'
                              >
                                Select
                              </CustomButton>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div>
                    {isItemSelected(selectedMenu.id) ? (
                      <CustomButton
                        onClick={() => {
                          handleCardClick({
                            ...selectedMenu,
                            isVariety: false,
                          });
                          toggleVarietyModal();
                        }}
                        title='remove this item'
                        className='bg-white h-10 w-full text-danger-500 border border-danger-500'
                      >
                        Remove item
                      </CustomButton>
                    ) : (
                      <CustomButton
                        onClick={() => {
                          handleCardClick({
                            ...selectedMenu,
                            isVariety: false,
                          });
                        }}
                        className='md:bg-white bg-primaryGrey h-10 w-full text-black border border-primaryGrey'
                      >
                        Select
                      </CustomButton>
                    )}
                  </div>
                )}
              </div>
              {selectedItems.length > 0 && (
                <div className='flex gap-2 text-black text-sm bg-primaryGrey rounded-md p-3 w-full items-center mb-2 justify-between'>
                  <p className='text-grey500'>Total Amount</p>
                  <div className='flex gap-2 font-bold items-center'>
                    {formatPrice(totalPrice)}{' '}
                  </div>
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
