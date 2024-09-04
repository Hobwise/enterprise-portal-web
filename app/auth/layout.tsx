import { inter } from '@/utilities/ui-config/fonts';

import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Hobink | Onboarding',
  description: 'Streamline your business processes',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.className} `} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
