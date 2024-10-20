import CompanyLogo from '@/components/logo';

import BackButton from '@/components/backButton';
import SelectBusinessForm from '@/components/ui/auth/selectBusinessForm';
import { companyInfo } from '@/lib/companyInfo';

export const metadata = {
  title: `${companyInfo.name} | Select business`,
  description: 'Streamline your business processes',
};

const SelectBusiness = () => {
  return (
    <main className='min-h-screen  md:py-24 py-4 px-4 flex flex-col  items-center bg-pink200'>
      <div className='absolute top-0 left-0'>
        <BackButton url='/auth/login' />
      </div>
      <CompanyLogo />
      <section className='md:w-[556px] w-full bg-white  text-black lg:p-12 py-12 px-6  md:rounded-2xl rounded-lg'>
        <h2 className='text-[28px] w-full  leading-8 mb-2 text-center font-bold '>
          Select a business
        </h2>
        <p className='text-sm w-full  text-center text-grey600 mb-10'>
          Select a business to proceed to dashboard
        </p>

        <SelectBusinessForm />
      </section>
    </main>
  );
};

export default SelectBusiness;
