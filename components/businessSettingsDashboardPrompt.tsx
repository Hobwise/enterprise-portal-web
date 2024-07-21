'use client';
import { getJsonItemFromLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const Msg = () => {
  const router = useRouter();
  return (
    <div>
      <p className='font-bold text-[17px] pb-1'>Complete your profile!</p>
      <div>
        <span
          onClick={() => {
            saveToLocalStorage('businessSettingPrompt', true);
            router.push('/dashboard/settings');
          }}
          className='text-primaryColor font-[500]'
        >
          Click here
        </span>{' '}
        to access profile settings and update your business information.
      </div>
    </div>
  );
};
const BusinessSettingsDashboardPrompt = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  useEffect(() => {
    if (businessInformation[0]?.primaryColor === '') {
      toast.warning(<Msg />, {
        position: 'bottom-right',
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        autoClose: false,
        progress: undefined,
      });
    }
  }, []);
  return null;
};

export default BusinessSettingsDashboardPrompt;
