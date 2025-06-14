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
  desc: string | React.ReactNode;
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
    <div className='bg-amber-50 border border-amber-100 px-4 py-3 flex items-center gap-3 justify-between mx-auto relative'>
      <div className='flex items-center space-x-3'>
        <div className='w-10 h-10  rounded-full shadow-lg flex items-center justify-center text-amber-900 text-2xl font-medium'>
          <LuShieldAlert />
        </div>
        <div className='flex flex-col'>
          <span className='text-amber-800 font-medium'>{title}</span>
          <div className='text-amber-600'>{desc}</div>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        {userInfo?.isOwner && (
          <Button
            onClick={() => router.push('/dashboard/settings/subscriptions')}
            className='px-6 py-1.5 rounded-md text-sm font-medium bg-[#D7A913] text-white relative group'
          >
            Upgrade
          </Button>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className='text-amber-600  transition-colors'
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
            <ModalBody className='text-black md:p-10 p-8 space-y-4'>
              <div className='w-full grid place-content-center'>
                <div className='bg-[#ffebca] h-[60px] grid place-content-center rounded-full  w-[60px]'>
                  <CiWarning className='text-[#F4B23E] font-3xl text-[35px]' />
                </div>
              </div>
              <div>
                <p className='font-bold text text-[20px] mb-2 text-center'>
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
