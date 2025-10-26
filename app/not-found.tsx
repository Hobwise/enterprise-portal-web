'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getJsonItemFromLocalStorage } from '@/lib/utils';

export default function NotFound() {
  const router = useRouter();
  const [homeRoute, setHomeRoute] = useState('/dashboard');

  useEffect(() => {
    // Determine the user's home route based on their role
    const userInformation = getJsonItemFromLocalStorage('userInformation');

    if (userInformation) {
      const isPOSUser = userInformation.primaryAssignment === "Point of Sales" ||
                       userInformation.primaryAssignment === "POS Operator" ||
                       (userInformation.assignedCategoryId && userInformation.assignedCategoryId === "POS");

      const isCategoryUser = userInformation.role === 1 &&
                            userInformation.staffType === 2 &&
                            userInformation.assignedCategoryId &&
                            userInformation.assignedCategoryId !== "" &&
                            userInformation.assignedCategoryId !== "POS";

      if (isPOSUser) {
        setHomeRoute('/pos');
      } else if (isCategoryUser) {
        setHomeRoute('/business-activities');
      } else {
        setHomeRoute('/dashboard');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-[150px] font-bold text-gray-200 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-32 h-32 text-primaryColor"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Sorry, the page you're looking for doesn't exist or you don't have permission to access it.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-primaryColor text-primaryColor rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push(homeRoute)}
            className="px-6 py-3 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors font-medium shadow-md"
          >
            Go to Home
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
