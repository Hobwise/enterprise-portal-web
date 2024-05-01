import { CustomButton } from '@/components/customButton';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spacer,
} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteMenuItem,
  deleteVariety,
  editMenuVariety,
} from '@/app/api/controllers/dashboard/menu';
import toast from 'react-hot-toast';
import { revalidatePath } from 'next/cache';
import { CustomInput } from '@/components/CustomInput';
import Image from 'next/image';
import noImage from '../../../../public/assets/images/no-image.png';

const EditVariety = ({
  isOpenEditVariety,
  toggleModalEditVariety,
  menuItem,
  varietyDetails,
  getMenu,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState(varietyDetails?.unit || '');
  const [price, setPrice] = useState(varietyDetails?.price || '');
  const [response, setResponse] = useState(null);

  const updateVariety = async () => {
    setLoading(true);
    const payload = {
      id: varietyDetails?.id,
      itemID: menuItem?.id,
      menuID: menuItem?.menuID,
      unit: unit,
      price: +price,
      currency: 'NGA',
    };

    const data = await editMenuVariety(
      businessInformation[0]?.businessId,
      payload,
      varietyDetails?.id
    );

    setResponse(data);

    setLoading(false);

    if (data?.data?.isSuccessful) {
      toast.success('Variety updated successfully ');
      getMenu();
      toggleModalEditVariety();
      setPrice('');
      setUnit('');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  useEffect(() => {
    setUnit(varietyDetails?.unit);
    setPrice(varietyDetails?.price);
  }, [varietyDetails]);
  return (
    <Modal
      isOpen={isOpenEditVariety}
      onOpenChange={() => {
        toggleModalEditVariety();
        setUnit(varietyDetails?.unit || '');
        setPrice(varietyDetails?.price || '');
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className='text-[24px] leading-3 mt-8 text-black font-semibold'>
                Update Variety
              </h2>

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
                  <p className='font-[700]'>₦{varietyDetails?.price}</p>
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
                onClick={updateVariety}
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

export default EditVariety;
