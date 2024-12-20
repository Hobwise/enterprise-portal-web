import { companyInfo } from '@/lib/companyInfo';
import Image from 'next/image';

const CompanyLogo = ({ containerClass = 'flex gap-2 items-center mb-6', textColor = 'text-black' }: any) => {
  return (
    <div className={containerClass}>
      <Image src={companyInfo.logo} height={150} width={150} style={{ objectFit: 'cover' }} alt="company logo" />
    </div>
  );
};

export default CompanyLogo;
