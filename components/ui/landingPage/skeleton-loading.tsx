'use client';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

export default function PricingLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="border border-[#44444A] bg-white p-8 rounded-[10px] space-y-3 w-full min-h-[850px]" />
      <Skeleton className="border border-[#FFFFFF61] bg-[#FFFFFF1A] p-8 rounded-[10px] space-y-8 w-full min-h-[850px]" />
      <Skeleton className="border border-[#44444A] bg-white p-8 rounded-[10px] space-y-8 w-full min-h-[850px]" />
    </div>
  );
}

export function PricingExtentededLoading() {
  return (
    <div className="border border-white bg-white rounded-r-xl rounded-l-xl font-satoshi">
      <div className="grid grid-cols-3 lg:grid-cols-4 bg-[#3A159F] py-4 px-4 gap-6 lg:gap-8 rounded-tr-xl rounded-tl-xl">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-4 py-10 px-4 gap-8 border-b border-b-[#E5E5E5]">
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-[80%]" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-4 bg-[#3A159F] py-4 px-4 gap-6 lg:gap-8 rounded-br-xl rounded-bl-xl">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

export function LoadingReservations() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 px-6 lg:px-24 py-6 lg:py-16">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}
