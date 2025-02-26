// 'use client';
import useLogout from '@/hooks/cachedEndpoints/useLogout';
import { Button, Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/react';
import { PiSealWarningDuotone } from 'react-icons/pi';
const LogoutModal = ({ isOpen, onOpenChange }: any) => {
  const { isLoading, logoutFn } = useLogout();
  const handleLogout = async () => {
    await logoutFn();
  };

  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className="flex flex-col justify-center items-center gap-2">
                <PiSealWarningDuotone className="text-danger-500 text-[48px] mt-5" />

                <div className="text-black text-center xl:w-[80%] w-full mb-2">Are you sure you want to log out?</div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center items-center ">
              <div className="flex gap-4 mb-4">
                <Button className="flex-grow" color="default" variant="bordered" onPress={onOpenChange}>
                  Cancel
                </Button>
                <Button
                  className="flex-grow"
                  onClick={() => handleLogout()}
                  color="danger"
                  spinner={
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                  }
                  isLoading={isLoading}
                  variant="bordered"
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
