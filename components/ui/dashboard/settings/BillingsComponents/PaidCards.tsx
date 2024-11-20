import React, { useEffect, useState } from "react";
import mastercardLogo from "../../../../../public/assets/images/mastercard-logo.svg";
import Image from "next/image";
import visa from "../../../../../public/assets/images/visa.png";
import verve from "../../../../../public/assets/images/verve.png";
import { PaidCardsData } from "./Interfaces";
import { Spinner } from "@nextui-org/react";

import {
  capitalizeFirstLetterOfEachWord,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
// import useManageSubscription from "@/hooks/cachedEndpoints/useManageSubscription";
import {
  manageSubscription,
  manageSubscriptionv2,
} from "@/app/api/controllers/dashboard/settings";
import IframeComponent from "./Iframe";
import LoadingSpinner from "@/app/dashboard/menu/[menuId]/loading";

export const PaidCards: React.FC<PaidCardsData> = ({
  cardDetails,
  currentSubscriptionDetails,
}) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessID = userInformation?.businesses[0]?.businessId;

  const [manageSubUrl, setManageSubUrl] = useState<string>("");
  const [triggerIframe, setTriggerIframe] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  // const { bindings,  } = useModal();

  //* HANDLE TYPES
  const TYPE_OF_CARD = {
    VISA: <Image alt="Visa" src={visa} height={40} layout="intrinsic" />,
    VERVE: <Image alt="Verve" src={verve} layout="intrinsic" />,
    MASTERCARD: (
      <Image alt="Mastercard" src={mastercardLogo} layout="intrinsic" />
    ),
  };

  const TYPE_OF_PLAN = {
    1: "Premium",
    2: "Professional",
    3: "Starter",
  };

  //* SET VALUES
  let image;
  let plan;

  const cardBrand = cardDetails?.brand?.toUpperCase();
  const planType = currentSubscriptionDetails?.plan;

  image =
    cardBrand === "VISA"
      ? TYPE_OF_CARD.VISA
      : cardBrand === "VERVE"
      ? TYPE_OF_CARD.VERVE
      : TYPE_OF_CARD.MASTERCARD;

  plan =
    planType === 1
      ? TYPE_OF_PLAN[1]
      : planType === 2
      ? TYPE_OF_PLAN[2]
      : TYPE_OF_PLAN[3];

  const nextPayment =
    currentSubscriptionDetails?.nextPaymentDate?.split("T")[0];
  const isActive = currentSubscriptionDetails?.isActive ? "Active" : "False";

  //*================== MANAGE SUBSCRIPTION ==================

  const manageYourSubscription = async () => {
    setLoadingModal(true);
    const token = getJsonItemFromLocalStorage("userInformation").token;
    const data = await manageSubscriptionv2(businessID, token);
    if (data !== null && data.error == null) {
      setManageSubUrl(data?.data);

      triggerModal();
    }
  };

  const triggerModal = () => {
    setTriggerIframe(true);
  };

  useEffect(() => {
    // console.log("TRIGGER STATUS", triggerIframe);
    if (!triggerIframe) {
      setLoadingModal(false);
    }
  }, [triggerIframe]);

  //*================== MANAGE SUBSCRIPTION ==================
  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row md:flex-row">
        <div className="border border-secondaryGrey w-1/2 rounded-lg my-6 px-4 py-6">
          <div>
            <div className="flex flex-row my-2 w-full justify-between">
              <div>{image}</div>
              <button className="px-4 py-1.5 border-1 font-bold border-secondary-500 text-secondary-500 rounded-lg">
                Edit
              </button>
            </div>
            <div className="flex flex-row space-x-4">
              <h2 className="text-lg font-bold">
                {capitalizeFirstLetterOfEachWord(cardDetails?.brand!)} ending in{" "}
                {cardDetails?.last4}
              </h2>
              <div className="px-3 border-2 border-cyan text-cyan rounded-full">
                Default
              </div>
            </div>
            <p className="text-base my-1 font-medium">
              Expiry {cardDetails?.exp_Month}/{cardDetails?.exp_Year}
            </p>
          </div>
        </div>
        <div className="border border-secondaryGrey w-1/2 rounded-lg my-6">
          <div className="p-4 px-6 border-b border-secondaryGrey">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold">{plan} plan</h2>
              <div className="px-3 py-0 border-2 border-cyan text-cyan rounded-full">
                {isActive}
              </div>
            </div>
            <p className="text-base my-1 font-medium">
              Next payment date{" "}
              <span className="font-normal">{nextPayment}</span>
            </p>
          </div>
          <div className="p-4 flex justify-center items-center">
            <button
              onClick={() => manageYourSubscription()}
              className="border-2 border-secondary-500 rounded-lg px-6 py-2 font-bold text-secondary-500 hover:bg-secondary-500 hover:text-white"
              style={{ minWidth: "200px" }} // Ensures the button width doesn't shrink
            >
              {loadingModal ? (
                <div className="flex justify-center items-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                "Manage subscription"
              )}
            </button>
          </div>
        </div>
      </div>
      {triggerIframe && (
        <IframeComponent
          url={manageSubUrl}
          trigger={triggerIframe}
          setTriggerIframe={setTriggerIframe}
        />
      )}{" "}
    </div>
  );
};
