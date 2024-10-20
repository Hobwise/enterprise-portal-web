import { companyInfo } from '@/lib/companyInfo';
import { lexend } from '@/utilities/ui-config/fonts';
import Image from 'next/image';

const CompanyLogo = ({
  containerClass = 'flex gap-2 items-center mb-6',
  textColor = 'text-black',
}: any) => {
  return (
    <div className={containerClass}>
      <Image
        src={companyInfo.logo}
        style={{ objectFit: 'cover' }}
        alt='company logo'
      />
      <h2 className={`text-2xl font-bold ${textColor} ${lexend.className}`}>
        {companyInfo.name}
      </h2>
    </div>
  );
};

export default CompanyLogo;
