import { Spinner } from '@nextui-org/react';
import { Suspense } from 'react';
import SingleReservationComponent from './singleReservationComponent';

const SingleReservation = () => {
  return (
    <Suspense
      fallback={
        <div className="loadingContainer flex flex-col justify-center items-center">
          <Spinner />
        </div>
      }
    >
      <SingleReservationComponent />
    </Suspense>

    // <main className='items-center h-screen bg-white p-4 flex flex-col'>
    //   <section className='lg:w-[360px] w-full py-5'>
    //     <Suspense
    // fallback={
    //   <div className='loadingContainer flex flex-col justify-center items-center'>
    //     <Spinner />
    //   </div>
    // }
    //     >
    //       <SingleReservationComponent />
    //     </Suspense>
    //   </section>
    // </main>
  );
};

export default SingleReservation;
