import HobinkLogo from '@/components/logo';
import BusinessInformationForm from '@/components/ui/auth/businessInformationForm';
import { Spacer } from '@nextui-org/react';

export const metadata = {
  title: 'Hobink | Provide us your business information',
  description: 'Streamline your business processes',
};

// md:top[-10rem] top-0
const BusinessInformation = () => {
  return (
    <main className='min-h-screen md:p-0 py-4 px-4  bg-pink200'>
      <div className='md:p-10 p-0 pb-4 md:pb-0 md:absolute static md:top[-10rem] top-0'>
        <HobinkLogo />
      </div>
      <section className='md:min-h-screen bg-pink200 min-h-full  w-full  grid md:place-content-center place-content-start'>
        <div className='md:w-[464px] w-full  bg-white text-black lg:p-7 py-12 px-6  md:rounded-2xl rounded-lg'>
          <h2 className='text-[28px] leading-8 font-bold '>
            Tell us about your business
          </h2>
          <Spacer y={8} />
          <BusinessInformationForm />
        </div>
      </section>
    </main>
  );
};

export default BusinessInformation;
