'use client';

import BusinessSettingsDashboardPrompt from "@/components/businessSettingsDashboardPrompt";
import Container from "@/components/dashboardContainer";
import { SubscriptionNoticePopup } from "@/components/ui/dashboard/subscription-notification";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-satoshi">
      <Container>{children}</Container>
      <Suspense fallback={null}>
        <BusinessSettingsDashboardPrompt />
      </Suspense>
      <Suspense fallback={null}>
        <SubscriptionNoticePopup />
      </Suspense>
    </div>
  );
}
