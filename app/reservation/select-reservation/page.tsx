import { Spinner } from '@nextui-org/react';
import { Suspense } from 'react';
import SelectReservationComponents from './selectReservationComponents';

export const metadata = {
  title: 'Welcome to Hobink | Reservation',
  description: 'Select a reservation and complete bookings',
};
const reservations = () => {
  return (
    <main className='items-center h-screen bg-white  flex flex-col'>
      <section className='lg:w-[360px] w-full'>
        <Suspense
          fallback={
            <div className='loadingContainer flex flex-col justify-center items-center'>
              <Spinner />
            </div>
          }
        >
          <SelectReservationComponents />
        </Suspense>
      </section>
    </main>
  );
};

export default reservations;
