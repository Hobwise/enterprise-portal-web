import BackButton from '@/components/backButton';
import SelectBusinessForm from '@/components/ui/auth/selectBusinessForm';
import { companyInfo } from '@/lib/companyInfo';

export const metadata = {
  title: `${companyInfo.name} | Select business`,
  description: 'Streamline your business processes',
};

const SelectBusiness = () => {
  return (
    <main className='min-h-screen md:py-24 py-6 px-4 flex flex-col  items-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] bg-pink200'>
      <div className='w-full max-w-[556px] mb-2'>
        <BackButton url='/auth/login' />
      </div>
      <section className='md:w-[556px] w-full bg-white  text-black lg:p-12 px-5 py-8 sm:px-8 sm:py-10 md:py-12 md:rounded-2xl rounded-lg'>
        <h2 className='text-2xl sm:text-[28px] w-full  leading-8 mb-2 text-center font-bold '>
          Select a business
        </h2>
        <p className='text-sm w-full  text-center text-grey600 mb-8 md:mb-10'>
          Select a business to proceed to dashboard
        </p>

        <SelectBusinessForm />
      </section>
    </main>
  );
};

export default SelectBusiness;
