'use client';
import Error from '@/components/error';
import useReservationUser from '@/hooks/cachedEndpoints/useReservationUser';
import { companyInfo } from '@/lib/companyInfo';
import { saveJsonItemToLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { Divider } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import noImage from '../../../public/assets/images/no-image.svg';
import SplashScreen from '../splash-screen';
import RestaurantBanner from "@/app/create-order/RestaurantBanner";
import useMenuConfig from "@/hooks/cachedEndpoints/useMenuConfiguration";
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { BiPackage } from 'react-icons/bi';
import { IoCalendarOutline } from 'react-icons/io5';

interface ReservationItem {
  reservationName: string;
  reservationDescription: string;
  image?: string;
  [key: string]: any;
}

interface ReservationData {
  reservations: ReservationItem[];
}

const SelectReservationComponents = () => {
  const searchParams = useSearchParams();
  let businessName = searchParams.get("businessName");
  let businessId = searchParams.get("businessID"); // Changed from 'businessId' to 'businessID'
  let cooperateID = searchParams.get("cooperateID");
  const router = useRouter();

  const { data: menuConfig } = useMenuConfig(businessId, cooperateID);
  const { data, isLoading, isError, refetch } = useReservationUser(
    businessId,
    cooperateID
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isError) {
    return (
      <div className="min-h-screen w-full  bg-white">
        <RestaurantBanner
          businessName={businessName || ""}
          menuConfig={menuConfig}
          showMenuButton={true}
          baseString=""
        />
        <div className="px-4">
          <Error imageHeight={"h-22"} imageWidth={"w-22"} onClick={() => refetch()} />
        </div>
      </div>
    );
  }

  const baseString = menuConfig?.image
    ? `data:image/jpeg;base64,${menuConfig.image}`
    : "";

  return (
    <div className="min-h-screen w-full  bg-white">
      {/* Restaurant Banner */}
      <RestaurantBanner
        businessName={businessName || ""}
        menuConfig={menuConfig}
        showMenuButton={true}
        onMenuClick={() => setIsMenuOpen(true)}
        baseString={baseString}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl text-black font-bold">Reservations</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Select a reservation to make a booking
          </p>
        </div>

        {/* Loading State - Skeleton */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex gap-3 sm:gap-4 animate-pulse p-2 sm:p-3">
                <div className="w-16 h-16 sm:w-[70px] sm:h-[60px] bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (data as ReservationData)?.reservations?.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
              No Reservations Available
            </h3>
            <p className="text-sm sm:text-base text-gray-600 text-center max-w-sm">
              There are currently no reservations available for booking. Please check back later or contact the restaurant for more information.
            </p>
          </div>
        ) : (
          <>
            {(data as ReservationData)?.reservations?.map(
              (reservation: ReservationItem, index: number) => (
                <div key={reservation.reservationName + index}>
                  <div
                    title="select reservation"
                    onClick={() => {
                      saveJsonItemToLocalStorage(
                        "singleReservation",
                        reservation
                      );
                      saveToLocalStorage("businessName", businessName);
                      router.push(
                        `${
                          companyInfo.webUrl
                        }/reservation/select-reservation/single-reservation?businessName=${encodeURIComponent(
                          businessName || ""
                        )}&businessID=${businessId}&cooperateID=${cooperateID}`
                      );
                    }}
                    className="relative cursor-pointer flex gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Image
                      width={70}
                      height={60}
                      src={
                        reservation?.image
                          ? `data:image/jpeg;base64,${reservation?.image}`
                          : noImage
                      }
                      alt={reservation.reservationName}
                      className="w-16 h-16 sm:w-[70px] sm:h-[60px] rounded-lg border border-gray-200 object-cover flex-shrink-0"
                    />
                    <div className="text-black flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {reservation.reservationName}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                        {reservation.reservationDescription}
                      </p>
                    </div>
                  </div>
                  {index <
                    ((data as ReservationData)?.reservations?.length || 0) -
                      1 && <Divider className="my-2 sm:my-3" />}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Hamburger Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Drawer */}
          <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-black">Menu</h2>
              <button
                aria-label='Close menu'
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              {/* View Menu */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push(`/create-order?businessID=${businessId}&cooperateID=${cooperateID || ""}&businessName=${businessName}`);
                }}
                className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MdOutlineRestaurantMenu className="w-6 h-6 text-primaryColor" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black">View Menu</h3>
                  <p className="text-sm text-gray-600">
                    Browse our full menu and place orders
                  </p>
                </div>
              </button>

              {/* Track Order */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push(`/create-order?businessID=${businessId}&cooperateID=${cooperateID || ""}&businessName=${businessName}`);
                }}
                className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left mt-2"
              >
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BiPackage className="w-6 h-6 text-primaryColor" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black">Track Order</h3>
                  <p className="text-sm text-gray-600">
                    Check the status of your order
                  </p>
                </div>
              </button>

              {/* Book Reservation - Active */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-start gap-4 p-4 bg-purple-50 rounded-lg transition-colors text-left mt-2"
              >
                <div className="p-2 bg-primaryColor rounded-lg">
                  <IoCalendarOutline className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primaryColor">Book Reservation</h3>
                  <p className="text-sm text-gray-600">
                    Reserve a table for you and friends
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectReservationComponents;
