/**
 * Order Testing Panel Component
 * Provides a UI for running order validation tests in development
 */

"use client";

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Divider } from '@nextui-org/react';
import { OrderTestRunner } from '@/utils/testRunner';
import { CustomButton } from '@/components/customButton';

interface TestResult {
  success: boolean;
  totalPassed: number;
  totalFailed: number;
  results: any[];
  summary: string;
}

export const OrderTestingPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [quickCheckResult, setQuickCheckResult] = useState<boolean | null>(null);

  const testRunner = new OrderTestRunner();

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await testRunner.runTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickCheck = () => {
    const result = testRunner.quickCheck();
    setQuickCheckResult(result);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-bold">Order Management Testing Panel</p>
          <p className="text-small text-default-500">
            Development tools for validating order calculations and data flow
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <CustomButton
              onClick={runQuickCheck}
              className="px-4 py-2"
              backgroundColor="bg-blue-600"
            >
              Quick Check
            </CustomButton>
            <CustomButton
              onClick={runTests}
              loading={isRunning}
              disabled={isRunning}
              className="px-4 py-2 text-white"
              backgroundColor="bg-green-600"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </CustomButton>
            <CustomButton
              onClick={() => {
                const result = testRunner.testCurrentPageOrder();
                console.log('Current page test result:', result);
                alert(result.message);
              }}
              className="px-4 py-2"
              backgroundColor="bg-purple-600"
            >
              Test Current Page
            </CustomButton>
          </div>

          {/* Quick Check Result */}
          {quickCheckResult !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quick Check:</span>
              <Chip
                color={quickCheckResult ? 'success' : 'danger'}
                variant="flat"
                size="sm"
              >
                {quickCheckResult ? 'PASS' : 'FAIL'}
              </Chip>
            </div>
          )}

          {/* Test Results */}
          {testResults && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Test Results:</span>
                <Chip
                  color={testResults.success ? 'success' : 'warning'}
                  variant="flat"
                  size="sm"
                >
                  {testResults.totalPassed}/{testResults.totalPassed + testResults.totalFailed} Passed
                </Chip>
              </div>

              <div className="text-sm">
                <p className={testResults.success ? 'text-green-600' : 'text-yellow-600'}>
                  {testResults.summary}
                </p>
              </div>

              {/* Detailed Results */}
              {testResults.results.map((category, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{category.category}</h4>
                    <div className="flex gap-2">
                      <Chip color="success" variant="flat" size="sm">
                        ✓ {category.passed}
                      </Chip>
                      {category.failed > 0 && (
                        <Chip color="danger" variant="flat" size="sm">
                          ✗ {category.failed}
                        </Chip>
                      )}
                    </div>
                  </div>
                  {category.details.length > 0 && (
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {category.details.map((detail: string, idx: number) => (
                        <div
                          key={idx}
                          className={`${
                            detail.includes('✓')
                              ? 'text-green-600'
                              : detail.includes('✗')
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Browser Console Commands:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <div><code>runOrderTests()</code> - Run all validation tests</div>
              <div><code>quickOrderCheck()</code> - Quick sanity check</div>
              <div><code>testCurrentOrder()</code> - Test current page order</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrderTestingPanel;