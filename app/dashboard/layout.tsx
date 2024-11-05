import BusinessSettingsDashboardPrompt from '@/components/businessSettingsDashboardPrompt';
import Container from '@/components/dashboardContainer';

import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`font-satoshi`} suppressHydrationWarning>
      <body>
        <Container>{children}</Container>
        <BusinessSettingsDashboardPrompt />
      </body>
    </html>
  );
}
