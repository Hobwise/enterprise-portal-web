'use client';
import Error from '@/components/error';
import { columns } from '@/components/ui/dashboard/reservations/data';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import usePagination from '@/hooks/usePagination';
import { saveJsonItemToLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { Divider } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import noImage from '../../../public/assets/images/no-image.svg';
import SplashScreen from '../splash-screen';

const INITIAL_VISIBLE_COLUMNS = [
  'reservationName',
  'reservationDescription',
  'reservationFee',
  'quantity',
  'minimumSpend',
  'actions',
];

const SelectReservationComponents = () => {
  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessId');
  let cooperateID = searchParams.get('cooperateID');
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useReservation();

  const { bottomContent } = usePagination(
    data,
    columns,
    INITIAL_VISIBLE_COLUMNS
  );

  if (isError) {
    return <Error onClick={() => refetch()} />;
  }
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className='h-screen  lg:w-[480px] w-full p-4'>
      <h1 className='text-2xl  text-black '>{businessName}</h1>
      <div className='mt-7 mb-2'>
        <h2 className='text-xl text-black font-bold'>Reservations</h2>
        <p className='text-grey600'>Select a reservation to make a booking</p>
      </div>
      <Divider />

      <br />

      <>
        <div className='w-full h-[70%]  overflow-scroll'>
          {data?.reservations?.map((reservation, index) => (
            <div
              title='select reservation'
              onClick={() => {
                saveJsonItemToLocalStorage('singleReservation', reservation);
                saveToLocalStorage('businessName', businessName);
                router.push(
                  `https://hobink-corporate-web.vercel.app/reservation/select-reservation/single-reservation?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`
                );
              }}
              key={reservation.reservationName}
              className={'relative cursor-pointer  flex gap-3 mb-2'}
            >
              <Image
                width={60}
                height={60}
                src={
                  reservation?.image
                    ? `data:image/jpeg;base64,${reservation?.image}`
                    : noImage
                }
                alt={index + reservation.reservationName}
                className='w-[60px] h-[60px] rounded-lg border border-primaryGrey mb-2 bg-cover'
              />
              <div className='text-black'>
                <h3 className='font-[500]'>{reservation.reservationName}</h3>
                <p className='text-gray-600 text-[14px] font-[400]'>
                  {reservation.reservationDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
        <>{bottomContent}</>
      </>
    </div>
  );
};

export default SelectReservationComponents;
