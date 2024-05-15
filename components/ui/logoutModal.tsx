'use client';
import {
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
  removeCookie,
} from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { PiSealWarningDuotone } from 'react-icons/pi';
const LogoutModal = ({ isOpen, onOpenChange }: any) => {
  const router = useRouter();
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
                  color='primary'
                  onPress={onOpenChange}
                >
                  Cancel
                </Button>
                <Button
                  className='flex-grow'
                  onClick={() => {
                    clearItemLocalStorage('userInformation');
                    removeCookie('token');
                    router.push('/auth/login');
                  }}
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
