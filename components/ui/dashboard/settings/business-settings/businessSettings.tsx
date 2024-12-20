import { CustomButton } from '@/components/customButton';
import { cn } from '@/lib/utils';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { PiWarningCircleFill } from 'react-icons/pi';
import { RiArrowRightSLine } from 'react-icons/ri';
import { VscRefresh } from 'react-icons/vsc';

const options = [
  {
    id: 1,
    name: 'Personal Verification',
    description: 'Fill your personal information',
    status: 'Not Submitted',
  },
  {
    id: 2,
    name: 'Business Verification',
    description: 'Fill your business information',
    status: 'approved',
  },
];

const BusinessSettings = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-[#101928]">KYC Compliance</h2>
        <p className="text-sm text-[#667185]">Update your KYC details here. </p>
      </div>
      <div className="space-y-4">
        {options.map((option) => (
          <div
            key={option.name}
            className="w-[400px] min-h-[130px] border border-secondaryGrey rounded-[10px] px-4 py-6 cursor-pointer"
          >
            <div className="flex justify-between">
              <div className="space-y-3">
                <p className="font-medium text-sm text-[#101928]">
                  {option.name}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessSettings;
