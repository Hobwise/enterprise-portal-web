import { AppProvider } from '@/hooks/globalProvider';

import QueryProvider from '@/hooks/queryProvider';
import { Providers } from '@/utilities/providers';
import { inter } from '@/utilities/ui-config/fonts';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { companyInfo } from '../lib/companyInfo';
import './globals.css';
import '@/public/fonts/satoshi/stylesheet.css';
import '@/public/fonts/satoshi/stylesheet.css';

export const metadata = {
  title: companyInfo.name,
  description: 'Streamline your business processes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className}`} suppressHydrationWarning>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap" rel="stylesheet"></link>

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
              <ToastContainer theme="light" />
            </Providers>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
