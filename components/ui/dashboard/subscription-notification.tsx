'use client';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { LuShieldAlert } from 'react-icons/lu';

import { CustomButton } from '@/components/customButton';
import { CiWarning } from 'react-icons/ci';

export const NavigationBanner = ({
  title,
  desc,
}: {
  title: string;
  desc?: string | React.ReactNode;
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const info = getJsonItemFromLocalStorage('userInformation');
    setUserInfo(info);
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div className='relative mx-auto flex flex-col items-start gap-3 bg-amber-50 border border-amber-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex w-full items-start gap-3 sm:w-auto sm:min-w-0 sm:flex-1 sm:items-center'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl font-medium text-amber-900 shadow-lg'>
          <LuShieldAlert />
        </div>
        <div className='flex min-w-0 flex-col'>
          <span className='text-sm font-medium text-amber-800 sm:text-base'>{title}</span>
          <div className='text-sm leading-snug text-amber-600 sm:text-base'>{desc}</div>
        </div>
      </div>
      <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end'>
        {userInfo?.isOwner && (
          <Button
            onClick={() => router.push('/dashboard/settings/subscriptions')}
            className='relative group shrink-0 whitespace-nowrap bg-[#D7A913] px-5 py-1.5 text-sm font-medium text-white rounded-md'
          >
            Upgrade
          </Button>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className='text-amber-600 shrink-0 transition-colors'
          aria-label='Close banner'
        >
          <IoClose size={24} />
        </button>
      </div>
    </div>
  );
};

interface CheckExpiryResult {
  message: string;
  showBanner: boolean;
}

export const useCheckExpiry = (
  nextPaymentDate: string,
  daysThreshold: number
): CheckExpiryResult => {
  const [message, setMessage] = useState<string>('');
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateMessage = () => {
      const now = moment();
      const dueMoment = moment(nextPaymentDate);
      const daysUntilDue = dueMoment.diff(now, 'days');

      if (daysUntilDue <= daysThreshold && dueMoment.isAfter(now)) {
        setShowBanner(true);

        if (daysUntilDue > 1) {
          setMessage(`in ${daysUntilDue} days`);
        } else if (daysUntilDue === 1) {
          setMessage('tomorrow');
        } else {
          const hoursUntilDue = dueMoment.diff(now, 'hours');
          if (hoursUntilDue > 0) {
            setMessage(`today (in ${hoursUntilDue} hours)`);
          } else {
            setMessage('today');
          }
        }
      } else {
        setShowBanner(false);
      }
    };

    updateMessage();
    const interval = setInterval(updateMessage, 86400000);
    return () => clearInterval(interval);
  }, [nextPaymentDate, daysThreshold, mounted]);

  return { message, showBanner };
};

export const SubscriptionNoticePopup = () => {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const data = getJsonItemFromLocalStorage('userInformation');
    setUserData(data);
  }, []);

  const { message, showBanner } = useCheckExpiry(
    userData?.subscription?.nextPaymentDate,
    2
  );

  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (
      mounted &&
      userData?.subscription?.onTrialVersion === false &&
      userData?.subscription?.isActive === true &&
      showBanner
    ) {
      onOpen();
    }
  }, [showBanner, userData, mounted]);

  if (!mounted) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className='text-black md:p-10 p-6 sm:p-8 space-y-4'>
              <div className='w-full grid place-content-center'>
                <div className='bg-[#ffebca] h-[60px] grid place-content-center rounded-full  w-[60px]'>
                  <CiWarning className='text-[#F4B23E] font-3xl text-[35px]' />
                </div>
              </div>
              <div>
                <p className='font-bold text text-lg sm:text-[20px] mb-2 text-center'>
                  Subscription Expiry Notice!
                </p>
                <div className='flex justify-center items-center'>
                  <p className='text-sm text-grey500 text-center md:w-[90%] w-[100%]'>
                    Your subscription will expire{' '}
                    <span className='font-bold'>{message}</span>.{' '}
                    {userData?.role === 1
                      ? 'Contact your management'
                      : 'Renew now to avoid service interruption'}
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                {userData?.isOwner && (
                  <CustomButton
                    className='h-[50px]  text-white'
                    onClick={() => {
                      onOpenChange();
                      router.push('/dashboard/settings/subscriptions');
                    }}
                    type='submit'
                  >
                    Go to subscription
                  </CustomButton>
                )}
                <CustomButton
                  className='h-[50px]  text-black bg-transparent border rounded-lg border-primaryGrey'
                  onClick={onOpenChange}
                  type='submit'
                >
                  Skip Now
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
