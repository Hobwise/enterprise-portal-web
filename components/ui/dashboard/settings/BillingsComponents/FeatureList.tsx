import React from "react";
import { formatKey } from "@/lib/utils";

interface PlanFeature {
  key: string;
  label: string;
  value: boolean;
}
export interface PlanDetails {
  maxUsers: number;
  monthlyFee: number;
  yearlyFee: number;
  canAccessDashboard: boolean;
  canAccessMenu: boolean;
  canAccessReservations: boolean;
  canAccessNotifications: boolean;
  canAccessOrders: boolean;
  canAccessPayments: boolean;
  canAccessBookings: boolean;
  canAccessCampaigns: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canAccessQuickResponses: boolean;
  canAccessMultipleLocations: boolean;
}
interface PlanFeatureListProps {
  plan: PlanDetails;
  handleIcons: (value: boolean) => React.ReactNode;
  isPremium?: boolean;
}

const FeatureList: React.FC<PlanFeatureListProps> = ({ plan, handleIcons, isPremium }) => {
  const enabledFeatures = Object.entries(plan)
    .filter(([key, value]) => key.startsWith("canAccess") && value === true)
    .map(([key]) => ({
      key,
      label: formatKey(key),
    }));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-3 items-center">
        {handleIcons(true)}
        <p className="text-sm">
          {isPremium
            ? "Maximum users - Unlimited users"
            : `Maximum users - Up to ${plan.maxUsers} users`}
        </p>
      </div>

      {enabledFeatures.map((feature) => (
        <div key={feature.key} className="flex flex-row gap-3 items-center">
          {handleIcons(true)}
          <p className="text-sm">{feature.label}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
