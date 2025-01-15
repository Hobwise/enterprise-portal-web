import BusinessSettingsDashboardPrompt from "@/components/businessSettingsDashboardPrompt";
import Container from "@/components/dashboardContainer";
import { SubscriptionNoticePopup } from "@/components/ui/dashboard/subscription-notification";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-satoshi">
      <Container>{children}</Container>
      <BusinessSettingsDashboardPrompt />
      <SubscriptionNoticePopup />
    </div>
  );
}
