'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Wand2, RefreshCw, Ruler } from 'lucide-react';

interface TabDef {
  label: string;
  href: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
}

const ITEMS_ROOT = '/dashboard/inventory/items';

const TABS: TabDef[] = [
  {
    label: 'Items',
    href: ITEMS_ROOT,
    icon: <FileText className="w-4 h-4" />,
    match: (pathname) => pathname === ITEMS_ROOT,
  },
  {
    label: 'Hobwise Wizard',
    href: `${ITEMS_ROOT}/wizard`,
    icon: <Wand2 className="w-4 h-4" />,
    match: (pathname) => pathname.startsWith(`${ITEMS_ROOT}/wizard`),
  },
  {
    label: 'Sync Menu Item',
    href: `${ITEMS_ROOT}/sync-menu`,
    icon: <RefreshCw className="w-4 h-4" />,
    match: (pathname) => pathname.startsWith(`${ITEMS_ROOT}/sync-menu`),
  },
  {
    label: 'Customize Measurements',
    href: `${ITEMS_ROOT}/measurements`,
    icon: <Ruler className="w-4 h-4" />,
    match: (pathname) => pathname.startsWith(`${ITEMS_ROOT}/measurements`),
  },
];

const InventoryItemsTabs: React.FC = () => {
  const pathname = usePathname() ?? '';

  return (
    <div className="bg-white rounded-xl px-3 py-2 mb-6">
      <nav
        aria-label="Inventory items sections"
        className="flex flex-wrap items-center gap-1"
      >
        {TABS.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-[#5F35D2]/10 text-[#5F35D2]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default InventoryItemsTabs;
