'use client';

const ModulesOverview = () => {
  return (
    <section className='w-full'>
      <article className='flex md:gap-6 gap-3 xl:flex-row flex-col'>
        <div className='xl:w-[70%] flex flex-col xl:flex-row xl:gap-5 gap-3 w-full'>
          <div className='flex xl:w-[70%] w-full xl:flex-col xl:gap-5 gap-3'>
            <div className='flex   xl:flex-row flex-col xl:gap-5 gap-3'>
              <div className='border border-primaryGrey rounded-xl flex-grow'>
                <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                  <span className='font-[600]'>Payments</span>
                </div>
                <div className='p-3'>page 1</div>
              </div>
              <div className='border flex-grow border-primaryGrey  rounded-xl'>
                <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                  <span className='font-[600]'>Bookings</span>
                </div>
                <div className='p-3'>page 2</div>
              </div>
            </div>
            <div className='border flex-grow border-primaryGrey  rounded-xl'>
              <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                <span className='font-[600]'>Campaigns</span>
              </div>
              <div className='p-3'>page 3</div>
            </div>
          </div>
          <div className='border flex-grow border-primaryGrey  rounded-xl'>
            <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
              <span className='font-[600]'>Best sellers</span>
            </div>
            <div className='p-3'>page 4</div>
          </div>
        </div>
        <div className='border flex-grow border-primaryGrey p-3 rounded-xl'>
          <div className='flex   items-center gap-1  '>
            <div className='h-2 w-2 rounded-full bg-success-800' />
            <span className='font-[600]'>QR Code</span>
          </div>

          <div className='p-3'>page 5</div>
        </div>
      </article>
    </section>
  );
};

export default ModulesOverview;
