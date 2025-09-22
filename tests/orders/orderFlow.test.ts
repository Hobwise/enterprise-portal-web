/**
 * Order Flow Integration Tests
 * Tests the complete order creation and management flow
 */

import {
  calculateOrderTotals,
  validateOrderData,
  validateApiResponse,
  generateMockOrderData,
  runCalculationTests,
  OrderItem
} from '../../utils/orderValidation';

// Mock API responses
const mockSuccessResponse = {
  data: {
    isSuccessful: true,
    data: {
      id: 'order-123'
    }
  }
};

const mockErrorResponse = {
  data: {
    isSuccessful: false,
    error: 'Invalid order data'
  }
};

const mockValidationErrorResponse = {
  errors: {
    placedByName: ['Name is required'],
    placedByPhoneNumber: ['Phone number is required']
  }
};

/**
 * Test order calculation functionality
 */
export const testOrderCalculations = (): {
  passed: number;
  failed: number;
  details: string[];
} => {
  const details: string[] = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Basic calculation
  try {
    const items: OrderItem[] = [
      {
        id: '1',
        itemName: 'Rice',
        price: 2000,
        count: 2,
        packingCost: 100,
        isPacked: false
      }
    ];

    const result = calculateOrderTotals(items, 0);
    const expected = {
      subtotal: 4000,
      packingCosts: 0,
      vatAmount: 300,
      finalTotal: 4300
    };

    if (Math.abs(result.finalTotal - expected.finalTotal) < 0.01) {
      passed++;
      details.push('✓ Basic calculation test passed');
    } else {
      failed++;
      details.push(`✗ Basic calculation test failed: expected ${expected.finalTotal}, got ${result.finalTotal}`);
    }
  } catch (error) {
    failed++;
    details.push(`✗ Basic calculation test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 2: Calculation with packing
  try {
    const items: OrderItem[] = [
      {
        id: '1',
        itemName: 'Rice',
        price: 2000,
        count: 2,
        packingCost: 100,
        isPacked: true
      }
    ];

    const result = calculateOrderTotals(items, 0);
    const expected = {
      subtotal: 4000,
      packingCosts: 200,
      vatAmount: 315,
      finalTotal: 4515
    };

    if (Math.abs(result.finalTotal - expected.finalTotal) < 0.01) {
      passed++;
      details.push('✓ Packing calculation test passed');
    } else {
      failed++;
      details.push(`✗ Packing calculation test failed: expected ${expected.finalTotal}, got ${result.finalTotal}`);
    }
  } catch (error) {
    failed++;
    details.push(`✗ Packing calculation test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 3: Multiple items with mixed packing
  try {
    const items: OrderItem[] = [
      {
        id: '1',
        itemName: 'Rice',
        price: 2000,
        count: 1,
        packingCost: 100,
        isPacked: true
      },
      {
        id: '2',
        itemName: 'Beans',
        price: 1500,
        count: 2,
        packingCost: 50,
        isPacked: false
      }
    ];

    const result = calculateOrderTotals(items, 500); // Additional cost
    // Subtotal: 2000 + (1500 * 2) = 5000
    // Packing: 100 (only first item)
    // Base: 5100
    // VAT: 5100 * 0.075 = 382.5
    // Total: 5100 + 382.5 + 500 = 5982.5

    if (Math.abs(result.finalTotal - 5982.5) < 0.01) {
      passed++;
      details.push('✓ Multiple items with additional cost test passed');
    } else {
      failed++;
      details.push(`✗ Multiple items test failed: expected 5982.5, got ${result.finalTotal}`);
    }
  } catch (error) {
    failed++;
    details.push(`✗ Multiple items test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { passed, failed, details };
};

/**
 * Test order validation functionality
 */
export const testOrderValidation = (): {
  passed: number;
  failed: number;
  details: string[];
} => {
  const details: string[] = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Valid order data
  try {
    const validOrderData = {
      selectedItems: generateMockOrderData(),
      placedByName: 'John Doe',
      placedByPhoneNumber: '08012345678',
      quickResponseID: 'table-1',
      totalAmount: 3440, // Calculated total for mock data
      additionalCost: 0
    };

    const validation = validateOrderData(validOrderData);
    if (validation.isValid) {
      passed++;
      details.push('✓ Valid order data test passed');
    } else {
      failed++;
      details.push(`✗ Valid order data test failed: ${validation.errors.join(', ')}`);
    }
  } catch (error) {
    failed++;
    details.push(`✗ Valid order data test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 2: Invalid order data - missing name
  try {
    const invalidOrderData = {
      selectedItems: generateMockOrderData(),
      placedByName: '',
      placedByPhoneNumber: '08012345678',
      quickResponseID: 'table-1',
      totalAmount: 3440,
      additionalCost: 0
    };

    const validation = validateOrderData(invalidOrderData);
    if (!validation.isValid && validation.errors.includes('Customer name is required')) {
      passed++;
      details.push('✓ Invalid order data (missing name) test passed');
    } else {
      failed++;
      details.push('✗ Invalid order data test failed: should have detected missing name');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Invalid order data test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 3: Invalid phone number format
  try {
    const invalidPhoneData = {
      selectedItems: generateMockOrderData(),
      placedByName: 'John Doe',
      placedByPhoneNumber: '123', // Invalid phone
      quickResponseID: 'table-1',
      totalAmount: 3440,
      additionalCost: 0
    };

    const validation = validateOrderData(invalidPhoneData);
    if (!validation.isValid && validation.errors.some(error => error.includes('Phone number'))) {
      passed++;
      details.push('✓ Invalid phone number test passed');
    } else {
      failed++;
      details.push('✗ Invalid phone number test failed: should have detected invalid phone format');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Invalid phone number test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 4: Total amount mismatch
  try {
    const mismatchData = {
      selectedItems: generateMockOrderData(),
      placedByName: 'John Doe',
      placedByPhoneNumber: '08012345678',
      quickResponseID: 'table-1',
      totalAmount: 1000, // Wrong total
      additionalCost: 0
    };

    const validation = validateOrderData(mismatchData);
    if (!validation.isValid && validation.errors.some(error => error.includes('Total amount mismatch'))) {
      passed++;
      details.push('✓ Total amount mismatch test passed');
    } else {
      failed++;
      details.push('✗ Total amount mismatch test failed: should have detected incorrect total');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Total amount mismatch test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { passed, failed, details };
};

/**
 * Test API response validation
 */
export const testApiResponseValidation = (): {
  passed: number;
  failed: number;
  details: string[];
} => {
  const details: string[] = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Valid success response
  try {
    const validation = validateApiResponse(mockSuccessResponse);
    if (validation.isValid && validation.hasData && !validation.hasErrors) {
      passed++;
      details.push('✓ Valid success response test passed');
    } else {
      failed++;
      details.push('✗ Valid success response test failed');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Valid success response test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 2: Valid error response
  try {
    const validation = validateApiResponse(mockErrorResponse);
    if (validation.isValid && validation.hasData && validation.errorMessage === 'Invalid order data') {
      passed++;
      details.push('✓ Valid error response test passed');
    } else {
      failed++;
      details.push('✗ Valid error response test failed');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Valid error response test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 3: Validation error response
  try {
    const validation = validateApiResponse(mockValidationErrorResponse);
    if (validation.isValid && validation.hasErrors && !validation.hasData) {
      passed++;
      details.push('✓ Validation error response test passed');
    } else {
      failed++;
      details.push('✗ Validation error response test failed');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Validation error response test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 4: Invalid response
  try {
    const validation = validateApiResponse(null);
    if (!validation.isValid) {
      passed++;
      details.push('✓ Invalid response test passed');
    } else {
      failed++;
      details.push('✗ Invalid response test failed: should have detected invalid response');
    }
  } catch (error) {
    failed++;
    details.push(`✗ Invalid response test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { passed, failed, details };
};

/**
 * Run all order flow tests
 */
export const runAllTests = (): {
  totalPassed: number;
  totalFailed: number;
  results: Array<{
    category: string;
    passed: number;
    failed: number;
    details: string[];
  }>;
} => {
  const calculationTests = testOrderCalculations();
  const validationTests = testOrderValidation();
  const apiTests = testApiResponseValidation();
  const utilityTests = runCalculationTests();

  const results = [
    {
      category: 'Order Calculations',
      passed: calculationTests.passed,
      failed: calculationTests.failed,
      details: calculationTests.details
    },
    {
      category: 'Order Validation',
      passed: validationTests.passed,
      failed: validationTests.failed,
      details: validationTests.details
    },
    {
      category: 'API Response Validation',
      passed: apiTests.passed,
      failed: apiTests.failed,
      details: apiTests.details
    },
    {
      category: 'Utility Tests',
      passed: utilityTests.passed,
      failed: utilityTests.failed,
      details: utilityTests.results.map(r =>
        r.status === 'PASSED'
          ? `✓ ${r.test}`
          : `✗ ${r.test}: ${r.error || 'Failed'}`
      )
    }
  ];

  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);

  return {
    totalPassed,
    totalFailed,
    results
  };
};

// Export for use in browser console or testing environment
if (typeof window !== 'undefined') {
  (window as any).orderTests = {
    runAllTests,
    testOrderCalculations,
    testOrderValidation,
    testApiResponseValidation,
    runCalculationTests
  };
}