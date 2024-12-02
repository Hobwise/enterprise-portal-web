import BusinessSettingsDashboardPrompt from '@/components/businessSettingsDashboardPrompt';
import Container from '@/components/dashboardContainer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='font-satoshi'>
      <Container>{children}</Container>
      <BusinessSettingsDashboardPrompt />
    </div>
  );
}
