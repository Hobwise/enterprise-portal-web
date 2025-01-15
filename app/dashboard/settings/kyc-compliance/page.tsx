'use client';

import Link from 'next/link';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { PiWarningCircleFill } from 'react-icons/pi';
import { RiArrowRightSLine } from 'react-icons/ri';
import { VscRefresh } from 'react-icons/vsc';

import { options } from '@/app/dashboard/settings/kyc-compliance/verification-types';
import { cn } from '@/lib/cn';
import { SETTINGS_URL } from '@/utilities/routes';
import useUser from '@/hooks/cachedEndpoints/useUser';
import useGetBusiness from '@/hooks/cachedEndpoints/useGetBusiness';
import Image from 'next/image';

const KycCompliancePage = () => {
  const userQuery = useUser();
  const businessQuery = useGetBusiness();

  //   Function to map isVerified values to status strings
  const mapVerificationStage = (stage: number) => {
    switch (stage) {
      case 0:
        return 'Not Submitted';
      case 1:
        return 'pending';
      case 2:
        return 'approved';
      case 3:
        return 'failed';
      default:
        return 'unknown';
    }
  };

  // Function to determine the status based on user and business data
  const determineStatus = (option: any) => {
    switch (option.id) {
      case 1:
        // Update status based on user data
        return mapVerificationStage(userQuery.data?.verificationStage);
      case 2:
        // Update status based on business data
        return mapVerificationStage(businessQuery.data?.verificationStage);
      default:
        return option.status;
    }
  };

  // Map over options and update status
  const updatedOptions = options.map((option) => ({
    ...option,
    status: determineStatus(option),
  }));

  if (userQuery.isLoading || businessQuery.isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-[#101928]">KYC Compliance</h2>
        <p className="text-sm text-[#667185]">Update your KYC details here. </p>
      </div>
      <div className="flex gap-8">
        <div className="space-y-4">
          {updatedOptions.map((option) => (
            <Link
              href={`${SETTINGS_URL}/kyc-compliance/${option.id}`}
              key={option.title}
              className="block w-[400px] min-h-[130px] border border-secondaryGrey rounded-[10px] px-4 py-6 cursor-pointer"
            >
              <div className="flex justify-between">
                <div className="space-y-3">
                  <p className="font-medium text-sm text-[#101928]">
                    {option.title}
                  </p>
                  <p className="text-sm text-[#AFAFAF]">{option.description}</p>
                  <div
                    className={cn(
                      'flex items-center w-fit gap-2 h-6 p-2 border border-[#E53030] text-[#E53030] text-[10px] rounded-2xl capitalize',
                      option.status === 'approved' &&
                        ' border-[#45773B] text-[#45773B] bg-[#45773B]/10',
                      option.status === 'pending' &&
                        ' border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
                    )}
                  >
                    {option.status === 'approved' ? (
                      <FaCheckCircle />
                    ) : option.status === 'pending' ? (
                      <VscRefresh />
                    ) : (
                      <PiWarningCircleFill />
                    )}
                    <span>{option.status}</span>
                  </div>
                </div>
                <RiArrowRightSLine />
              </div>
            </Link>
          ))}
        </div>
        {userQuery.data?.verficationStage === 2 &&
          userQuery.data?.verificationStage === 2 && (
            <Image
              src="/assets/images/completed-kyc.svg"
              width={300}
              height={290}
              alt="KYC Verification completed"
            />
          )}
      </div>
    </div>
  );
};

export default KycCompliancePage;
