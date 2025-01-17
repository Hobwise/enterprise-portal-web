'use client';

import { useParams, useRouter } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import { options } from '@/app/dashboard/settings/kyc-compliance/verification-types';

import PersonalVerificationForm from '@/app/dashboard/settings/kyc-compliance/[slug]/components/personal-verification-form';
import BusinessVerificationForm from '@/app/dashboard/settings/kyc-compliance/[slug]/components/business-verification-form';

const Page = () => {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.slug);

  const verificationType = options.find((option) => option.id === id);

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <IoIosArrowBack
          className="text-[#282828] mt-1 cursor-pointer"
          onClick={() => router.back()}
        />{' '}
        <div>
          <h2 className="font-semibold text-[#101928]">
            {verificationType?.title}
          </h2>
          <p className="text-sm text-[#667185]">
            {verificationType?.description}
          </p>
        </div>
      </div>
      {id === 1 ? <PersonalVerificationForm /> : <BusinessVerificationForm />}
    </div>
  );
};

export default Page;
