import { Skeleton } from '@nextui-org/react';

const SkeletonLoaderModules = () => {
  return (
    <section className='w-full animate-pulse'>
      <article className='flex md:gap-6 gap-3 xl:flex-row flex-col'>
        <div className='lg:w-[70%] flex flex-col lg:flex-row lg:gap-5 gap-3 w-full'>
          <div className='flex lg:w-[70%] w-full flex-col lg:gap-5 gap-3'>
            {/* Payments Skeleton */}
            <div className='border border-primaryGrey rounded-xl  flex-grow'>
              <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                <Skeleton className='h-6 w-24 rounded-md' />
              </div>
              <div className='w-full  p-5 flex gap-4'>
                <Skeleton className='w-[100px] h-[100px]  rounded-full' />
                <div className='flex flex-col justify-center gap-1'>
                  <Skeleton className='h-4 w-24 rounded-md' />
                  <Skeleton className='h-4 w-40 rounded-md' />
                  <Skeleton className='h-4 w-22 rounded-md' />
                  <Skeleton className='h-4 w-16 rounded-md' />
                </div>
              </div>
            </div>
            {/* Bookings Skeleton */}
            <div className='border flex-grow border-primaryGrey rounded-xl'>
              <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                <Skeleton className='h-6 w-24 rounded-md' />
              </div>
              <div className='p-6 flex h-[150px] items-center space-x-6'>
                <div className='flex flex-col'>
                  <Skeleton className='h-4 w-24 rounded-md' />
                  <Skeleton className='h-4 w-28 mt-2 rounded-md' />
                  <Skeleton className='h-4 w-24 mt-2 rounded-md' />
                </div>
                <div className='flex flex-col'>
                  <Skeleton className='h-4 w-24 rounded-md' />
                  <Skeleton className='h-4 w-28 mt-2 rounded-md' />
                  <Skeleton className='h-4 w-24 mt-2 rounded-md' />
                </div>
              </div>
            </div>
          </div>
          {/* Best Sellers Skeleton */}
          <div className='border flex-grow border-primaryGrey rounded-xl'>
            <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
              <Skeleton className='h-6 w-24 rounded-md' />
            </div>
            <div className='p-3 space-y-4'>
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className='flex gap-4 lg:justify-between justify-start'
                >
                  <Skeleton className='h-[60px] w-[60px] rounded-lg' />
                  <div className='flex flex-col gap-1'>
                    <Skeleton className='h-4 w-40 rounded-md' />
                    <Skeleton className='h-4 w-24 rounded-md' />
                    <Skeleton className='h-4 w-16 rounded-md' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* QR Code Skeleton */}
        <div className='border flex-grow border-primaryGrey p-3 rounded-xl'>
          <div className='flex items-center gap-1'>
            <Skeleton className='h-2 w-2 rounded-full ' />
            <Skeleton className='h-6 w-24 rounded-md' />
          </div>
          <div className='p-3'>
            <Skeleton className='h-[28px] w-20 mb-4 rounded-md' />
            <Skeleton className='w-full h-[300px] rounded-md' />
          </div>
        </div>
      </article>
    </section>
  );
};

export default SkeletonLoaderModules;
