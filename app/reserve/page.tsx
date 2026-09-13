import { companyInfo } from '@/lib/companyInfo';
import { Spinner } from '@nextui-org/react';
import { Suspense } from 'react';
import SelectReservationComponents from './selectReservationComponents';

export const metadata = {
  title: `${companyInfo.name} | Reservation`,
  description: 'Select a reservation and complete bookings',
};
const reservations = () => {
  return (
    <main className="items-center h-screen bg-white  flex flex-col">
      <Suspense
        fallback={
          <div className="loadingContainer flex flex-col justify-center items-center">
            <Spinner />
          </div>
        }
      >
        <SelectReservationComponents />
      </Suspense>
    </main>
  );
};

export default reservations;
