import { notify } from '@/lib/utils';
import { MenuItem } from './types';

export const handleQuickAddItem = (
  item: MenuItem,
  addItemToCart: (item: MenuItem) => void
) => {
  if (!item.isAvailable) {
    notify({
      title: 'Unavailable',
      text: 'This item is currently unavailable',
      type: 'error'
    });
    return;
  }

  addItemToCart(item);
};

export const handleAddItemWithPacking = (
  item: MenuItem,
  includePacking: boolean,
  orderItems: any[],
  setOrderItems: (items: any) => void,
  addItemToCart: (item: MenuItem) => void
) => {
  if (!item.isAvailable) {
    notify({
      title: 'Unavailable',
      text: 'This item is currently unavailable',
      type: 'error'
    });
    return;
  }

  const cartItemId = item.uniqueKey || item.id;
  const existingItem = orderItems.find((orderItem: any) => orderItem.id === cartItemId);

  if (existingItem) {
    setOrderItems(
      orderItems.map((orderItem: any) =>
        orderItem.id === cartItemId
          ? { ...orderItem, isPacked: includePacking, count: orderItem.count + 1 }
          : orderItem
      )
    );
  } else {
    addItemToCart(item);
    if (includePacking) {
      setTimeout(() => {
        setOrderItems((prev: any[]) =>
          prev.map((orderItem: any) =>
            orderItem.id === cartItemId
              ? { ...orderItem, isPacked: true }
              : orderItem
          )
        );
      }, 0);
    }
  }

  notify({
    title: 'Added to cart',
    text: `${item.itemName} added to cart${includePacking ? ' with packing' : ''}`,
    type: 'success'
  });
};
