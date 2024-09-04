import BusinessSettingsDashboardPrompt from '@/components/businessSettingsDashboardPrompt';
import Container from '@/components/dashboardContainer';

import { inter } from '@/utilities/ui-config/fonts';
import dynamic from 'next/dynamic';
import 'react-toastify/dist/ReactToastify.css';

const DynamicMetaTag = dynamic(() => import('@/components/dynamicMetaTag'), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.className}`} suppressHydrationWarning>
      <body>
        <Container>
          <DynamicMetaTag />
          {children}
        </Container>
        <BusinessSettingsDashboardPrompt />
      </body>
    </html>
  );
}
