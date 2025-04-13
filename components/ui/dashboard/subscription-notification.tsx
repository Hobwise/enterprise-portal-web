"use client";
import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { LuShieldAlert } from "react-icons/lu";
import moment from "moment";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { CiWarning } from "react-icons/ci";
import { CustomButton } from "@/components/customButton";

export const NavigationBanner = ({
  title,
  desc,
}: {
  title: string;
  desc: string | React.ReactNode;
}) => {
  const router = useRouter();

  const userInfo = getJsonItemFromLocalStorage("userInformation");

  return (
    <div className="bg-amber-50 border border-amber-100 px-4 py-3 flex items-center gap-3 justify-between mx-auto">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10  rounded-full shadow-lg flex items-center justify-center text-amber-900 text-2xl font-medium">
          <LuShieldAlert />
        </div>
        <div className="flex flex-col">
          <span className="text-amber-800 font-medium">{title}</span>
          <div className="text-amber-600">{desc}</div>
        </div>
      </div>
      {userInfo.isOwner && (
        <Button
          onClick={() => router.push("/dashboard/settings/subscriptions")}
          className="px-6 py-1.5  rounded-md text-sm font-medium bg-[#D7A913]  text-white  relative group"
        >
          Upgrade
        </Button>
      )}
    </div>
  );
};

interface CheckExpiryResult {
  message: string;
  showBanner: boolean;
}

export const useCheckExpiry = (
  nextPaymentDate: string,
  daysThreshold: number
): CheckExpiryResult => {
  const [message, setMessage] = useState<string>("");
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const updateMessage = () => {
      const now = moment();
      const dueMoment = moment(nextPaymentDate);
      const daysUntilDue = dueMoment.diff(now, "days");

      if (daysUntilDue <= daysThreshold && dueMoment.isAfter(now)) {
        setShowBanner(true);

        if (daysUntilDue > 1) {
          setMessage(`in ${daysUntilDue} days`);
        } else if (daysUntilDue === 1) {
          setMessage("tomorrow");
        } else {
          const hoursUntilDue = dueMoment.diff(now, "hours");
          if (hoursUntilDue > 0) {
            setMessage(`today (in ${hoursUntilDue} hours)`);
          } else {
            setMessage("today");
          }
        }
      } else {
        setShowBanner(false);
      }
    };

    updateMessage();
    const interval = setInterval(updateMessage, 86400000);
    return () => clearInterval(interval);
  }, [nextPaymentDate, daysThreshold]);

  return { message, showBanner };
};

export const SubscriptionNoticePopup = () => {
  const userData = getJsonItemFromLocalStorage("userInformation");

  const { message, showBanner } = useCheckExpiry(
    userData?.subscription?.nextPaymentDate,
    2
  );

  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  useEffect(() => {
    if (
      userData?.subscription?.onTrialVersion === false &&
      userData?.subscription?.isActive === true &&
      showBanner
    ) {
      onOpen();
    }
  }, [showBanner]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="text-black md:p-10 p-8 space-y-4">
              <div className="w-full grid place-content-center">
                <div className="bg-[#ffebca] h-[60px] grid place-content-center rounded-full  w-[60px]">
                  <CiWarning className="text-[#F4B23E] font-3xl text-[35px]" />
                </div>
              </div>
              <div>
                <p className="font-bold text text-[20px] mb-2 text-center">
                  Subscription Expiry Notice!
                </p>
                <div className="flex justify-center items-center">
                  <p className="text-sm text-grey500 text-center md:w-[90%] w-[100%]">
                    Your subscription will expire{" "}
                    <span className="font-bold">{message}</span>.{" "}
                    {userData.role === 1
                      ? "Contact your management"
                      : "Renew now to avoid service interruption"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {userData.isOwner && (
                  <CustomButton
                    className="h-[50px]  text-white"
                    onClick={() => {
                      onOpenChange();

                      router.push("/dashboard/settings/subscriptions");
                    }}
                    type="submit"
                  >
                    Go to subscription
                  </CustomButton>
                )}
                <CustomButton
                  className="h-[50px]  text-black bg-transparent border rounded-lg border-primaryGrey"
                  onClick={onOpenChange}
                  type="submit"
                >
                  Skip Now
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
