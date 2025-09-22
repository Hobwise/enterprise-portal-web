/**
 * Test Runner for Order Management System
 * Provides utilities to run tests in browser environment
 */

import { runAllTests } from '../tests/orders/orderFlow.test';
import { calculateOrderTotals, validateOrderData } from './orderValidation';

/**
 * Browser-safe test runner
 */
export class OrderTestRunner {
  private results: any[] = [];

  /**
   * Run all order validation tests
   */
  async runTests(): Promise<{
    success: boolean;
    totalPassed: number;
    totalFailed: number;
    results: any[];
    summary: string;
  }> {
    console.log('🚀 Starting Order Management Tests...');
    console.log('=====================================');

    try {
      const testResults = runAllTests();
      this.results = testResults.results;

      // Print results to console
      testResults.results.forEach(category => {
        console.log(`\n📂 ${category.category}:`);
        console.log(`   ✅ Passed: ${category.passed}`);
        console.log(`   ❌ Failed: ${category.failed}`);

        if (category.details.length > 0) {
          category.details.forEach(detail => {
            if (detail.includes('✓')) {
              console.log(`   ${detail}`);
            } else if (detail.includes('✗')) {
              console.error(`   ${detail}`);
            }
          });
        }
      });

      const success = testResults.totalFailed === 0;
      const successRate = ((testResults.totalPassed / (testResults.totalPassed + testResults.totalFailed)) * 100).toFixed(1);

      const summary = success
        ? `🎉 All tests passed! (${testResults.totalPassed}/${testResults.totalPassed + testResults.totalFailed}) - ${successRate}% success rate`
        : `⚠️ Some tests failed. Passed: ${testResults.totalPassed}, Failed: ${testResults.totalFailed} - ${successRate}% success rate`;

      console.log('\n=====================================');
      console.log(summary);
      console.log('=====================================');

      return {
        success,
        totalPassed: testResults.totalPassed,
        totalFailed: testResults.totalFailed,
        results: testResults.results,
        summary
      };
    } catch (error) {
      const errorMessage = `❌ Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);

      return {
        success: false,
        totalPassed: 0,
        totalFailed: 1,
        results: [],
        summary: errorMessage
      };
    }
  }

  /**
   * Test a real order calculation from the current page
   */
  testCurrentPageOrder(): {
    success: boolean;
    message: string;
    details?: any;
  } {
    try {
      // Try to find order data from the current page
      const orderData = this.extractOrderDataFromPage();

      if (!orderData) {
        return {
          success: false,
          message: 'No order data found on current page. Navigate to an order page with selected items.'
        };
      }

      // Validate the order
      const validation = validateOrderData(orderData);

      if (validation.isValid) {
        const calculation = calculateOrderTotals(orderData.selectedItems, orderData.additionalCost || 0);

        return {
          success: true,
          message: 'Current page order is valid!',
          details: {
            orderData,
            calculation,
            validation
          }
        };
      } else {
        return {
          success: false,
          message: 'Current page order has validation errors',
          details: {
            errors: validation.errors,
            orderData
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error testing current page: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract order data from current page DOM
   */
  private extractOrderDataFromPage(): any {
    // This is a simplified extraction - in real implementation,
    // you would extract data from React components or DOM

    // Check for localStorage order data
    try {
      const storedOrder = localStorage.getItem('order');
      if (storedOrder) {
        return JSON.parse(storedOrder);
      }
    } catch (error) {
      console.warn('Could not parse stored order data');
    }

    // Check for checkout modal data in DOM
    const checkoutModal = document.querySelector('[data-testid="checkout-modal"]');
    if (checkoutModal) {
      // Extract order data from checkout modal
      // This would need to be implemented based on actual DOM structure
    }

    return null;
  }

  /**
   * Get detailed test results
   */
  getResults(): any[] {
    return this.results;
  }

  /**
   * Run a quick sanity check
   */
  quickCheck(): boolean {
    try {
      // Test basic calculation
      const testItems = [{
        id: '1',
        itemName: 'Test Item',
        price: 1000,
        count: 1,
        packingCost: 0,
        isPacked: false
      }];

      const result = calculateOrderTotals(testItems);
      const expected = 1075; // 1000 + (1000 * 0.075) = 1075

      return Math.abs(result.finalTotal - expected) < 0.01;
    } catch (error) {
      console.error('Quick check failed:', error);
      return false;
    }
  }
}

/**
 * Initialize test runner in browser environment
 */
export const initializeTestRunner = (): void => {
  if (typeof window !== 'undefined') {
    const testRunner = new OrderTestRunner();

    // Add to window object for easy access
    (window as any).orderTestRunner = testRunner;
    (window as any).runOrderTests = () => testRunner.runTests();
    (window as any).quickOrderCheck = () => testRunner.quickCheck();
    (window as any).testCurrentOrder = () => testRunner.testCurrentPageOrder();

    console.log('🧪 Order Test Runner initialized!');
    console.log('Available commands:');
    console.log('  - runOrderTests(): Run all tests');
    console.log('  - quickOrderCheck(): Quick sanity check');
    console.log('  - testCurrentOrder(): Test current page order');
    console.log('  - orderTestRunner: Access full test runner instance');
  }
};

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTestRunner);
  } else {
    initializeTestRunner();
  }
}