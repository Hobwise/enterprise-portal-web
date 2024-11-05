import BackButton from '@/components/backButton';
import CompanyLogo from '@/components/logo';
import ConfirmEmailForm from '@/components/ui/auth/confirmEmailForm';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { companyInfo } from '../../../lib/companyInfo';
import confirmEmailLogo from '../../../public/assets/images/confirmEmailImage.png';

export const metadata = {
  title: `${companyInfo.name} | Confirm your email`,
  description: 'Streamline your business processes',
};
const ConfirmEmail = () => {
  return (
    <main className='min-h-screen  md:p-0 py-4 px-4 flex flex-col md:justify-center justify-start items-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] bg-pink200'>
      <div className='absolute top-0 left-0'>
        <BackButton url='/auth/signup' />
      </div>
      <CompanyLogo />
      <section className='md:w-[464px] w-full bg-white text-black lg:p-7 py-12 px-6  md:rounded-2xl rounded-lg'>
        <div className='grid place-content-center'>
          <Image src={confirmEmailLogo} alt='confirm email logo' />
        </div>
        <Spacer y={6} />
        <h2 className='text-[28px]  leading-8 mb-2 text-center font-bold '>
          Confirm your email address
        </h2>

        <ConfirmEmailForm />
      </section>
    </main>
  );
};

export default ConfirmEmail;
