// 'use client';
import { removeCookie } from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { PiSealWarningDuotone } from 'react-icons/pi';
import { useQueryClient } from 'react-query';
const LogoutModal = ({ isOpen, onOpenChange }: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear();
    localStorage.clear();
    removeCookie('token');
    router.push('/auth/login');
  };

  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex flex-col justify-center items-center gap-2'>
                <PiSealWarningDuotone className='text-danger-500 text-[48px] mt-5' />

                <div className='text-black text-center xl:w-[80%] w-full mb-2 font-[700]'>
                  Are you sure you want to log out?
                </div>
              </div>
            </ModalBody>
            <ModalFooter className='flex justify-center items-center '>
              <div className='flex gap-4 mb-4'>
                <Button
                  className='flex-grow'
                  color='default'
                  variant='bordered'
                  onPress={onOpenChange}
                >
                  Cancel
                </Button>
                <Button
                  className='flex-grow'
                  onClick={() => handleLogout()}
                  color='danger'
                  variant='bordered'
                >
                  Logout
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LogoutModal;
