'use client'
import MenuList from '@/components/ui/dashboard/orders/place-order/menuList';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';

const DynamicMetaTag = dynamic(() => import('@/components/dynamicMetaTag'), {
  ssr: false,
});

const PlaceOrder = () => {
  const { userRolePermissions, role, isLoading: isPermissionsLoading } = usePermission();
  const router = useRouter();

  // Check permissions before rendering
  useEffect(() => {
    if (!isPermissionsLoading && role !== 0 && !userRolePermissions?.canCreateOrder) {
      router.push('/dashboard/unauthorized');
    }
  }, [isPermissionsLoading, role, userRolePermissions, router]);

  // Check if user has permission to create orders
  if (role !== 0 && !userRolePermissions?.canCreateOrder) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading menu...</div>}>
        <MenuList />
      </Suspense>
      <DynamicMetaTag
        route='Place Order'
        description='Select items from the menu to place order'
      />
    </>
  );
};

export default PlaceOrder;
