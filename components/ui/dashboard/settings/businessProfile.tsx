'use client';

import { CustomButton } from '@/components/customButton';
import useGetBusiness from '@/hooks/cachedEndpoints/useGetBusiness';
import { useGlobalContext } from '@/hooks/globalProvider';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Avatar, Divider } from '@nextui-org/react';
import { useCallback, useState } from 'react';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { TbCopy, TbEdit } from 'react-icons/tb';

const BusinessProfile = ({ setActiveScreen }: any) => {
  const { data, isLoading } = useGetBusiness();
  const { setBusinessProfileNavigate } = useGlobalContext();

  const businessInformation = getJsonItemFromLocalStorage('business') || [];

  const Details = ({ text1, text2 }: { text1: string; text2: any }) => {
    const [changeIcon, setChangeIcon] = useState(false);
    const copyToClipboard = useCallback(async () => {
      await navigator.clipboard.writeText(text2);
      setChangeIcon(true);
      setTimeout(() => {
        setChangeIcon(false);
      }, 2000);
    }, [text2]);
    return (
      <div className='flex justify-between text-black items-center py-4'>
        <div>
          <p className='text-xs font-[400] text-grey500'>{text1}</p>
          <p className='text-sm font-[500]'>{text2}</p>
        </div>
        <div>
          {changeIcon ? (
            <IoCheckmarkOutline className='text-[20px] cursor-pointer text-grey400' />
          ) : (
            <TbCopy
              onClick={copyToClipboard}
              className='text-[20px] cursor-pointer text-grey400'
            />
          )}
        </div>
      </div>
    );
  };

  const businessCategories = () => {
    if (data?.businessCategory === 0) {
      return 'Business center';
    } else if (data?.businessCategory === 1) {
      return 'Logistics';
    } else if (data?.businessCategory === 2) {
      return 'Bar';
    } else if (data?.businessCategory === 3) {
      return 'Restaurant';
    } else if (data?.businessCategory === 4) {
      return 'Club';
    } else if (data?.businessCategory === 5) {
      return 'Cafe';
    } else if (data?.businessCategory === 6) {
      return 'Hotel';
    }
  };
  return (
    <section>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start'>
        <div>
          <h1 className='text-[16px] leading-8 font-semibold'>
            Business profile
          </h1>
          <p className='text-sm  text-grey600 md:mb-10 mb-4'>
            Update your business profile
          </p>
        </div>
        <CustomButton
          onClick={() => {
            setBusinessProfileNavigate(0);
            setActiveScreen(4);
          }}
          className='py-2 px-4 md:mb-0 mb-4 text-white'
          backgroundColor='bg-primaryColor'
        >
          <div className='flex gap-1 items-center justify-center'>
            <span>
              <TbEdit className='text-[18px]' />
            </span>
            <span> Update</span>
          </div>
        </CustomButton>
      </div>
      <article className='bg-white border border-[#F0F2F5] rounded-lg p-3 md:p-6 mb-6'>
        <div className='flex gap-3 items-center text-black mb-4'>
          <Avatar
            size='md'
            showFallback={true}
            src={`data:image/jpeg;base64,${data?.logoImage}`}
            name={businessInformation[0]?.businessName}
          />
          <div className='flex flex-col'>
            <span className='font-[600] text-[20px]'>
              {businessInformation[0]?.businessName}
            </span>

            <span className='text-grey500 text-sm'>
              {businessInformation[0]?.contactEmailAddress}
            </span>
          </div>
        </div>
        <Divider />
        <Details
          text1='Address'
          text2={`${data?.address} ${data?.city} ${data?.state}`}
        />
        <Divider className='bg-[#F0F2F5]' />
        <Details text1='Category' text2={businessCategories()} />
        <Divider className='bg-[#F0F2F5]' />
        <Details
          text1='CAC Registration Number'
          text2={data?.resistrationNumber}
        />
        <Divider className='bg-[#F0F2F5]' />
        <Details text1='NIN' text2={data?.nin} />
      </article>
      <article className='bg-white border border-[#F0F2F5] rounded-lg px-3 md:px-6 py-2 mb-6'>
        <Details
          text1='Primary brand colour'
          text2={data?.primaryBrandColour}
        />
        <Divider className='bg-[#F0F2F5]' />
        <Details
          text1='Secondary brand colour'
          text2={data?.secondaryBrandColour}
        />
      </article>
      <article className='bg-white border border-[#F0F2F5] rounded-lg px-3 md:px-6 py-2 mb-6'>
        <div className='flex justify-between text-black items-center py-4'>
          <div>
            <p className='font-[600] '>Service Terms and Conditions</p>
            <p className='text-sm font-[400] text-grey500'>
              Your terms and conditions for your services
            </p>
          </div>
          <div>
            <CustomButton
              onClick={() => {
                setActiveScreen(4);
                setBusinessProfileNavigate(2);
              }}
              className=' text-black bg-transparent border rounded-lg border-grey500'
            >
              View
            </CustomButton>
          </div>
        </div>
      </article>
      <article className='bg-white border border-[#F0F2F5] rounded-lg px-3 md:px-6 py-2 mb-6'>
        <div className='flex justify-between text-black items-center py-4'>
          <div>
            <p className='font-[600] '>Email Templates</p>
            <p className='text-sm font-[400] text-grey500'>
              Customize emails that your customers receive
            </p>
          </div>
          <div>
            <CustomButton
              onClick={() => {
                setActiveScreen(4);
                setBusinessProfileNavigate(1);
              }}
              className=' text-black bg-transparent border rounded-lg border-grey500'
            >
              View
            </CustomButton>
          </div>
        </div>
      </article>
    </section>
  );
};

export default BusinessProfile;
