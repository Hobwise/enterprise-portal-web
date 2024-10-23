import BackButton from '@/components/backButton';
import CompanyLogo from '@/components/logo';
import EntryPoint from '@/components/ui/auth/forget-password/EntryPoint';
import { companyInfo } from '../../../lib/companyInfo';

export const metadata = {
  title: `${companyInfo.name} | Create account`,
  description: 'Streamline your business processes',
};
const ForgetPassword = () => {
  return (
    <main className='min-h-screen bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]  bg-pink200 flex flex-col md:justify-center justify-start items-center md:p-0 py-24 px-4 '>
      <CompanyLogo />
      <div className='absolute top-0 left-0'>
        <BackButton color='text-black' url='/auth/login' />
      </div>
      <div className='md:w-[464px] w-full z-10 bg-white text-black lg:p-7 py-12 px-6  md:rounded-2xl rounded-lg'>
        <EntryPoint />
      </div>
    </main>
  );
};

export default ForgetPassword;
