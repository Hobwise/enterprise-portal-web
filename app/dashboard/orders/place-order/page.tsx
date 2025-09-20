'use client'
import MenuList from '@/components/ui/dashboard/orders/place-order/menuList';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicMetaTag = dynamic(() => import('@/components/dynamicMetaTag'), {
  ssr: false,
});

const PlaceOrder = () => {
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
