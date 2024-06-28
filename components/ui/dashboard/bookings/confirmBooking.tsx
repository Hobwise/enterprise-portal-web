'use client';
import { getBookingByRef } from '@/app/api/controllers/dashboard/bookings';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { Modal, ModalBody, ModalContent, Spacer } from '@nextui-org/react';
import React, { useState } from 'react';

const ConfirmBooking = ({
  isOpen,
  onOpenChange,
  showBookingModal,
  setBookingDetails,
  bookingId,
  setBookingId,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await getBookingByRef(
      businessInformation[0]?.businessId,
      bookingId
    );
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      setBookingDetails(data.data.data);
      onOpenChange();
      showBookingModal();
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  return (
    <Modal
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={() => {
        onOpenChange();
        setBookingId('');
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className='text-[24px] leading-3 mt-8 text-black font-semibold'>
                Accept booking
              </h2>
              <p className='text-sm  text-grey600   mb-4'>
                Enter booking ID to verify a booking
              </p>
              <form onSubmit={handleConfirmBooking}>
                <CustomInput
                  type='text'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBookingId(e.target.value)
                  }
                  value={bookingId}
                  label='Booking ID'
                  placeholder='Enter the booking ID'
                />
                <Spacer y={8} />

                <CustomButton
                  loading={isLoading}
                  disabled={bookingId.length < 2 || isLoading}
                  type='submit'
                >
                  {isLoading ? 'Verifying booking...' : 'Search'}
                </CustomButton>
              </form>
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmBooking;
