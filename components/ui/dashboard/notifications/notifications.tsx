'use client';
import {
  postMarkAllAsRead,
  postMarkAsRead,
} from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Avatar, Divider } from '@nextui-org/react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';

const Notifications = ({
  loadMore,
  isLoading,
  isError,
  notifData = { notifications: [], hasNext: false },
  refetch,
}: any) => {
  const business = getJsonItemFromLocalStorage('business');
  const router = useRouter();

  const [expandedMessages, setExpandedMessages] = useState<string[]>([]);

  const markAsRead = async (id: string) => {
    await postMarkAsRead(id);
    refetch();
  };

  const markAsAllRead = async () => {
    await postMarkAllAsRead(business[0].businessId);
    refetch();
    setExpandedMessages([]);
  };

  const toggleReadMore = (id: string) => {
    if (expandedMessages.includes(id)) {
      setExpandedMessages((prev) => prev.filter((msgId) => msgId !== id));
    } else {
      // First expand the message
      setExpandedMessages((prev) => [...prev, id]);
      // Then mark as read without causing a rerender
      const notif = notifData?.notifications?.find((notif: any) => notif.id === id);
      if (notif && !notif.isRead) {
        markAsRead(id);
      }
    }
  };

  const getRelativeTime = (dateTime: string) => {
    const now = moment();
    const diffInSeconds = now.diff(moment(dateTime), 'seconds');
    const diffInMinutes = now.diff(moment(dateTime), 'minutes');
    const diffInHours = now.diff(moment(dateTime), 'hours');

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    if (diffInHours < 24) {
      return `${diffInHours}hr${diffInHours > 1 ? 's' : ''}`;
    }
    return moment(dateTime)
      .fromNow(true)
      .replace('minutes', 'm')
      .replace('minute', 'm')
      .replace('hours', 'hrs')
      .replace('an hour', '1hr')
      .replace('hour', 'hr')
      .replace('days', 'd')
      .replace('day', 'd')
      .replace(/\s/g, '');
  };

  const truncateMessage = (
    message: string,
    isExpanded: boolean,
    isRead: boolean
  ) => {
    if (isRead || isExpanded) return message;
    return message.length > 50 ? `${message.slice(0, 50)}...` : message;
  };

  if (!notifData?.notifications) return null;

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
        {notifData?.notifications?.map((notif: any) => {
          const backgroundColorClass = !notif.isRead
            ? 'bg-[#EAE5FF]'
            : 'bg-white';

          const isExpanded = expandedMessages.includes(notif.id);

          return (
            <div key={notif.id}>
              <div
                className={`${backgroundColorClass} flex gap-3 cursor-pointer rounded-md  p-3 text-xs`}
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
                  <div className='flex justify-between'>
                    <span className='font-[600]'>{notif.eventType}</span>
                    <span className='flex items-center gap-1 text-grey500'>
                      <MdAccessTime className='text-xs ' />
                      <span className='text-xs '>
                        {getRelativeTime(notif.dateUpdated)}
                      </span>
                    </span>
                  </div>
                  <span className='flex justify-center '>
                    <span className='border-l-3 border-primaryGrey h-4 pr-2' />
                    <div className='text-grey500 '>
                      <span>
                        {truncateMessage(
                          notif.message,
                          isExpanded,
                          notif.isRead
                        )}{' '}
                        {!notif.isRead && !isExpanded && (
                          <span
                            onClick={() => toggleReadMore(notif.id)}
                            className='text-primaryColor cursor-pointer text-xs'
                          >
                            {'Read more'}
                          </span>
                        )}
                      </span>
                    </div>
                  </span>
                </div>
              </div>
              <Divider className='my-2 bg-primaryGrey' />
            </div>
          );
        })}
        {notifData?.hasNext && (
          <div className='flex justify-center text-sm'>
            <p
              onClick={loadMore}
              className='text-primaryColor text-xs cursor-pointer'
            >
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
