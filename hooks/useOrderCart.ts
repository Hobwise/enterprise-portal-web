import { useState, useCallback } from 'react';
import { Item, MenuItem, OrderSummary } from '@/app/pos/types';
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY } from '@/app/pos/constants';

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

  const handleIncrement = useCallback((id: string, amount: number = 1) => {
    if (isUpdating) return;

    setIsUpdating(true);

    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === id);

      if (existingItem) {
        const updatedItems = prevItems.map((item) =>
          item.id === id ? { ...item, count: Math.min(item.count + amount, MAX_ITEM_QUANTITY) } : item
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

  const addItemToCart = useCallback((item: MenuItem, quantity: number = 1) => {
    // Check if item already exists in cart, matching by distinct itemID and packing status
    // valid itemID check is crucial to merge items from different categories/menus
    const existingItem = orderItems.find((orderItem: Item) => 
      orderItem.itemID === item.id && 
      (orderItem.isPacked || false) === (item.isPacked || false)
    );

    if (existingItem) {
      handleIncrement(existingItem.id, quantity);
    } else {
      let cartItemId = item.uniqueKey || item.id;
      
      // Ensure strict uniqueness of cartItemId in the orderItems array
      // If an item with this ID already exists (which implies a variant mismatch since we are in the else block),
      // we must generate a new unique ID for this new row.
      if (orderItems.some((i) => i.id === cartItemId)) {
        cartItemId = `${cartItemId}-${
          item.isPacked ? "packed" : "unpacked"
        }-${Date.now()}`;
      }
      
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
        count: quantity,
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
    let itemsSubtotal = 0;
    let packingSubtotal = 0;

    orderItems.forEach((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemCount = Number(item.count) || 0;
      const itemTotal = Math.round(itemPrice * itemCount * 100) / 100;
      itemsSubtotal += itemTotal;

      if (item.isPacked && item.packingCost > 0) {
        const packingCostPerItem = Number(item.packingCost) || 0;
        const packingTotal = Math.round(packingCostPerItem * itemCount * 100) / 100;
        packingSubtotal += packingTotal;
      }
    });

    itemsSubtotal = Math.round(itemsSubtotal * 100) / 100;
    packingSubtotal = Math.round(packingSubtotal * 100) / 100;

    let vatAmount = 0;
    const vatSourceItem = orderItems.find(
      (item) => item.isVatEnabled && item.vatRate && item.vatRate > 0
    );

    if (vatSourceItem) {
      const vatRateDecimal = vatSourceItem.vatRate / 100;
      const totalSubtotal = itemsSubtotal + packingSubtotal;
      vatAmount = Math.round(totalSubtotal * vatRateDecimal * 100) / 100;
    }

    const subtotal = Math.round((itemsSubtotal + packingSubtotal) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
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
