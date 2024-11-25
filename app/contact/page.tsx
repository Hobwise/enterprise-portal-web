'use client';
import { CustomButton } from '@/components/customButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomTextArea } from '@/components/customTextArea';
import FAQs from '@/components/ui/landingPage/faq';
import Footer from '@/components/ui/landingPage/footer';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import Navbar from '@/components/ui/landingPage/navBar';
import { notify, validateEmail } from '@/lib/utils';
import HobinkLogo from '@/public/assets/icons/hobink-iconpng.png';
import ContactUsBg from '@/public/assets/images/contact-us-bg.png';
import DashboardImage from '@/public/assets/images/dashboard-image-2.png';
import { ContactIcon } from '@/public/assets/svg';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ContactUs } from '../api/controllers/landingPage';

export default function Contact() {
  const defaultErrorValue = { name: '', email: '', message: '' };
  const [contactInfo, setContactInfo] = useState<{
    name: string;
    email: string;
    message: string;
  }>({ name: '', email: '', message: '' });
  const [error, setError] = useState(defaultErrorValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';

  const submitFormData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!contactInfo.name) {
      setError((prev) => ({ ...prev, name: 'Name is compulsory' }));
    }
    if (!contactInfo.email || !validateEmail(contactInfo.email)) {
      setError((prev) => ({
        ...prev,
        email: 'Please enter a valid email address.',
      }));
    }
    if (!contactInfo.message) {
      setError((prev) => ({ ...prev, message: 'Question is compulsory' }));
    }
    if (
      contactInfo.name &&
      contactInfo.email &&
      validateEmail(contactInfo.email) &&
      contactInfo.message
    ) {
      setIsLoading(true);
      const data: any = await ContactUs(contactInfo);

      setIsLoading(false);

      if (data?.data?.isSuccessful) {
        setContactInfo({ name: '', email: '', message: '' });
        toast.success("You're successfully added to our waitlist");
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
    <div className='w-full bg-white'>
      <header className='z-[100] backdrop-filter backdrop-blur-md fixed w-full'>
        <Navbar type='default' />
      </header>
      <main>
        <section className='font-satoshi bg-white w-full pt-32 space-y-12'>
          <div className={sectionHeaderClass}>
            <ContactIcon className='text-[#5F35D2]' />
            <p className='font-normal'>Content</p>
          </div>
          <div className='w-[65%] mx-auto text-center'>
            <h2 className='text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque'>
              Talk to us
            </h2>
          </div>

          <div className='bg-[#5F35D2] rounded-xl relative w-[80%] mx-auto'>
            <Image
              src={ContactUsBg}
              alt=''
              className='absolute top-0'
              priority
            />
            <div className='flex'>
              <Image
                src={DashboardImage}
                alt='Dashboard image'
                className='mx-auto w-[75%] lg:w-[85%] z-50 mt-10 lg:mr-12'
              />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white lg:bg-[#DDD1FF] px-8 py-10 rounded-b-xl'>
              <form autoComplete='off' className=''>
                <CustomInput
                  type='text'
                  name='name'
                  label='What’s your name?'
                  placeholder='yourname'
                  classnames='font-light'
                  value={contactInfo.name}
                  defaultValue=''
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, name: '' }));
                    setContactInfo((prev) => ({ ...prev, name: target.value }));
                  }}
                  errorMessage={error.name}
                />
                <CustomInput
                  type='email'
                  name='email'
                  label='Email Address'
                  placeholder='yourname@gmail.com'
                  defaultValue=''
                  classnames='font-light mt-4'
                  value={contactInfo.email}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, email: '' }));
                    setContactInfo((prev) => ({
                      ...prev,
                      email: target.value,
                    }));
                  }}
                  errorMessage={error.email}
                />
                <CustomTextArea
                  name='question'
                  label='What’s your question?'
                  placeholder='Describe your questions here..'
                  classnames='font-light pt-6'
                  defaultValue=''
                  value={contactInfo.message}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, message: '' }));
                    setContactInfo((prev) => ({
                      ...prev,
                      message: target.value,
                    }));
                  }}
                  errorMessage={error.message}
                />
                <div>
                  <CustomButton
                    className='h-10 w-full text-white -mt-6'
                    type='button'
                    onClick={submitFormData}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Submit
                  </CustomButton>
                </div>
              </form>

              <div className='font-satoshi space-y-8 w-[55%]'>
                <Image
                  src={HobinkLogo}
                  alt='hobwise logo'
                  width={50}
                  height={50}
                />
                <div className='space-y-6'>
                  <h4 className='font-bricolage_grotesque text-[20px] text-[#252525]'>
                    Prefer email?
                  </h4>
                  <a
                    href='mailto: hello@hobwise.com'
                    target='_blank'
                    className='text-primaryColor underline font-medium'
                  >
                    hello@hobwise.com
                  </a>
                </div>
                <div className='space-y-6'>
                  <h4 className='font-bricolage_grotesque text-[20px] text-[#252525]'>
                    Prefer docs?
                  </h4>
                  <p className='text-[#252525]'>
                    Check out our{' '}
                    <span>
                      <a
                        href='#'
                        target='_blank'
                        className='text-primaryColor underline'
                      >
                        documentation
                      </a>
                    </span>
                  </p>
                </div>
                <div className='space-y-6'>
                  <h4 className='font-bricolage_grotesque text-[20px] text-[#252525]'>
                    Office Headquarters
                  </h4>

                  <p className='text-[#252525]'>
                    San Francisco, West Coast Headquarter Suite 3241
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='pt-20'>
          <FAQs />
        </section>

        <JoinCommunity className='text-center' />
      </main>
      <Footer />
    </div>
  );
}
