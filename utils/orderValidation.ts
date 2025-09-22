/**
 * Order Validation Utilities
 * Contains functions to validate order calculations and data integrity
 */

export interface OrderItem {
  id: string;
  itemName: string;
  price: number;
  count: number;
  packingCost: number;
  isPacked?: boolean;
}

export interface OrderCalculation {
  subtotal: number;
  packingCosts: number;
  vatAmount: number;
  additionalCost: number;
  finalTotal: number;
}

/**
 * Calculate order totals with detailed breakdown
 */
export const calculateOrderTotals = (
  selectedItems: OrderItem[],
  additionalCost: number = 0,
  vatRate: number = 0.075 // 7.5%
): OrderCalculation => {
  if (!Array.isArray(selectedItems)) {
    throw new Error('Selected items must be an array');
  }

  let subtotal = 0;
  let packingCosts = 0;

  selectedItems.forEach(item => {
    if (!item || typeof item.price !== 'number' || typeof item.count !== 'number') {
      throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
    }

    const itemTotal = item.price * item.count;
    const itemPackingCost = item.isPacked
      ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
      : 0;

    subtotal += itemTotal;
    packingCosts += itemPackingCost;
  });

  const baseSubtotal = subtotal + packingCosts;
  const vatAmount = baseSubtotal * vatRate;
  const finalTotal = baseSubtotal + vatAmount + additionalCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    packingCosts: Math.round(packingCosts * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    additionalCost: Math.round(additionalCost * 100) / 100,
    finalTotal: Math.round(finalTotal * 100) / 100,
  };
};

/**
 * Validate order data before submission
 */
export const validateOrderData = (orderData: {
  selectedItems: OrderItem[];
  placedByName: string;
  placedByPhoneNumber: string;
  quickResponseID: string;
  totalAmount: number;
  additionalCost?: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate required fields
  if (!orderData.placedByName?.trim()) {
    errors.push('Customer name is required');
  }

  if (!orderData.placedByPhoneNumber?.trim()) {
    errors.push('Customer phone number is required');
  }

  if (!orderData.quickResponseID?.trim()) {
    errors.push('Table/QR selection is required');
  }

  // Validate phone number format
  const phoneRegex = /^\d{10,11}$/;
  if (orderData.placedByPhoneNumber && !phoneRegex.test(orderData.placedByPhoneNumber)) {
    errors.push('Phone number must be 10-11 digits');
  }

  // Validate selected items
  if (!Array.isArray(orderData.selectedItems) || orderData.selectedItems.length === 0) {
    errors.push('At least one item must be selected');
  }

  // Validate each item
  orderData.selectedItems?.forEach((item, index) => {
    if (!item.id) {
      errors.push(`Item ${index + 1}: ID is required`);
    }
    if (!item.itemName?.trim()) {
      errors.push(`Item ${index + 1}: Name is required`);
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      errors.push(`Item ${index + 1}: Valid price is required`);
    }
    if (typeof item.count !== 'number' || item.count < 1) {
      errors.push(`Item ${index + 1}: Valid quantity is required`);
    }
    if (item.isPacked && (typeof item.packingCost !== 'number' || item.packingCost < 0)) {
      errors.push(`Item ${index + 1}: Valid packing cost is required for packed items`);
    }
  });

  // Validate total calculation
  try {
    const calculation = calculateOrderTotals(
      orderData.selectedItems,
      orderData.additionalCost || 0
    );

    const expectedTotal = calculation.finalTotal;
    const actualTotal = orderData.totalAmount;

    // Allow for small floating point differences
    if (Math.abs(expectedTotal - actualTotal) > 0.01) {
      errors.push(
        `Total amount mismatch: expected ${expectedTotal}, got ${actualTotal}`
      );
    }
  } catch (error) {
    errors.push(`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate API response structure
 */
export const validateApiResponse = (response: any): {
  isValid: boolean;
  hasData: boolean;
  hasErrors: boolean;
  errorMessage?: string;
} => {
  if (!response || typeof response !== 'object') {
    return {
      isValid: false,
      hasData: false,
      hasErrors: false,
      errorMessage: 'Invalid response format'
    };
  }

  const hasData = 'data' in response && response.data && typeof response.data === 'object';
  const hasErrors = 'errors' in response && response.errors && typeof response.errors === 'object';

  let errorMessage: string | undefined;
  if (hasData && response.data.error) {
    errorMessage = response.data.error;
  } else if (hasErrors) {
    // Extract first error from validation errors
    const firstError = Object.values(response.errors).find(error =>
      Array.isArray(error) && error.length > 0
    ) as string[] | undefined;
    errorMessage = firstError?.[0];
  }

  return {
    isValid: hasData || hasErrors,
    hasData,
    hasErrors,
    errorMessage
  };
};

/**
 * Generate mock order data for testing
 */
export const generateMockOrderData = (overrides: Partial<OrderItem> = {}): OrderItem[] => {
  const defaultItem: OrderItem = {
    id: 'item-1',
    itemName: 'Test Item',
    price: 1500, // ₦15.00
    count: 2,
    packingCost: 200, // ₦2.00
    isPacked: true,
    ...overrides
  };

  return [defaultItem];
};

/**
 * Test order calculations with various scenarios
 */
export const runCalculationTests = (): { passed: number; failed: number; results: any[] } => {
  const tests = [
    {
      name: 'Basic calculation without packing',
      items: [{ id: '1', itemName: 'Item 1', price: 1000, count: 2, packingCost: 0, isPacked: false }],
      additionalCost: 0,
      expected: { subtotal: 2000, packingCosts: 0, vatAmount: 150, finalTotal: 2150 }
    },
    {
      name: 'Calculation with packing cost',
      items: [{ id: '1', itemName: 'Item 1', price: 1000, count: 2, packingCost: 100, isPacked: true }],
      additionalCost: 0,
      expected: { subtotal: 2000, packingCosts: 200, vatAmount: 165, finalTotal: 2365 }
    },
    {
      name: 'Calculation with additional cost',
      items: [{ id: '1', itemName: 'Item 1', price: 1000, count: 1, packingCost: 0, isPacked: false }],
      additionalCost: 500,
      expected: { subtotal: 1000, packingCosts: 0, vatAmount: 75, finalTotal: 1575 }
    }
  ];

  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      const result = calculateOrderTotals(test.items as OrderItem[], test.additionalCost);
      const matches = Object.keys(test.expected).every(key =>
        Math.abs(result[key as keyof OrderCalculation] - test.expected[key as keyof typeof test.expected]) < 0.01
      );

      if (matches) {
        passed++;
        results.push({ test: test.name, status: 'PASSED', result });
      } else {
        failed++;
        results.push({ test: test.name, status: 'FAILED', expected: test.expected, actual: result });
      }
    } catch (error) {
      failed++;
      results.push({ test: test.name, status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return { passed, failed, results };
};