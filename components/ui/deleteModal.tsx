'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';

const DeleteModal = ({
  isOpen,
  toggleModal,
  handleDelete,
  isLoading,

  text,
}: any) => {
  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={toggleModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-center'>
                <div className='text-black text-center mt-8 xl:w-[80%] w-full mb-2'>
                  {text}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className='flex justify-center w-full gap-4 mb-4'>
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  color='danger'
                  variant='flat'
                >
                  {isLoading ? <Spinner color='current' size='sm' /> : 'Yes'}
                </Button>
                <Button
                  color='default'
                  variant='bordered'
                  onPress={toggleModal}
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

export default DeleteModal;
