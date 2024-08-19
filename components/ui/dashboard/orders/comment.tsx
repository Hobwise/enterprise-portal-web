'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';

const Comment = ({ isOpenComment, singleOrder, toggleCommentModal }: any) => {
  return (
    <Modal isOpen={isOpenComment} onOpenChange={toggleCommentModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col text-black gap-1'>
              Comment
            </ModalHeader>
            <ModalBody className='text-black'>
              <p>{singleOrder.comment}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color='danger'
                variant='bordered'
                onPress={toggleCommentModal}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Comment;
