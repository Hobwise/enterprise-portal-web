import { Suspense } from 'react';
import SelectReservationComponents from './selectReservationComponents';

export const metadata = {
  title: 'Welcome to Hobink | Reservation',
  description: 'Select a reservation and complete bookings',
};
const reservations = () => {
  return (
    <main className='items-center h-screen bg-white p-4 flex flex-col'>
      <section className='lg:w-[360px] w-full pt-7'>
        <Suspense>
          <SelectReservationComponents />
        </Suspense>
      </section>
    </main>
  );
};

export default reservations;
