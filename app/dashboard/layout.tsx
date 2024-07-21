import { inter } from '@/utilities/ui-config/fonts';

import BusinessSettingsDashboardPrompt from '@/components/businessSettingsDashboardPrompt';
import Container from '@/components/dashboardContainer';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.className} `} suppressHydrationWarning>
      <body>
        <Container>{children}</Container>
        <BusinessSettingsDashboardPrompt />
      </body>
    </html>
  );
}
