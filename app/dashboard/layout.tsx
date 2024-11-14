import BusinessSettingsDashboardPrompt from '@/components/businessSettingsDashboardPrompt';
import Container from '@/components/dashboardContainer';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`font-satoshi`} suppressHydrationWarning>
      <body>
        <Container>
          {children}
          <Toaster
            toastOptions={{
              duration: 5000,
              success: {
                style: {
                  border: '2px solid #3a9ea5',
                  boxShadow: 'none',
                },
              },
              error: {
                style: {
                  border: '2px solid #eb5757',
                  boxShadow: 'none',
                },
              },
            }}
          />
          <ToastContainer theme='light' />
        </Container>
        <BusinessSettingsDashboardPrompt />
      </body>
    </html>
  );
}
