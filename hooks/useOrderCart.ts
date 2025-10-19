import { useState, useCallback } from 'react';
import { Item, MenuItem, OrderSummary } from '@/app/pos/types';
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY, VAT_RATE } from '@/app/pos/constants';

export const useOrderCart = (menuItems: MenuItem[]) => {
  const [orderItems, setOrderItems] = useState<Item[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleDecrement = useCallback((id: string) => {
    if (isUpdating) return;

    setIsUpdating(true);

    setOrderItems((prevItems: Item[]) => {
      const updatedItems = prevItems
        .filter((item: Item) => !(item.id === id && item.count <= MIN_ITEM_QUANTITY))
        .map((item: Item) =>
          item.id === id
            ? { ...item, count: Math.max(MIN_ITEM_QUANTITY, item.count - 1) }
            : item
        );

      setTimeout(() => setIsUpdating(false), 100);
      return updatedItems;
    });
  }, [isUpdating]);

  const handleIncrement = useCallback((id: string) => {
    if (isUpdating) return;

    setIsUpdating(true);

    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === id);

      if (existingItem) {
        const updatedItems = prevItems.map((item) =>
          item.id === id ? { ...item, count: Math.min(item.count + 1, MAX_ITEM_QUANTITY) } : item
        );
        setTimeout(() => setIsUpdating(false), 100);
        return updatedItems;
      } else {
        const menuItem = menuItems?.find(item => item.id === id);
        if (menuItem) {
          const newItem: Item = {
            ...menuItem,
            id: menuItem.uniqueKey || menuItem.id,
            itemID: menuItem.id,
            itemName: menuItem.itemName,
            menuName: menuItem.menuName,
            itemDescription: menuItem.itemDescription || '',
            price: menuItem.price,
            currency: menuItem.currency,
            isAvailable: menuItem.isAvailable,
            hasVariety: menuItem.hasVariety,
            image: menuItem.image || '',
            isVariety: menuItem.isVariety || false,
            varieties: menuItem.varieties || null,
            count: 1,
            isPacked: false,
            packingCost: menuItem.packingCost || 0,
            isVatEnabled: menuItem.isVatEnabled,
            vatRate: menuItem.vatRate,
          };
          setTimeout(() => setIsUpdating(false), 100);
          return [...prevItems, newItem];
        }
        setTimeout(() => setIsUpdating(false), 100);
        return prevItems;
      }
    });
  }, [isUpdating, menuItems]);

  const handlePackingCost = useCallback((itemId: string, isPacked: boolean) => {
    if (isUpdating) return;

    setOrderItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const menuItem = menuItems?.find((menu: any) => menu.id === item.itemID);
          return {
            ...item,
            isPacked,
            packingCost: menuItem?.packingCost ?? item.packingCost
          };
        }
        return item;
      })
    );
  }, [isUpdating, menuItems]);

  const addItemToCart = useCallback((item: MenuItem) => {
    const cartItemId = item.uniqueKey || item.id;
    const existingItem = orderItems.find((orderItem: Item) => orderItem.id === cartItemId);

    if (existingItem) {
      handleIncrement(existingItem.id);
    } else {
      const newItem: Item = {
        id: cartItemId,
        itemID: item.id,
        itemName: item.itemName,
        menuName: item.menuName,
        itemDescription: item.itemDescription || '',
        price: item.price,
        currency: item.currency,
        isAvailable: item.isAvailable,
        hasVariety: item.hasVariety,
        image: item.image || '',
        isVariety: item.isVariety || false,
        varieties: item.varieties || null,
        count: 1,
        packingCost: item.packingCost || 0,
        isPacked: item.isPacked || false,
        isVatEnabled: item.isVatEnabled,
        vatRate: item.vatRate,
      };
      setOrderItems((prev) => [...prev, newItem]);
    }
  }, [orderItems, handleIncrement]);

  const clearCart = useCallback(() => {
    setOrderItems([]);
  }, []);

  const calculateOrderSummary = useCallback((): OrderSummary => {
    let subtotal = 0;
    let vatAmount = 0;

    orderItems.forEach((item) => {
      const itemTotal = item.price * item.count;
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      const itemSubtotal = itemTotal + packingTotal;

      subtotal += itemSubtotal;

      // Apply VAT only if enabled for this item's section
      if (item.isVatEnabled && item.vatRate && item.vatRate > 0) {
        vatAmount += itemSubtotal * item.vatRate;
      }
    });

    const total = subtotal + vatAmount;
    const itemCount = orderItems.reduce((sum, item) => sum + item.count, 0);

    return { subtotal, vatAmount, total, itemCount };
  }, [orderItems]);

  return {
    orderItems,
    isUpdating,
    handleDecrement,
    handleIncrement,
    handlePackingCost,
    addItemToCart,
    clearCart,
    calculateOrderSummary,
  };
};
