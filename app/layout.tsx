import { Providers } from '@/utilities/providers';
import './globals.css';
import { inter } from '@/utilities/ui-config/fonts';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from '@/hooks/globalProvider';

export const metadata = {
  title: 'Welcome to Hobink',
  description: 'Streamline your business processes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={inter.className} suppressHydrationWarning>
      <body>
        <AppProvider>
          <Providers>
            {children}
            <Toaster
              toastOptions={{
                duration: 5000,
                success: {
                  style: {
                    border: '2px solid #3a9ea5',
                  },
                },
                error: {
                  style: {
                    border: '2px solid #eb5757',
                  },
                },
              }}
            />
            <ToastContainer theme='light' />
          </Providers>
        </AppProvider>
      </body>
    </html>
  );
}
