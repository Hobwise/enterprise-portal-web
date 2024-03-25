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
            <Toaster />
            <ToastContainer theme='colored' />
          </Providers>
        </AppProvider>
      </body>
    </html>
  );
}
