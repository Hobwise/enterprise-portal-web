#!/usr/bin/env ts-node

/**
 * Order Data Validation Script
 * Run this script to validate order data integrity and perform calculation checks
 *
 * Usage:
 * npx ts-node scripts/validateOrderData.ts
 *
 * Or in browser console:
 * Run the tests available in window.orderTests
 */

import { runAllTests } from '../tests/orders/orderFlow.test';
import { calculateOrderTotals, validateOrderData, OrderItem } from '../utils/orderValidation';

/**
 * Console colors for better output readability
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Format console output with colors
 */
const log = {
  info: (message: string) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`),
  success: (message: string) => console.log(`${colors.green}✓ ${message}${colors.reset}`),
  error: (message: string) => console.log(`${colors.red}✗ ${message}${colors.reset}`),
  warning: (message: string) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`),
  header: (message: string) => console.log(`${colors.bright}${colors.cyan}${message}${colors.reset}`),
  separator: () => console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

/**
 * Validate a sample order calculation manually
 */
const validateSampleOrder = (): boolean => {
  log.info('Validating sample order calculation...');

  const sampleItems: OrderItem[] = [
    {
      id: 'item-1',
      itemName: 'Jollof Rice',
      price: 2500, // ₦25.00
      count: 2,
      packingCost: 150, // ₦1.50
      isPacked: true
    },
    {
      id: 'item-2',
      itemName: 'Fried Chicken',
      price: 3000, // ₦30.00
      count: 1,
      packingCost: 200, // ₦2.00
      isPacked: false
    }
  ];

  const additionalCost = 500; // ₦5.00

  try {
    const calculation = calculateOrderTotals(sampleItems, additionalCost);

    // Expected calculation:
    // Item 1: 2500 * 2 = 5000, packing: 150 * 2 = 300 (packed)
    // Item 2: 3000 * 1 = 3000, packing: 0 (not packed)
    // Subtotal: 5000 + 3000 = 8000
    // Packing: 300
    // Base: 8300
    // VAT: 8300 * 0.075 = 622.5
    // Total: 8300 + 622.5 + 500 = 9422.5

    const expected = {
      subtotal: 8000,
      packingCosts: 300,
      vatAmount: 622.5,
      finalTotal: 9422.5
    };

    log.info(`Calculated subtotal: ₦${(calculation.subtotal / 100).toFixed(2)}`);
    log.info(`Calculated packing costs: ₦${(calculation.packingCosts / 100).toFixed(2)}`);
    log.info(`Calculated VAT: ₦${(calculation.vatAmount / 100).toFixed(2)}`);
    log.info(`Calculated total: ₦${(calculation.finalTotal / 100).toFixed(2)}`);

    const isValid = Math.abs(calculation.finalTotal - expected.finalTotal) < 0.01;

    if (isValid) {
      log.success('Sample order calculation is correct');
    } else {
      log.error(`Sample order calculation failed: expected ${expected.finalTotal}, got ${calculation.finalTotal}`);
    }

    return isValid;
  } catch (error) {
    log.error(`Sample order validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

/**
 * Test edge cases for order calculations
 */
const testEdgeCases = (): { passed: number; total: number } => {
  log.info('Testing edge cases...');

  const tests = [
    {
      name: 'Zero price item',
      test: () => {
        const items: OrderItem[] = [{
          id: '1', itemName: 'Free Item', price: 0, count: 1, packingCost: 0, isPacked: false
        }];
        const result = calculateOrderTotals(items);
        return result.finalTotal === 0;
      }
    },
    {
      name: 'High quantity',
      test: () => {
        const items: OrderItem[] = [{
          id: '1', itemName: 'Bulk Item', price: 100, count: 999, packingCost: 10, isPacked: true
        }];
        const result = calculateOrderTotals(items);
        // 100 * 999 = 99900, packing: 10 * 999 = 9990, base: 109890, vat: 8241.75, total: 118131.75
        return Math.abs(result.finalTotal - 118131.75) < 0.01;
      }
    },
    {
      name: 'Fractional prices',
      test: () => {
        const items: OrderItem[] = [{
          id: '1', itemName: 'Fractional Price', price: 1250.5, count: 2, packingCost: 75.25, isPacked: true
        }];
        const result = calculateOrderTotals(items);
        // 1250.5 * 2 = 2501, packing: 75.25 * 2 = 150.5, base: 2651.5, vat: 198.86, total: 2850.36
        return Math.abs(result.finalTotal - 2850.36) < 0.01;
      }
    },
    {
      name: 'Negative packing cost (should be treated as 0)',
      test: () => {
        const items: OrderItem[] = [{
          id: '1', itemName: 'Negative Packing', price: 1000, count: 1, packingCost: -100, isPacked: true
        }];
        const result = calculateOrderTotals(items);
        // Should treat negative packing cost as 0
        return result.packingCosts === 0;
      }
    },
    {
      name: 'Empty items array',
      test: () => {
        try {
          const result = calculateOrderTotals([]);
          return result.finalTotal === 0;
        } catch {
          return false;
        }
      }
    }
  ];

  let passed = 0;

  tests.forEach(({ name, test }) => {
    try {
      if (test()) {
        log.success(`Edge case passed: ${name}`);
        passed++;
      } else {
        log.error(`Edge case failed: ${name}`);
      }
    } catch (error) {
      log.error(`Edge case error: ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return { passed, total: tests.length };
};

/**
 * Run comprehensive validation tests
 */
const runComprehensiveTests = (): void => {
  log.header('Running Comprehensive Order Validation Tests');
  log.separator();

  // Run manual validation
  const sampleValid = validateSampleOrder();
  log.separator();

  // Run edge case tests
  const edgeResults = testEdgeCases();
  log.separator();

  // Run automated test suite
  log.info('Running automated test suite...');
  const testResults = runAllTests();

  log.separator();
  log.header('Test Results Summary');
  log.separator();

  // Summary
  const totalManualTests = 1 + edgeResults.total;
  const totalManualPassed = (sampleValid ? 1 : 0) + edgeResults.passed;
  const totalManualFailed = totalManualTests - totalManualPassed;

  log.info(`Manual Tests: ${totalManualPassed}/${totalManualTests} passed`);
  log.info(`Automated Tests: ${testResults.totalPassed}/${testResults.totalPassed + testResults.totalFailed} passed`);

  // Detailed results
  testResults.results.forEach(result => {
    log.info(`${result.category}: ${result.passed}/${result.passed + result.failed} passed`);

    if (result.failed > 0) {
      log.warning('Failed tests:');
      result.details.filter(detail => detail.includes('✗')).forEach(detail => {
        console.log(`  ${detail}`);
      });
    }
  });

  log.separator();

  const overallPassed = totalManualPassed + testResults.totalPassed;
  const overallTotal = totalManualTests + testResults.totalPassed + testResults.totalFailed;
  const successRate = ((overallPassed / overallTotal) * 100).toFixed(1);

  if (overallPassed === overallTotal) {
    log.success(`All tests passed! (${overallPassed}/${overallTotal}) - ${successRate}% success rate`);
  } else {
    log.warning(`Tests completed with ${overallTotal - overallPassed} failures - ${successRate}% success rate`);
  }

  log.separator();
};

/**
 * Instructions for running in browser
 */
const printBrowserInstructions = (): void => {
  log.header('Browser Testing Instructions');
  log.separator();
  log.info('To run these tests in the browser console:');
  log.info('1. Open your browser developer tools');
  log.info('2. Navigate to the orders page');
  log.info('3. Run: window.orderTests.runAllTests()');
  log.info('4. Or run individual test categories:');
  log.info('   - window.orderTests.testOrderCalculations()');
  log.info('   - window.orderTests.testOrderValidation()');
  log.info('   - window.orderTests.testApiResponseValidation()');
  log.separator();
};

/**
 * Main execution
 */
const main = (): void => {
  try {
    runComprehensiveTests();
    printBrowserInstructions();
  } catch (error) {
    log.error(`Script execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}

export { runComprehensiveTests, validateSampleOrder, testEdgeCases };