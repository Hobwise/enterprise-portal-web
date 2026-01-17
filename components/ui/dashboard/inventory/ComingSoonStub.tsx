'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@nextui-org/react';
import { getJsonItemFromLocalStorage } from '@/lib/utils';

interface ComingSoonStubProps {
  title: string;
  description: string;
}

const ComingSoonStub: React.FC<ComingSoonStubProps> = ({ title, description }) => {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if user is manager (role 0)
    const userInfo = getJsonItemFromLocalStorage('userInformation');
    const role = userInfo?.role;

    if (Number(role) !== 0) {
      router.replace('/dashboard/unauthorized');
      return;
    }

    setHasAccess(true);
  }, [router]);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card shadow="sm" className="p-8 rounded-xl max-w-md text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#EBE8F9] rounded-full flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="#5F35D2"
              />
              <path
                d="M12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z"
                fill="#5F35D2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-500">{description}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#EBE8F9] text-[#5F35D2]">
            Coming Soon
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ComingSoonStub;
