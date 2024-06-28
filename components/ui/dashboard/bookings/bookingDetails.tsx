'use client';
import {
  statusColorMap,
  statusDataMap,
} from '@/app/dashboard/reservation/[reservationId]/data';
import { CustomButton } from '@/components/customButton';
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
} from '@nextui-org/react';

const BookingDetails = ({
  openBookingModal,
  updateBookingStatus,
  closeBookingModal,
  setBookingId,
  isLoading,
  bookingDetails,
}: any) => {
  const getButtonText = () => {
    switch (bookingDetails?.bookingStatus) {
      case 0:
        return 'Accept this booking';
      case 1:
        return 'Admit customer';
      case 4:
        return 'Close this booking';
      default:
        return 'Admit';
    }
  };

  const shouldShowButton = ![3, 5, 6, 2].includes(
    bookingDetails?.bookingStatus
  );
  return (
    <Modal
      isDismissable={false}
      isOpen={openBookingModal}
      onOpenChange={() => {
        setBookingId('');
        closeBookingModal();
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-between  mt-8 items-center'>
                <h2 className='text-[24px] leading-3 text-black font-semibold'>
                  Booking Details
                </h2>
                <Chip
                  className='capitalize'
                  color={statusColorMap[bookingDetails?.bookingStatus]}
                  size='sm'
                  variant='bordered'
                >
                  {statusDataMap[bookingDetails?.bookingStatus]}
                </Chip>
              </div>
              <p className='text-sm  text-grey600  mb-4'>
                Booking for {bookingDetails.reservationId}
              </p>
              <div>
                <p className='font-[400] text-grey500 text-[14px]'>NAME</p>
                <p className='font-[500] text-black '>
                  {bookingDetails.firstName} {bookingDetails.lastName}
                </p>
              </div>
              <Spacer y={1} />
              <div>
                <p className='font-[400] text-grey500 text-[14px]'>
                  RESERVATION
                </p>
                <p className='font-[500] text-black '>
                  {bookingDetails.reservation}{' '}
                </p>
              </div>
              <Spacer y={1} />
              <div>
                <p className='font-[400] text-grey500 text-[14px]'>
                  EMAIL ADDRESS
                </p>
                <p className='font-[500] text-black '>
                  {bookingDetails.emailAddress}
                </p>
              </div>

              {shouldShowButton && (
                <>
                  <Spacer y={2} />
                  <CustomButton
                    loading={isLoading}
                    onClick={updateBookingStatus}
                    disabled={isLoading}
                    type='submit'
                  >
                    {isLoading ? 'Processing...' : getButtonText()}
                  </CustomButton>
                </>
              )}

              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingDetails;
