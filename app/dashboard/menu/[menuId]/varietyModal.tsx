'use client';
import { createMenuVariety } from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { formatPrice, getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { Modal, ModalBody, ModalContent, Spacer } from '@nextui-org/react';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import noImage from '../../../../public/assets/images/no-image.svg';

const VarietyModal = ({ menuItem, isOpen, toggleModal, getMenu }: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState(0);
  const [response, setResponse] = useState(null);

  const createVariety = async () => {
    setLoading(true);
    const payload = {
      itemID: menuItem?.id,
      menuID: menuItem?.menuID,
      unit: unit,
      price: +price,
      currency: 'NGA',
    };

    const data = await createMenuVariety(
      businessInformation[0]?.businessId,
      payload
    );

    setResponse(data);

    setLoading(false);

    if (data?.data?.isSuccessful) {
      toast.success('Variety successfully added');
      getMenu(false);
      toggleModal();
      setPrice(0);
      setUnit('');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={toggleModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className='text-[24px] leading-3 mt-8 text-black font-semibold'>
                Create Variety
              </h2>
              <p className='text-sm  text-grey600  xl:w-[231px]  w-full mb-4'>
                Create variety for menu items
              </p>
              <div className='bg-[#F5F5F5] rounded-lg text-black  flex'>
                <div className='p-3'>
                  <Image
                    src={
                      menuItem?.image
                        ? `data:image/jpeg;base64,${menuItem?.image}`
                        : noImage
                    }
                    width={20}
                    height={20}
                    className='object-cover rounded-lg w-32 h-full'
                    aria-label='uploaded image'
                    alt='uploaded image(s)'
                  />
                </div>
                <div className='p-3'>
                  <p className=' font-[700]'>{menuItem?.menuName}</p>
                  <Spacer y={1} />
                  <p className='text-grey600 text-sm'>{menuItem?.itemName}</p>
                  <Spacer y={1} />
                  <p className='font-[700]'>{formatPrice(menuItem?.price)}</p>
                </div>
              </div>
              <CustomInput
                type='text'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUnit(e.target.value);
                  setResponse(null);
                }}
                errorMessage={response?.errors?.unit?.[0]}
                value={unit}
                label='Unit'
                placeholder='E.g 1 glass or 1 bottle'
              />
              <Spacer y={2} />
              <CustomInput
                type='text'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPrice(e.target.value);
                  setResponse(null);
                }}
                errorMessage={response?.errors?.price?.[0]}
                value={price}
                label='Price'
                placeholder='NGN 8,000'
              />
              <Spacer y={2} />

              <CustomButton
                loading={loading}
                onClick={createVariety}
                disabled={loading}
                type='submit'
              >
                {loading ? 'Loading' : 'Add variety'}
              </CustomButton>

              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VarietyModal;
