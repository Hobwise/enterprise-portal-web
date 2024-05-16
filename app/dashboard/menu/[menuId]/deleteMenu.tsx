import { deleteMenuItem } from '@/app/api/controllers/dashboard/menu';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DeleteMenu = ({ isOpenDelete, toggleModalDelete, menuItem }: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const { refetch } = useMenu();

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const removeMenuItem = async () => {
    setLoading(true);
    const data = await deleteMenuItem(
      businessInformation[0]?.businessId,
      menuItem?.id
    );
    setLoading(false);
    if (data?.data?.isSuccessful) {
      toggleModalDelete();
      toast.success('Menu item deleted successfully');
      refetch();
      router.push('/dashboard/menu');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <Modal isOpen={isOpenDelete} onOpenChange={toggleModalDelete}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-center'>
                <div className='text-black text-center mt-8 xl:w-[80%] w-full mb-2 font-[700]'>
                  Are you sure you want to delete this menu item?
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className='flex justify-center w-full gap-4 mb-4'>
                <Button
                  onClick={removeMenuItem}
                  disabled={loading}
                  color='danger'
                  variant='flat'
                >
                  Delete
                </Button>
                <Button color='primary' onPress={toggleModalDelete}>
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

export default DeleteMenu;
