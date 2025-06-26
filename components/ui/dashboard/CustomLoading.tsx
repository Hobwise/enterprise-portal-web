"use client";
import { Skeleton } from '@nextui-org/react';


export const CustomLoading = ({ismenuPage}:any) => {
  return (
    <div className="w-full h-full flex flex-col bg-white z-50">
      {/* Header Section */}
      <div className="p-6 border-b">
       

        {/* Title and controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Search bar */}
      </div>

      {/* Navigation Tabs */}
{
    ismenuPage && (
        <div className="px-6 py-4 border-b">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-8 w-12" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
          <div className="flex gap-2 ml-auto">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
    )
}
      {/* Menu Items */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border  bg-gray-200 rounded-lg animate-pulse flex-shrink-0">
              {/* Food image skeleton */}
              <Skeleton className="w-16 h-16 flex-shrink-0 rounded-lg" />
                          </div>
          ))}
        </div>
      </div>
    </div>
  );
};