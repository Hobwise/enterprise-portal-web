import { completeOrder } from '@/app/api/controllers/dashboard/orders';
import { CustomButton } from '@/components/customButton';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from '@nextui-org/react';
import Image from 'next/image';
import { useState } from 'react';
import noMenu from '../../../../public/assets/images/no-menu.png';

const CancelOrderModal = ({
  isOpenCancelOrder,
  singleOrder,
  toggleCancelModal,
  refetch,
}: any) => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);

    const payload = {
      treatedBy: `${userInformation.firstName}  ${userInformation.lastName}`,
      paymentMethod: singleOrder.paymentMethod,
      paymentReference: singleOrder.paymentReference,
      treatedById: userInformation.id,
      status: 2,
    };

    const data = await completeOrder(payload, singleOrder.id);
    setLoading(false);

    if (data?.data?.isSuccessful) {
      notify({
        title: 'Success!',
        text: 'Order canceled',
        type: 'success',
      });

      toggleCancelModal();

      refetch();
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  return (
    <Modal isOpen={isOpenCancelOrder} onOpenChange={toggleCancelModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='grid place-content-center text-center text-black'>
              <h3 className='font-[600]'>Cancel this order</h3>
              <p className='text-sm'>Will you like to cancel this order?</p>
            </ModalHeader>
            <ModalBody className='flex justify-center'>
              <div className='grid place-content-center'>
                <Image
                  className='w-[60px]  h-[60px]'
                  src={noMenu}
                  alt='no menu illustration'
                />
              </div>
              <Spacer y={2} />
              <div className='flex gap-5'>
                <CustomButton
                  className='bg-white text-black border border-primaryGrey flex-grow'
                  onClick={() => toggleCancelModal()}
                  type='submit'
                >
                  No, leave it open
                </CustomButton>
                <CustomButton
                  className='flex-grow text-white'
                  loading={loading}
                  onClick={handleCancel}
                  disabled={loading}
                  type='submit'
                >
                  {loading ? 'Loading' : 'Yes, cancel this order'}
                </CustomButton>
              </div>
              <Spacer y={2} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CancelOrderModal;
