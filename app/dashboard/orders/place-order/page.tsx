'use client'
import MenuList from '@/components/ui/dashboard/orders/place-order/menuList';
import dynamic from 'next/dynamic';

const DynamicMetaTag = dynamic(() => import('@/components/dynamicMetaTag'), {
  ssr: false,
});

const PlaceOrder = () => {
  return (
    <>
      <MenuList />
      <DynamicMetaTag
        route='Place Order'
        description='Select items from the menu to place order'
      />
    </>
  );
};

export default PlaceOrder;
