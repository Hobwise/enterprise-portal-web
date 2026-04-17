'use client';

import {
  useIngredients,
  useSuppliers,
  useUnitsByBusiness,
} from '@/hooks/cachedEndpoints/useInventoryItems';

function InventoryLovPrefetch() {
  useIngredients();
  useUnitsByBusiness();
  useSuppliers();
  return null;
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InventoryLovPrefetch />
      {children}
    </>
  );
}
