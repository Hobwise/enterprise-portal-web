import React from "react";
import { PaidCardsData } from "./Interfaces";

const SubscriptionPendingCard: React.FC<PaidCardsData> = ({
  cardDetails,
  currentSubscriptionDetails,
}) => {
  const TYPE_OF_PLAN = {
    1: "Premium",
    2: "Professional",
    3: "Basic",
  };
  let plan;

  const planType = currentSubscriptionDetails?.plan;

  plan =
    planType === 1
      ? TYPE_OF_PLAN[1]
      : planType === 2
      ? TYPE_OF_PLAN[2]
      : TYPE_OF_PLAN[3];

  return (
    <div className="border border-secondaryGrey w-1/2 rounded-lg my-6">
      <div className="p-4 px-6 border-b border-secondaryGrey">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">{plan} plan</h2>
          <div className="px-3 py-0 border-2 border-pend text-pend rounded-full">
            Pending
          </div>
        </div>
      </div>
      <div className="p-4 flex justify-center items-center">
        <button disabled className=" px-6 py-2 font-sm text-[#CDD3D8] ">
          Manage subscription
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPendingCard;
