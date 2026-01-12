import { bricolage_grotesque } from '@/utilities/ui-config/fonts';
import { companyInfo } from '../../lib/companyInfo';

export const metadata = {
  title: `${companyInfo.name} | Onboarding`,
  description: 'Streamline your business processes',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${bricolage_grotesque.className}`}>{children}</div>;
}
