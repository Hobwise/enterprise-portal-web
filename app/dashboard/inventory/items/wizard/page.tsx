'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuSummary } from '@/hooks/cachedEndpoints/useInventoryItems';
import HobwiseWizard from '@/components/ui/dashboard/inventory/wizard/HobwiseWizard';

export default function WizardPage() {
  const router = useRouter();
  const { data: menuSummaryData, isLoading: menuSummaryLoading } = useMenuSummary();

  const handleComplete = useCallback(() => {
    router.push('/dashboard/inventory/items');
  }, [router]);

  return (
    <div className="min-h-screen font-satoshi">
      <div className="max-w-7xl mx-auto space-y-6">
        <HobwiseWizard
          menuSummaryData={menuSummaryData}
          menuSummaryLoading={menuSummaryLoading}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
