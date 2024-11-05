import { AppProvider } from '@/hooks/globalProvider';

import QueryProvider from '@/hooks/queryProvider';
import { Providers } from '@/utilities/providers';
import { bricolage_grotesque, inter } from '@/utilities/ui-config/fonts';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { companyInfo } from '../lib/companyInfo';
import './globals.css';
import '@/public/fonts/satoshi/stylesheet.css';
import '@/public/fonts/satoshi/stylesheet.css';
import '@fontsource/bricolage-grotesque'; // Defaults to weight 400
import '@fontsource/bricolage-grotesque/400.css';
import '@fontsource/bricolage-grotesque/500.css';
import '@fontsource/bricolage-grotesque/700.css';

export const metadata = {
  title: companyInfo.name,
  description: 'Streamline your business processes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} ${bricolage_grotesque.className}`} suppressHydrationWarning>
      {/* <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" /> */}
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
