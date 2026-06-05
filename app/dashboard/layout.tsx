'use client';

import AdminPrivateRoute from "@/components/auth/AdminPrivateRoute";
import BusinessSettingsDashboardPrompt from "@/components/businessSettingsDashboardPrompt";
import Container from "@/components/dashboardContainer";
import AiChatWidget from "@/components/ui/dashboard/ai-chat/AiChatWidget";
import { SubscriptionNoticePopup } from "@/components/ui/dashboard/subscription-notification";
import { SubscriptionProvider } from "@/hooks/providers/SubscriptionProvider";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPrivateRoute>
      <SubscriptionProvider>
        <div className="font-satoshi">
          <Container>{children}</Container>
          <Suspense fallback={null}>
            <BusinessSettingsDashboardPrompt />
          </Suspense>
          <Suspense fallback={null}>
            <SubscriptionNoticePopup />
          </Suspense>
          <AiChatWidget />
        </div>
      </SubscriptionProvider>
    </AdminPrivateRoute>
  );
}
