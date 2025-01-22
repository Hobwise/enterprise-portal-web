"use client";
import { CustomButton } from "@/components/customButton";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";
import { useRouter } from "next/router";
import { CiLock } from "react-icons/ci";
import { IoReload } from "react-icons/io5";

export default function Unauthorized() {
  const { refetch, isLoading } = useSubscription();

  return (
    <div className="flex items-center justify-center min-h-[400px]   p-4">
      <div className="flex flex-col items-center text-center space-y-6 pt-6 max-w-lg w-full">
        <div className="rounded-full bg-orange-100 p-3">
          <CiLock className="h-6 w-6 text-orange-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription Access Unavailable
          </h2>
          <p className="text-gray-600">
            We're unable to retrieve your subscription information at this time.
            Please try again later or contact support.
          </p>
        </div>
        <CustomButton
          onClick={async () => {
            await refetch();
            window.location.reload();
          }}
          className="text-white border px-6 py-4 bg-primaryColor rounded-lg "
        >
          <div className="flex items-center gap-2">
            <p>Retry</p>
            <IoReload className={`${isLoading && "animate-spin"}`} />
          </div>
        </CustomButton>
      </div>
    </div>
  );
}
