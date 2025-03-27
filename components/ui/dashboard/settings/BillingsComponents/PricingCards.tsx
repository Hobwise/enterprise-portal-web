"use client";
import React, { useEffect, useState } from "react";
import { FcLock, FcOk } from "react-icons/fc";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "@nextui-org/react";

import {
  PlanDetails,
  Plans,
  PlansFromParent,
  TabContentProps,
  PaymentDetails,
  PAYMENT_PLAN,
  TYPE_OF_PLAN,
} from "./Interfaces";

import { MdVerified } from "react-icons/md";
import { cn, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import { initializeTransactionv2 } from "@/app/api/controllers/dashboard/settings";
// import PaystackPop from 'paystack-inline-ts';
import PaystackPop from "paystack-inline-ts";
import { usePaystackPayment } from "react-paystack";
// import {PaystackPop} from '../Paystack'

import LoadingSpinner from "@/app/dashboard/reservation/[reservationId]/loading";
import FeatureList from "./FeatureList";
import { getUser } from "@/app/api/controllers/auth";

export const PricingCards: React.FC<PlansFromParent> = ({
  plans,
  disableButtons,
  currentSubscriptionDetails,
}) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const business = getJsonItemFromLocalStorage("business");
  const popup = new PaystackPop();
  const planType = currentSubscriptionDetails?.subscription?.plan;

  const token = userInformation?.token;
  const cooperateID = userInformation?.cooperateID;
  const businessID = business[0]?.businessId || null;
  const userId = userInformation?.id;
  const emailAddress = userInformation?.email;
  const [activeTab, setActiveTab] = useState<string>("Monthly");
  const [professionalPlan, setProfessionalPlan] = useState<PlanDetails | null>(
    null
  );
  const [starterPlan, setStarterPlan] = useState<PlanDetails | null>(null);
  const [premiumPlan, setPremiumPlan] = useState<PlanDetails | null>(null);
  const [starterLoading, setStarterLoading] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [hasActive, setHasActive] = useState(false);

  useEffect(() => {
    if (disableButtons) {
      setHasActive(disableButtons);
    }
  }, [disableButtons]);

  useEffect(() => {
    setProfessionalPlan(plans?.Professional || null);
    setPremiumPlan(plans?.Premium || null);
    setStarterPlan(plans?.Basic || null);
  }, [plans]);

  const tabs: TabContentProps[] = [
    { id: "Monthly", label: "Monthly" },
    { id: "Yearly", label: "Yearly" },
  ];
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  const handleIcons = (can: Boolean) => {
    if (can == true) return <FcOk />;

    return <FcLock />;
  };

  let plan;

  plan =
    planType === 1
      ? TYPE_OF_PLAN[1]
      : planType === 2
      ? TYPE_OF_PLAN[2]
      : TYPE_OF_PLAN[3];

  const initializeTrnx = (selectedPlan: number, e: any) => {
    console.log("initializeTrnx", selectedPlan);
    e.preventDefault();

    const plans = [null, starterPlan, professionalPlan, premiumPlan];
    const setLoading = [
      null,
      setStarterLoading,
      setProfessionalLoading,
      setPremiumLoading,
    ];

    if (selectedPlan < 1 || selectedPlan >= plans.length) {
      return notify({
        title: "Payment Plan Error",
        text: "Invalid payment plan selected.",
        type: "error",
      });
    }

    setLoading[selectedPlan]?.(true);

    const amount =
      activeTab === "Monthly"
        ? plans[selectedPlan]?.monthlyFee || 0
        : plans[selectedPlan]?.yearlyFee || 0;

    if (!plans[selectedPlan]) {
      const notificationBody = {
        title: "Payment Plan Error",
        text: "Invalid payment plan selected.",
        type: "error",
      };
      return notify(notificationBody);
    }

    if (businessID) {
      const body = {
        businessID,
        cooperateID,
        userId,
        emailAddress,
        amount,
        plan: selectedPlan,
        paymentPeriod: activeTab === "Monthly" ? 0 : 1,
      };

      init(body, selectedPlan);
    }
  };

  const init = async (payload: any, selectedPlan: number) => {
    const token = getJsonItemFromLocalStorage("userInformation").token;
    try {
      const initializedTransaction = await initializeTransactionv2(
        businessID,
        payload,
        token
      );

      if (initializedTransaction.access_code) {
        const access_code = initializedTransaction.access_code;

        const handleSuccess = async () => {
          const userDetailss = await getUser(userId).then((response) =>
            window.location.reload()
          );
        };

        popup.resumeTransaction({
          accessCode: access_code,
          onSuccess: () => handleSuccess(),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      switch (selectedPlan) {
        case 1:
          setStarterLoading(false);
          break;
        case 2:
          setProfessionalLoading(false);
          break;
        case 3:
          setPremiumLoading(false);
          break;
        default:
          break;
      }
    }
  };

  const activePlan = () => {
    const notificationBody = {
      title: "Active Plan",
      text: "You have an active plan",
      type: "warning",
    };
    return notify(notificationBody);
  };

  return (
    <div className="border border-secondaryGrey w-full overflow-hidden rounded-lg flex flex-col mx-auto">
      <div className="p-4 sm:px-6">
        <div className="flex flex-row flex-wrap items-center justify-between gap-0 sm:gap-4">
          <h2 className="text-lg font-bold">Plans</h2>
          <div className="sm:w-auto">
            <Tabs
              aria-label="Dynamic tabs"
              onSelectionChange={(e) => handleTabChange(e.toString())}
            >
              {tabs.map((item) => (
                <Tab key={item.id} title={item.label} value={item.id} />
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {[starterPlan, professionalPlan, premiumPlan].map((plan, index) => {
          const isActive = planType === index + 1;
          const planNames = ["Basic", "Professional", "Premium"];
          const planDescriptions = [
            "Recommended for small businesses, looking to streamline their menu & order management process",
            "Suitable for medium size businesses looking to manage booking, process order & menu while leveraging the campaign feature also",
            "For large scale businesses operations, enabling businesses with multiple locations manage their operations effectively",
          ];
          const planLoading = [
            starterLoading,
            professionalLoading,
            premiumLoading,
          ];

          return (
            <div
              key={index}
              className={cn(
                "col-span-1 border p-4 transition-all duration-300",
                isActive
                  ? "border-[#5F35D2] bg-gradient-to-br from-[#F6F3FF] to-[#FFFFFF]"
                  : "border-secondaryGrey hover:border-[#5F35D2]"
              )}
            >
              <div className="flex flex-row gap-4 items-center">
                <p className="font-extrabold text-sm">{planNames[index]}</p>
                {index === 1 && (
                  <button
                    disabled
                    className="text-[10px] bg-[#EAECF0] px-3 py-1 rounded-sm"
                  >
                    RECOMMEND
                  </button>
                )}
                {isActive && <MdVerified className="text-primaryColor" />}
              </div>

              <div className="flex flex-row gap-4 mt-6">
                <div
                  className={`transition-opacity duration-500 ${
                    activeTab === "Monthly" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {activeTab === "Monthly" && (
                    <p className="font-extrabold text-2xl">
                      ₦{plan?.monthlyFee}
                      <span className="text-[#ACB5BB] font-normal">/month</span>
                    </p>
                  )}
                </div>

                <div
                  className={`transition-opacity duration-500 ${
                    activeTab === "Yearly" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {activeTab === "Yearly" && (
                    <p className="font-extrabold text-2xl">
                      ₦{plan?.yearlyFee}
                      <span className="text-[#ACB5BB] font-normal">/year</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm mt-4">{planDescriptions[index]}</p>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-secondaryGrey" />
                <span className="mx-4 text-xs text-[#ACB5BB]">
                  WHAT YOU WILL GET
                </span>
                <hr className="flex-grow border-t border-secondaryGrey" />
              </div>

              {plan && (
                <FeatureList
                  plan={plan!}
                  handleIcons={(value) => handleIcons(value)}
                />
              )}

              {isActive ? (
                <button
                  disabled
                  className="mt-6 w-full mx-auto bg-[#F1F2F4] rounded-lg px-8 py-2 font-normal text-sm text-grey500"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={
                    hasActive === false
                      ? (e) => initializeTrnx(index + 1, e)
                      : activePlan
                  }
                  className="mt-6 w-full mx-auto border border-secondary-500 rounded-lg px-8 py-2 font-normal text-sm text-secondary-500 hover:bg-secondary-500 hover:text-white"
                >
                  {planLoading[index] ? (
                    <Spinner color="default" size="sm" />
                  ) : (
                    "Select Plan"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </div>
  );
};

{
  /* <div className="flex flex-col gap-2">
<div className="flex flex-row gap-3 items-center ">
  {handleIcons(true)}
  <p className="text-sm">
    Maximum users - {professionalPlan?.maxUsers}
  </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessDashboard!)}
  <p className="text-sm">Can Access Dashboard </p>
</div>

<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessMenu!)}
  <p className="text-sm">Can Access Menu </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessOrders!)}
  <p className="text-sm">Can Access Orders </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessPayments!)}
  <p className="text-sm">Can Access Payments </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessSettings!)}
  <p className="text-sm">Can Access Settings </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessQR!)}
  <p className="text-sm">Can Access QR </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessReservations!)}
  <p className="text-sm"> Can Access Reservations </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessNotifications!)}
  <p className="text-sm">Can Access Notifications </p>
</div>

<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessBookings!)}
  <p className="text-sm">Can Access Bookings </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessCampaigns!)}
  <p className="text-sm">Can Access Campaigns </p>
</div>
<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessReports!)}
  <p className="text-sm">Can Access Reports </p>
</div>

<div className="flex flex-row gap-3 items-center">
  {handleIcons(professionalPlan?.canAccessMultipleLocations!)}
  <p className="text-sm">Can Access Multiple Locations </p>
</div>
</div> */
}
