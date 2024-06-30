import { CustomButton } from '@/components/customButton';
import { Modal, ModalBody, ModalContent, Spacer } from '@nextui-org/react';
import Image from 'next/image';
import Success from '../../../../public/assets/images/success.png';

const SuccessModal = ({
  openSuccessModal,
  bookingDetails,
  showCreateBookingModal,
  closeSuccessModal,
}: any) => {
  return (
    <Modal
      isDismissable={false}
      isOpen={openSuccessModal}
      onOpenChange={() => {
        closeSuccessModal();
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='grid place-content-center mt-8'>
                <Image src={Success} alt='success' />
              </div>

              <h2 className='text-[16px] text-center leading-3 my-4 text-black font-semibold'>
                Fantastic!
              </h2>
              <h3 className='text-sm text-center text-grey600  mb-4'>
                You have successfully made a booking for{' '}
                <span className='font-[600] text-black'>
                  {bookingDetails.firstName} {bookingDetails.lastName}.
                </span>{' '}
                Confirmation email has been sent to has been sent to{' '}
                <span className='font-[600] text-black'>
                  {bookingDetails.emailAddress}
                </span>
              </h3>

              {/* <Spacer y={4} /> */}
              <div className='flex gap-4'>
                <CustomButton
                  className='h-[48px] flex-grow text-black border bg-transparent border-[#D0D5DD]'
                  onClick={() => {
                    closeSuccessModal();
                  }}
                >
                  close
                </CustomButton>
                <CustomButton
                  className='h-[48px] px-3 flex-grow text-white'
                  onClick={() => {
                    closeSuccessModal();
                    showCreateBookingModal();
                  }}
                >
                  Make another booking
                </CustomButton>
              </div>
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SuccessModal;
