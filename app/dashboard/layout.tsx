import { inter } from '@/utilities/ui-config/fonts';

import Container from '@/components/dashboardContainer';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Hobink | Dashboard',
  description: 'Streamline your business processes',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.className} `} suppressHydrationWarning>
      <body>
        <Container>{children}</Container>
      </body>
    </html>
  );
}
