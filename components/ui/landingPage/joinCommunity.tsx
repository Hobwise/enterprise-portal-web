'use client';
import { AddToWaitingList } from '@/app/api/controllers/landingPage';
import { CustomButton } from '@/components/customButton';
import { cn, notify, validateEmail } from '@/lib/utils';
import PricePlan from '@/public/assets/images/price-bg.png';
import ReportsImage from '@/public/assets/images/reports-image.png';
import { StarIcon } from '@/public/assets/svg';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Transition } from './transition';

export default function JoinCommunity({ className }: { className?: string }) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!userEmail || !validateEmail(userEmail)) {
      setError('Please enter a valid email address.');
    } else {
      setIsLoading(true);
      const data: any = await AddToWaitingList({
        email: userEmail,
        name: 'Waitlist',
      });

      setIsLoading(false);

      if (data?.data?.isSuccessful) {
        setUserEmail('');
        toast.success("You've successfully added to our waitlist");
      } else if (data?.data?.error) {
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
      }
    }
  };
  return (
    <section
      className={cn(
        'bg-[#5F35D2] shadow-custom_shadow_2 pt-8 lg:pt-16 font-satoshi space-y-6 lg:space-y-12 px-6 lg:px-12 relative mt-6 lg:mt-12',
        className
      )}
    >
      <Image
        src={PricePlan}
        alt=''
        className='absolute top-[20%] h-[500px] w-[90%]'
        priority
      />
      <Transition>
        <div className='flex items-center w-fit space-x-2 text-white bg-[#9F7CFE] border-[#DCE4E8] shadow-custom_shadow_2 border px-4 py-1.5 rounded-full text-xs mx-auto'>
          <StarIcon />
          <p className='font-normal'>Get Started</p>
        </div>
        <div className='lg:w-[45%] mx-auto mt-2.5 lg:mt-0'>
          <h2 className='text-[30px] lg:text-[40px] lg:leading-[54px] font-bricolage_grotesque text-white'>
            Join Our Community of Hospitality Innovators
          </h2>
          <p className='text-[#DCE4E8]'>
            Come be a part of a warm and supportive network of restaurant,
            hotel, and bar owners who are simplifying their day-to-day with
            Hobwise. Share your experiences, exchange valuable tips, stay in the
            loop with the latest industry trends, and watch your business
            flourish.
          </p>
        </div>
      </Transition>

      <Transition>
        <div>
          <form onSubmit={handleSubmit} autoComplete='off'>
            <div className='lg:w-[35%] mx-auto flex items-center space-x-2 lg:space-x-4 mb-10 lg:mb-20'>
              <div className='space-y-1 w-full z-50 h-[42px]'>
                <input
                  type='email'
                  placeholder='Input your email'
                  value={userEmail}
                  onChange={({ target }) => {
                    setError('');
                    setUserEmail(target.value);
                  }}
                  className='border border-white bg-[#FFFFFF1A] py-2 px-4 h-10 w-[100%] text-white rounded-lg placeholder:text-[#DCE4E8] placeholder:text-sm'
                  name='email'
                  id='email'
                />
                {error && (
                  <div className='text-[#F25202] text-sm text-left flex justify-between'>
                    <p>{error}</p>
                    <p
                      className='pr-4  text-white cursor-pointer text-center'
                      onClick={() => setError('')}
                    >
                      x
                    </p>
                  </div>
                )}
              </div>
              <CustomButton
                className='bg-white'
                loading={isLoading}
                disabled={isLoading}
              >
                Submit
              </CustomButton>
            </div>
          </form>
        </div>
      </Transition>
      <Image src={ReportsImage} alt='reports' />
    </section>
  );
}
