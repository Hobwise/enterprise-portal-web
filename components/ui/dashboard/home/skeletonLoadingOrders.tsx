import { Skeleton } from '@nextui-org/react';

const SkeletonLoaderOrder = () => {
  return (
    <section className='w-full'>
      <article className='flex md:gap-6 gap-3 lg:flex-row flex-col'>
        {/* Overview Section Skeleton */}
        <div className='border border-primaryGrey lg:w-[70%] w-full rounded-xl'>
          <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
            <Skeleton className='h-6 w-24 rounded-md' />
            <Skeleton className='h-8 w-32 rounded-md' />
          </div>
          <div className='p-3'>
            <div className='flex items-end justify-between lg:w-[75%] w-full p-4'>
              {/* Create bars for each day with skeletons */}
              <Skeleton className='h-16 w-6 rounded' />
              <Skeleton className='h-20 w-6 rounded' />
              <Skeleton className='h-24 w-6 rounded' />
              <Skeleton className='h-40 w-6 rounded' />
              <Skeleton className='h-28 w-6 rounded' />
              <Skeleton className='h-10 w-6 rounded' />
              <Skeleton className='h-8 w-6 rounded' />
            </div>
          </div>
        </div>

        {/* Total Amount Processed Skeleton */}
        <div className='flex-grow border bg-gradient-to-r text-white from-[#9747FF] to-[#421CAC] border-primaryGrey rounded-xl'>
          <div className='p-4'>
            <Skeleton className='h-4 w-36 rounded-md' />
            <Skeleton className='h-4 w-40 my-2 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
          </div>
          {/* <div className='lg:mt-10 mt-0 space-y-4 relative bottom-0 p-4 bg-transparent'>
            <Skeleton className='h-4 w-full rounded-md' />
            <Skeleton className='h-4 w-full rounded-md' />
            <Skeleton className='h-4 w-full rounded-md' />
          </div> */}
        </div>
      </article>
    </section>
  );
};

export default SkeletonLoaderOrder;
