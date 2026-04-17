'use client';

import AdminPrivateRoute from "@/components/auth/AdminPrivateRoute";
import BusinessSettingsDashboardPrompt from "@/components/businessSettingsDashboardPrompt";
import Container from "@/components/dashboardContainer";
import { SubscriptionNoticePopup } from "@/components/ui/dashboard/subscription-notification";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@/hooks/providers/SubscriptionProvider";
import { Spinner } from "@nextui-org/react";
import { Suspense } from "react";

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useSubscriptionContext();

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPrivateRoute>
      <SubscriptionProvider>
        <SubscriptionGate>
          <div className="font-satoshi">
            <Container>{children}</Container>
            <Suspense fallback={null}>
              <BusinessSettingsDashboardPrompt />
            </Suspense>
            <Suspense fallback={null}>
              <SubscriptionNoticePopup />
            </Suspense>
          </div>
        </SubscriptionGate>
      </SubscriptionProvider>
    </AdminPrivateRoute>
  );
}
