import { Providers } from '@/utilities/providers';
import { inter } from '@/utilities/ui-config/fonts';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import './globals.css';

import { AppProvider } from '@/hooks/globalProvider';

import QueryProvider from '@/hooks/queryProvider';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Hobink',
  description: 'Streamline your business processes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.className} `} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AppProvider>
            <Providers>
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
            </Providers>
          </AppProvider>{' '}
        </QueryProvider>
      </body>
    </html>
  );
}
