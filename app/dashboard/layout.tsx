'use client';

import AdminPrivateRoute from "@/components/auth/AdminPrivateRoute";
import BusinessSettingsDashboardPrompt from "@/components/businessSettingsDashboardPrompt";
import Container from "@/components/dashboardContainer";
import { SubscriptionNoticePopup } from "@/components/ui/dashboard/subscription-notification";
import { Suspense, useEffect } from "react";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";

// Component to initialize subscription early in the render cycle
function SubscriptionInitializer() {
  const { isLoading, isError } = useSubscription();

  useEffect(() => {
    if (isLoading) {
      console.log('[Dashboard] Initializing subscription data...');
    } else if (isError) {
      console.error('[Dashboard] Failed to load subscription data');
    } else {
      console.log('[Dashboard] Subscription data loaded successfully');
    }
  }, [isLoading, isError]);

  return null; // This component doesn't render anything
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPrivateRoute>
      <div className="font-satoshi">
        <SubscriptionInitializer />
        <Container>{children}</Container>
        <Suspense fallback={null}>
          <BusinessSettingsDashboardPrompt />
        </Suspense>
        <Suspense fallback={null}>
          <SubscriptionNoticePopup />
        </Suspense>
      </div>
    </AdminPrivateRoute>
  );
}
