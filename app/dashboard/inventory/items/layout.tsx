'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import InventoryItemsTabs from '@/components/ui/dashboard/inventory/InventoryItemsTabs';

const ITEMS_ROOT = '/dashboard/inventory/items';
const KNOWN_TAB_SEGMENTS = ['', 'wizard', 'sync-menu', 'measurements'];

interface ItemsLayoutProps {
  children: React.ReactNode;
}

export default function ItemsLayout({ children }: ItemsLayoutProps) {
  const pathname = usePathname() ?? '';
  const rest = pathname.replace(ITEMS_ROOT, '');
  const firstSeg = rest.split('/').filter(Boolean)[0] ?? '';
  const showTabs = KNOWN_TAB_SEGMENTS.includes(firstSeg);

  return (
    <div className="max-w-7xl mx-auto">
      {showTabs && <InventoryItemsTabs />}
      {children}
    </div>
  );
}
