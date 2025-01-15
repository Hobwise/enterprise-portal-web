import React from "react";

interface PlanFeature {
  key: string;
  label: string;
  value: boolean ;
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
    canAccessQR: boolean;
    canAccessMultipleLocations: boolean;
  }
interface PlanFeatureListProps {
  plan: PlanDetails;
  handleIcons: (value: boolean) => React.ReactNode;
}

const FeatureList: React.FC<PlanFeatureListProps> = ({ plan, handleIcons }) => {

    // console.log("PLAN", plan)
  const features: PlanFeature[] = [
    { key: "canAccessDashboard", label: "Can Access Dashboard", value: plan.canAccessDashboard },
    { key: "canAccessMenu", label: "Can Access Menu", value: plan.canAccessMenu },
    { key: "canAccessOrders", label: "Can Access Orders", value: plan.canAccessOrders },
    { key: "canAccessPayments", label: "Can Access Payments", value: plan.canAccessPayments },
    { key: "canAccessSettings", label: "Can Access Settings", value: plan.canAccessSettings },
    { key: "canAccessQR", label: "Can Access QR", value: plan.canAccessQR },
    { key: "canAccessReservations", label: "Can Access Reservations", value: plan.canAccessReservations },
    { key: "canAccessNotifications", label: "Can Access Notifications", value: plan.canAccessNotifications },
    { key: "canAccessBookings", label: "Can Access Bookings", value: plan.canAccessBookings },
    { key: "canAccessCampaigns", label: "Can Access Campaigns", value: plan.canAccessCampaigns },
    { key: "canAccessReports", label: "Can Access Reports", value: plan.canAccessReports },
    { key: "canAccessMultipleLocations", label: "Can Access Multiple Locations", value: plan.canAccessMultipleLocations },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* First child div with a static true value for handleIcons */}
      <div className="flex flex-row gap-3 items-center">
        {handleIcons(true)}
        <p className="text-sm">Maximum users - {plan?.maxUsers}</p>
      </div>
      
      {/* Dynamically rendered features */}
      {features.map((feature) => (
        <div key={feature.key} className="flex flex-row gap-3 items-center">
          {handleIcons(feature?.value)}
          <p className="text-sm">{feature.label}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
