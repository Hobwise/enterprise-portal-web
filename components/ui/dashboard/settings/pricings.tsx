// components/Pricing.tsx

import { useEffect, useState } from "react";
import PlanCard from "./BillingsComponents/PlanCard";
import { SubscriptionCard } from "./BillingsComponents/SubscriptionCard";
import { PaidCards } from "./BillingsComponents/PaidCards";
import Table from "./Table";
import { CustomLoading, notify } from "@/lib/utils";
import ReservationList from "../reservations/reservation";
import TableWithPagination from "./TableTest";
import PaginatedTable from "./TableTest";
import { PricingCards } from "./BillingsComponents/PricingCards";
import SubscriptionPendingCard from "./BillingsComponents/SubscriptionPendingCard";
import NoSubscriptionCard from "./BillingsComponents/NoSubscriptionCard";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import useBilling from "@/hooks/cachedEndpoints/useBilling";
import {
  CardDetails,
  Plans,
  SubscriptionData,
  CurrentSubscriptionDetails,
  SubscriptionHistory,
} from "./BillingsComponents/Interfaces";
import SubscriptionTable from "./BillingsComponents/BillingHistory";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [plansArray, setPlansArray] = useState<Plans | null>(null);
  const [billingHistory, setBillingHistory] = useState<SubscriptionHistory[] | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [disableButtons, setDisableButtons] = useState(false);
  const [cardAuthorization, setCardAuthorization] =
    useState<CardDetails | null>(null);
  const [currentSubDetails, setCurrentSubDetails] =
    useState<CurrentSubscriptionDetails | null>(null);

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");

  const businessId = businessInformation?.businessId;

  //* Fetch subscription data from the API here *//

  const subscription = useBilling();

  useEffect(() => {
    console.log("SUBS", subscription.data)
    const { data, isLoading } = subscription;
  
    if (!data) {
      setNoSubscription(true);
      return;
    }
  
    const { plans, status, authorization, subscription: currentSub, subscriptionHistories    } = data;
  
    setPlansArray(plans);
    setIsLoading(isLoading);
    setShowPlans(true);
    setNoSubscription(false);
    setBillingHistory(subscriptionHistories)
  
    if (!currentSub) {
      setNoSubscription(true);
      return;
    }
  
    if (status === 'active') {
      console.log("SUB IS ACTIVE")
      setDisableButtons(true);
      if (currentSub.isActive) {
        setHasSubscription(true);
        setCardAuthorization({ ...authorization, status: 'active' });
        setCurrentSubDetails({ ...currentSub, nextPaymentDate: data.nextPaymentDate });
      } else {
        setPendingSubscription(true);
      }
    }
  }, [subscription?.data, subscription?.isLoading]);

  const columns = [
    { name: "Plan" },
    { name: "Bill Date" },
    { name: "Duration" },
    { name: "Amount" },
    { name: "Invoice" },
    { name: "Action" },
  ];

  return (
    <div className=" ">
      <div className="w-full mb-2">
        <h1 className="text-xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-foreground-600 mb-4">
          Manage your pricing and billing settings
        </p>
      </div>

      {/* No scriptions card */}
      {/* <SubscriptionCard /> */}

      {isLoading ? (
        <CustomLoading />
      ) : (
        <>
          {noSubscription && <NoSubscriptionCard />}
          {hasSubscription && (
            <PaidCards
              cardDetails={cardAuthorization}
              currentSubscriptionDetails={currentSubDetails}
            />
          )}
          {pendingSubscription && (
            <SubscriptionPendingCard
              cardDetails={cardAuthorization}
              currentSubscriptionDetails={currentSubDetails}
            />
          )}
          {showPlans && <PricingCards plans={plansArray} disableButtons={disableButtons}/>}

          <h2 className="text-lg font-bold mt-10 mb-10">Billing history</h2>
          <SubscriptionTable subscriptions={billingHistory}/>

        </>
      )}

      {/* {showDowngradeWarning && (
        <div
          className="bg-primary-100 border-l-4 border-primary-500 text-primary-700 p-4 mb-6"
          role="alert"
        >
          <p>
            Are you sure you want to downgrade? This will remove Pro plan
            privileges, shifting your account to the Free plan on February 1,
            2024.
          </p>
        </div>
      )} */}

      {/* <p className="text-sm text-secondary-600 mt-4 cursor-pointer">
        Compare plans and pricing options
      </p> */}
    </div>
  );
};

export default Pricing;

