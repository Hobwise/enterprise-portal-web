import { Providers } from '@/utilities/providers';
import './globals.css';
import { inter } from '@/utilities/ui-config/fonts';

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
    <html lang='en' className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
