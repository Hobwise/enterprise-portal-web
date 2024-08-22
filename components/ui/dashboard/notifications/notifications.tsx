'use client';
import {
  postMarkAllAsRead,
  postMarkAsRead,
} from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Avatar, Divider } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';

const Notifications = ({
  loadMore,
  isLoading,
  isError,
  notifData,
  refetch,
  refetchCount,
}: any) => {
  const business = getJsonItemFromLocalStorage('business');
  const router = useRouter();

  const markAsRead = async (id: string) => {
    await postMarkAsRead(id);
    refetch();
    refetchCount();
  };
  const markAsAllRead = async () => {
    await postMarkAllAsRead(business[0].businessId);
    refetch();
    refetchCount();
  };

  const buttonText = (eventType: string) => {
    const lowerCaseEventType = eventType.toLowerCase();
    if (lowerCaseEventType.includes('order')) {
      return 'View order';
    } else if (lowerCaseEventType.includes('booking')) {
      return 'View booking';
    } else if (lowerCaseEventType.includes('reservation')) {
      return 'View reservation';
    } else if (lowerCaseEventType.includes('campaign')) {
      return 'View campaign';
    }
    return 'View';
  };
  const navigateToPage = (eventType: string) => {
    let page = '';

    if (eventType.toLowerCase().includes('order')) {
      page = '/dashboard/orders';
    } else if (eventType.toLowerCase().includes('booking')) {
      page = 'dashboard/bookings';
    } else if (eventType.toLowerCase().includes('reservation')) {
      page = '/dashboard/reservation';
    } else if (eventType.toLowerCase().includes('campaign')) {
      page = '/dashboard/campaigns';
    }

    if (page) {
      router.push(page);
    }
  };

  return (
    <article className='md:w-[400px] w-full flex flex-col justify-start text-black p-3'>
      <div className='flex justify-between items-center'>
        <h1 className='mb-3 font-[600] text-lg'>Notifications</h1>
        <div
          onClick={() => markAsAllRead()}
          className='flex gap-1 cursor-pointer'
        >
          <IoCheckmarkDoneOutline className='text-success-500' />
          <p className='text-xs text-grey500'>Mark all as read</p>
        </div>
      </div>
      <div className='max-h-[450px] overflow-scroll'>
        {notifData.notifications?.map((notif: any) => {
          const backgroundColorClass = !notif.isRead
            ? 'bg-[#EAE5FF]'
            : 'bg-white';
          return (
            <div key={notif.id}>
              <div
                className={`${backgroundColorClass} flex gap-3 cursor-pointer rounded-sm  p-3 text-xs`}
              >
                <div>
                  <Avatar
                    isBordered
                    classNames={{
                      base: 'bg-[#EAE5FF] text-black',
                    }}
                    size='md'
                    showFallback={true}
                    name={notif.eventType}
                  />
                </div>
                <div className='flex justify-center flex-col space-y-1'>
                  <span className='font-[600]'>{notif.eventType}</span>
                  <span className='flex justify-center '>
                    <span className='border-l-3 border-primaryGrey h-4 pr-2' />
                    <span className='text-grey500'>{notif.message}</span>
                  </span>
                  <div className='mt-1 ml-2'>
                    <button
                      onClick={() => {
                        navigateToPage(notif.eventType);
                        markAsRead(notif.id);
                      }}
                      className='bg-secondaryColor outline-none border-none text-white text-xs p-2 rounded-md '
                    >
                      {buttonText(notif.eventType)}
                    </button>
                  </div>
                </div>
              </div>
              <Divider className='my-2 bg-primaryGrey' />
            </div>
          );
        })}
        {notifData.hasNext && (
          <div className='flex justify-center text-sm'>
            <p onClick={loadMore} className='text-primaryColor cursor-pointer'>
              {isLoading ? 'Loading...' : 'Load More'}
            </p>
            {isError && (
              <p className='text-danger-500'>
                Failed to load more notifications
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default Notifications;
