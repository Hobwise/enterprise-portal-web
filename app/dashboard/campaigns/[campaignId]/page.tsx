'use client';
import Container from '@/components/dashboardContainer';
import Error from '@/components/error';
import useSingleCampaign from '@/hooks/cachedEndpoints/useSingleCampaign';
import { CustomLoading } from '@/lib/utils';
import { Button } from '@nextui-org/react';
import moment from 'moment';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoIosArrowRoundBack } from 'react-icons/io';
import noImage from '../../../../public/assets/images/no-image.svg';

const PreviewCampaign = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get('campaignId') || null;
  const { data, isLoading, isError, refetch } = useSingleCampaign(campaignId);

  if (isError) {
    return (
      <Container>
        <Error onClick={() => refetch()} />
      </Container>
    );
  }
  if (isLoading) {
    return (
      <Container>
        <CustomLoading />
      </Container>
    );
  }
  return (
    <Container>
      <div className='flex flex-col min-h-[700px] h-[85vh]'>
        <div className='flex-grow-0 flex justify-between'>
          <div>
            <h1 className='font-[600] text-2xl'>Preview campaign</h1>
            <p className='font-[400] text-sm text-[#667185]'>
              See how your campaign will appear to users
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            className='flex text-grey600 bg-white'
          >
            <IoIosArrowRoundBack className='text-[22px]' />

            <p>Go back</p>
          </Button>
        </div>
        <section className='mt-6 pt-10 flex-grow bg-[#F9F8FF] overflow-scroll rounded-xl flex justify-center items-center'>
          <div className='xl:block relative  p-4 overflow-scroll hidden w-[320px] border-[8px]  border-black rounded-[40px] h-full shadow-lg'>
            <Image
              className='h-[144px] w-full bg-cover rounded-lg'
              width={120}
              height={144}
              alt='campaign'
              aria-label='campaign'
              src={
                data?.image ? `data:image/jpeg;base64,${data?.image}` : noImage
              }
            />

            <h3 className='mt-5 text-black font-bold text-sm'>
              {data?.campaignName}
            </h3>
            <p className='mt-1 text-[#3D424A] text-sm'>
              {' '}
              {data?.campaignDescription}
            </p>
            <h3 className='mt-5 text-black font-bold text-sm'>FROM</h3>
            <p className='mt-1 text-[#3D424A] text-sm font-[400]'>
              {' '}
              {data?.startDateTime
                ? moment(data?.startDateTime).format('MMMM Do YYYY, h:mm:ss a')
                : ''}
            </p>
            <h3 className='mt-5 text-black font-bold text-sm'>To</h3>
            <p className='mt-1 text-[#3D424A] text-sm font-[400]'>
              {' '}
              {data?.endDateTime
                ? moment(data?.endDateTime).format('MMMM Do YYYY, h:mm:ss a')
                : ''}
            </p>
            <h3 className='mt-5 text-black font-bold text-sm'>DRESS CODE</h3>
            <p className='mt-1 text-[#3D424A] text-sm font-[400]'>
              {' '}
              {data?.dressCode}
            </p>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default PreviewCampaign;
