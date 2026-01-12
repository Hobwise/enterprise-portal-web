'use client';
import { removeQR } from '@/app/api/controllers/dashboard/quickResponse';
import useQR from '@/hooks/cachedEndpoints/useQRcode';
import {
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DeleteQRModal = ({ isOpenDelete, toggleQRmodalModal }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useQR();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const qrObject = getJsonItemFromLocalStorage('qr');

  const deleteQR = async () => {
    setIsLoading(true);
    const data = await removeQR(
      businessInformation[0]?.businessId,
      qrObject?.id
    );
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      toggleQRmodalModal();
      toast.success('QR deleted successfully');
      clearItemLocalStorage('qr');
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
    <Modal isOpen={isOpenDelete} onOpenChange={toggleQRmodalModal} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-center'>
                <div className='text-black text-center mt-8 xl:w-[80%] w-full mb-2'>
                  Are you sure you want to delete this QR?
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className='flex justify-center w-full gap-4 mb-4'>
                <Button
                  onClick={deleteQR}
                  disabled={isLoading}
                  color='danger'
                  variant='flat'
                >
                  Delete
                </Button>
                <Button
                  color='default'
                  variant='bordered'
                  onPress={toggleQRmodalModal}
                >
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteQRModal;
