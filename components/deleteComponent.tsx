import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';

const CustomDelete = ({
  isOpen,
  toggleDelete,
  action,
  isLoading,
  title,
}: any) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={toggleDelete}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-center'>
                <div className='text-black text-center mt-8 xl:w-[80%] w-full mb-2 '>
                  {title}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className='flex justify-center w-full gap-4 mb-4'>
                <Button
                  onClick={action}
                  isDisabled={isLoading}
                  color='danger'
                  variant='flat'
                >
                  Delete
                </Button>
                <Button
                  color='default'
                  variant='bordered'
                  onPress={toggleDelete}
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

export default CustomDelete;
