'use client';
import Error from '@/components/error';
import { saveJsonItemToLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { Divider, Pagination, Spinner } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import noImage from '../../../public/assets/images/no-image.svg';

const reservations = () => {
  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessId');
  let cooperateID = searchParams.get('cooperateID');
  const router = useRouter();

  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState([]);

  const rowsPerPage = 10;

  const pages = useMemo(() => {
    return reservationData?.count
      ? Math.ceil(reservationData.count / rowsPerPage)
      : 0;
  }, [reservationData?.count, rowsPerPage]);

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const reservation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseURL}api/v1/Reservation/by-business`, {
        headers: {
          cooperateId: cooperateID,
          businessId: businessId,
        },
      });

      const data = await response.json();

      setReservationData(data?.data);
      setIsLoading(false);
    } catch (error) {
      setError(true);
    }
  };

  if (error) {
    return <Error onClick={() => reservation()} />;
  }

  useEffect(() => {
    reservation();
  }, []);

  return (
    <main className='items-center h-screen bg-white p-4 flex flex-col'>
      <section className='lg:w-[360px] w-full pt-7'>
        <h1 className='text-2xl  text-black '>{businessName}</h1>
        <div className='mt-7 mb-2'>
          <h2 className='text-xl text-black font-bold'>Reservations</h2>
          <p className='text-grey600'>Select a reservation to make a booking</p>
        </div>
        <Divider />

        <br />
        {isLoading ? (
          <div className='grid place-content-center'>
            <Spinner />
          </div>
        ) : (
          <div className=''>
            {reservationData?.map((reservation, index) => (
              <div
                title='select reservation'
                onClick={() => {
                  saveJsonItemToLocalStorage('singleReservation', reservation);
                  saveToLocalStorage('businessName', businessName);
                  router.push(
                    '/reservation/select-reservation/single-reservation'
                  );
                }}
                key={reservation.reservationName}
                className={'relative cursor-pointer flex gap-3 mb-2'}
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
                  <h3 className=' font-[500]'>{reservation.reservationName}</h3>
                  <p className='text-gray-600 text-[14px] font-[400]'>
                    {reservation.reservationDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {reservationData.length > 10 ? (
          <div className='flex w-full justify-center'>
            <Pagination
              isCompact
              showControls
              showShadow
              color='primary'
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null}
        {/* <div className='flex gap-2 justify-between items-center'>
          <Button
            size='sm'
            variant='faded'
            className='text-black'
            color='secondary'
            onPress={() => setPage((prev) => (prev > 1 ? prev - 1 : prev))}
          >
            Previous
          </Button>
          <Pagination isCompact page={page} total={pages} onChange={setPage} />
          <Button
            size='sm'
            variant='faded'
            className='text-black'
            color='secondary'
            onPress={() => setPage((prev) => (prev < 10 ? prev + 1 : prev))}
          >
            Next
          </Button>
        </div> */}
      </section>
    </main>
  );
};

export default reservations;
