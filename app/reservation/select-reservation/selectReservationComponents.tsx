'use client';
import Error from '@/components/error';
import useReservationUser from '@/hooks/cachedEndpoints/useReservationUser';
import { companyInfo } from '@/lib/companyInfo';
import { saveJsonItemToLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { Divider } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import noImage from '../../../public/assets/images/no-image.svg';
import SplashScreen from '../splash-screen';

const SelectReservationComponents = () => {
  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessId');
  let cooperateID = searchParams.get('cooperateID');
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useReservationUser(businessId, cooperateID);

  if (isError) {
    return <Error imageHeight={'h-32'} onClick={() => refetch()} />;
  }
  if (isLoading) {
    return <SplashScreen businessName={businessName} />;
  }

  return (
    <div className="h-screen  lg:w-[480px] w-full p-4">
      <h1 className="text-2xl  text-black ">{businessName}</h1>
      <div className="mt-7 mb-2">
        <h2 className="text-xl text-black font-bold">Reservations</h2>
        <p className="text-grey600">Select a reservation to make a booking</p>
      </div>
      <Divider className="mb-3" />

      <>
        <div className="w-full">
          {data?.reservations?.map((reservation, index) => (
            <>
              <div
                title="select reservation"
                onClick={() => {
                  saveJsonItemToLocalStorage('singleReservation', reservation);
                  saveToLocalStorage('businessName', businessName);
                  router.push(
                    `${companyInfo.webUrl}/reservation/select-reservation/single-reservation?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`
                  );
                }}
                key={reservation.reservationName}
                className={'relative cursor-pointer  flex gap-3'}
              >
                <Image
                  width={60}
                  height={60}
                  src={reservation?.image ? `data:image/jpeg;base64,${reservation?.image}` : noImage}
                  alt={index + reservation.reservationName}
                  className="w-[70px] h-[60px] rounded-lg border border-primaryGrey bg-cover"
                />
                <div className="text-black w-full ">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-[500]">{reservation.reservationName}</h3>
                    {/* <span className='bg-[#F5F5F5] rounded-md text-black text-sx px-3 py-1'>
                      {reservation?.quantityLeft} remaining
                    </span> */}
                  </div>
                  <p className="text-gray-600 text-[14px] font-[400]">{reservation.reservationDescription}</p>
                </div>
              </div>
              <Divider className="bg-[#E4E7EC80] my-2" />
            </>
          ))}
        </div>
      </>
    </div>
  );
};

export default SelectReservationComponents;
