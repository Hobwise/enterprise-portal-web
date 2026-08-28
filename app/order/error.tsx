"use client";
import { CustomButton } from "@/components/customButton";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RestaurantBanner from "./RestaurantBanner";
import useMenuConfig from "@/hooks/cachedEndpoints/useMenuConfiguration";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const searchParams = useSearchParams();
  const businessName = searchParams.get("businessName");
  const businessId = searchParams.get("businessID");
  const cooperateID = searchParams.get("cooperateID");

  const { data: menuConfig } = useMenuConfig(businessId, cooperateID);

  const baseString = menuConfig?.image
    ? `data:image/jpeg;base64,${menuConfig.image}`
    : "";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="absolute top-0 left-0 w-full h-full flex flex-col bg-white">
      <RestaurantBanner
        businessName={businessName || undefined}
        menuConfig={menuConfig}
        showMenuButton={false}
        baseString={baseString}
      />

      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <h2 className="text-center text-xl font-bold mb-3 text-black">
          Oops! Something went wrong
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6 max-w-md">
          We encountered an unexpected error while loading this page. This could be temporary, so please try again. If the problem persists, contact support.
        </p>
        <CustomButton
          className="bg-primaryColor w-25 py-4 text-white"
          onClick={() => reset()}
        >
          Try again
        </CustomButton>
      </div>
    </main>
  );
}
