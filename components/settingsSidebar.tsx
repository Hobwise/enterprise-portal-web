'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const lists = [
  {
    title: 'Personal Information',
    href: '/dashboard/settings/personal-information',
  },
  { title: 'Password Management', href: '/dashboard/settings/password-management' },
  {
    title: 'Business Information',
    href: '/dashboard/settings/business-information',
  },
  { title: 'Kyc Compliance', href: '/dashboard/settings/kyc-compliance' },
  {
    title: 'Billing & Subscription',
    href: '/dashboard/settings/subscriptions',
  },
//   { title: 'Staff Management', href: '/dashboard/settings/staff-management' },
//   { title: 'Business Settings', href: '/dashboard/settings/bussiness' },
];

const SettingsSidebar = () => {
  const pathname = usePathname();

  return (
    <ul className="col-span-3 border inline-flex flex-col border-secondaryGrey p-3 rounded-lg h-fit">
      {lists.map((item) => (
        <li
          key={item.href}
          className={cn(
            'font-bold p-4 rounded-[4px] text-sm text-[#98A2B3] hover:bg-[#F0F2F5] hover:text-[#1D2739] duration-200',
            {
              'bg-[#F0F2F5] text-[#1D2739]': pathname.startsWith(
                item.href.split('?')[0]
              ),
            }
          )}
        >
          <Link href={item.href}>{item.title}</Link>
        </li>
      ))}
    </ul>
  );
};

export default SettingsSidebar;
