'use client';

import { Avatar, Divider } from '@nextui-org/react';

const Notifications = ({ data }: any) => {
  return (
    <article className='md:w-[400px] w-full  flex flex-col justify-start text-black p-3'>
      <h1 className='mb-3 font-[600] text-lg'>Notifications</h1>
      <div className='max-h-[450px] overflow-scroll'>
        {data?.map((notif: any) => {
          return (
            <div key={notif.id}>
              <div className='flex gap-3 cursor-pointer text-xs'>
                <div>
                  <Avatar
                    classNames={{
                      base: 'bg-[#EAE5FF] text-black',
                    }}
                    size='md'
                    showFallback={true}
                    name={notif.eventType}
                  />
                </div>
                <div className='flex justify-center flex-col'>
                  <span className='font-[600]'>{notif.eventType}</span>
                  <span className='flex justify-center pt-1'>
                    <span className='border-l-3 border-primaryGrey h-4   pr-2' />
                    <span className='text-grey500'>{notif.message}</span>
                  </span>
                </div>
              </div>
              <Divider className='my-3 bg-primaryGrey' />
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default Notifications;
