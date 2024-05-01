import Container from '@/components/dashboardContainer';
import MenuList from '@/components/ui/dashboard/orders/place-order/menuList';
import React from 'react';

export const metadata = {
  title: 'Hobink | Place Order',
  description: ' Select items from the menu to place order',
};

const PlaceOrder = () => {
  return (
    <Container>
      <MenuList />
    </Container>
  );
};

export default PlaceOrder;
