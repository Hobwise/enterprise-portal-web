import { Spinner } from '@nextui-org/react';
import { Suspense } from 'react';
import SuccessComponent from './success';

const Success = () => {
  return (
    <main className='h-screen bg-white p-4 flex items-center justify-center flex-col'>
      <section className='lg:w-[360px] w-full py-5'>
        <Suspense
          fallback={
            <div className='loadingContainer flex flex-col justify-center items-center'>
              <Spinner />
            </div>
          }
        >
          <SuccessComponent />
        </Suspense>
      </section>
    </main>
  );
};

export default Success;
