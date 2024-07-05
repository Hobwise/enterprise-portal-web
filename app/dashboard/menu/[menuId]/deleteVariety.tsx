import { deleteVariety } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DeleteVariety = ({
  isOpenDeleteVariety,
  toggleModalDeleteVariety,

  varietyDetails,
  getMenu,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [loading, setLoading] = useState(false);

  const removeVariety = async () => {
    setLoading(true);
    const data = await deleteVariety(
      businessInformation[0]?.businessId,
      varietyDetails?.id
    );
    setLoading(false);
    if (data?.data?.isSuccessful) {
      getMenu(false);
      toggleModalDeleteVariety();
      toast.success('Variety deleted successfully');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <Modal isOpen={isOpenDeleteVariety} onOpenChange={toggleModalDeleteVariety}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-center'>
                <div className='text-black text-center mt-8 xl:w-[80%] w-full mb-2 font-[700]'>
                  Are you sure you want to delete this Variety?
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className='flex justify-center w-full gap-4 mb-4'>
                <Button
                  onClick={removeVariety}
                  disabled={loading}
                  color='danger'
                  variant='flat'
                >
                  Delete
                </Button>
                <Button
                  color='default'
                  variant='bordered'
                  onPress={toggleModalDeleteVariety}
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

export default DeleteVariety;
