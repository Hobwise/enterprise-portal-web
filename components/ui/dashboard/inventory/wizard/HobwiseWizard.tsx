'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Spinner } from '@nextui-org/react';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  InventoryItemType,
  MenuSummaryCategory,
  WizardSetupPayload,
  getInventoryWizardSetup,
  saveInventoryWizardSetup,
} from '@/app/api/controllers/dashboard/inventory';
import { useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';
import WelcomeStep from './steps/WelcomeStep';
import SyncStep from './steps/SyncStep';
import StrictnessStep from './steps/StrictnessStep';
import AddItemStep from './steps/AddItemStep';
import BuildRecipeStep from './steps/BuildRecipeStep';
import PreviewStep from './steps/PreviewStep';
import SuccessStep from './steps/SuccessStep';

type LocalRecipeDetail = {
  inventoryItemID: string;
  inventoryItemName: string;
  quantityUsed: number;
};

interface WizardData {
  inventorySyncEnabled: boolean;
  strictnessLevel: number;
  itemName: string;
  description: string;
  unitId: string;
  costPerUnit: string;
  itemType: InventoryItemType | null;
  openingStock: string;
  reorderLevel: string;
  reorderQuantity: string;
  isActive: boolean;
  allowTracking: boolean;
  supplierId: string;
  createdItemId: string | null;
  recipeDetails: LocalRecipeDetail[];
  recipeName: string;
  outputQuantity: string;
  outputQuantityUnitId: string;
  recipeType: number;
}

interface HobwiseWizardProps {
  menuSummaryData: MenuSummaryCategory[] | undefined;
  menuSummaryLoading: boolean;
  onComplete: () => void;
}

const INITIAL_WIZARD_DATA: WizardData = {
  inventorySyncEnabled: false,
  strictnessLevel: 0,
  itemName: '',
  description: '',
  unitId: '',
  costPerUnit: '',
  itemType: null,
  openingStock: '',
  reorderLevel: '',
  reorderQuantity: '',
  isActive: true,
  allowTracking: true,
  supplierId: '',
  createdItemId: null,
  recipeDetails: [],
  recipeName: '',
  outputQuantity: '1',
  outputQuantityUnitId: '',
  recipeType: 0,
};

const HobwiseWizard: React.FC<HobwiseWizardProps> = ({
  menuSummaryData,
  menuSummaryLoading,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const [restoring, setRestoring] = useState(true);
  const hasFetched = useRef(false);

  const { data: unitsByBusiness } = useUnitsByBusiness();

  // Restore saved wizard state on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const restore = async () => {
      try {
        const business = getJsonItemFromLocalStorage('business');
        const businessId = business?.[0]?.businessId;
        if (!businessId) return;

        const response = await getInventoryWizardSetup(businessId);
        const saved = response?.data?.data;

        if (saved && saved.currentStep > 0) {
          // Always start at step 1 when user opens the wizard
          const firstItem = saved.items?.[0];
          const firstRecipe = saved.recipes?.[0];
          setData((prev) => ({
            ...prev,
            inventorySyncEnabled: saved.allowInventorySync ?? prev.inventorySyncEnabled,
            strictnessLevel: saved.inventoryStrictnessLevel ?? prev.strictnessLevel,
            ...(firstItem && {
              itemName: firstItem.name ?? '',
              description: firstItem.description ?? '',
              unitId: firstItem.unitId ?? '',
              costPerUnit: firstItem.averageCostPerBaseUnit != null
                ? String(firstItem.averageCostPerBaseUnit)
                : '',
              itemType: firstItem.itemType ?? null,
              openingStock: firstItem.openingStock ? String(firstItem.openingStock) : '',
              reorderLevel: firstItem.reorderLevel ? String(firstItem.reorderLevel) : '',
              reorderQuantity: firstItem.reorderQuantity ? String(firstItem.reorderQuantity) : '',
              isActive: firstItem.isActive ?? true,
              allowTracking: firstItem.allowTracking ?? true,
              supplierId: firstItem.supplierId ?? '',
            }),
            ...(firstRecipe && {
              recipeName: firstRecipe.name ?? '',
              outputQuantity: firstRecipe.outputQuantity != null ? String(firstRecipe.outputQuantity) : '1',
              outputQuantityUnitId: firstRecipe.outputQuantityUnitId ?? '',
              recipeType: firstRecipe.recipeType ?? 0,
            }),
          }));
        }
      } catch {
        // Silently continue with defaults if restore fails
      } finally {
        setRestoring(false);
      }
    };

    restore();
  }, []);

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  // Build and POST wizard state to persist progress
  const saveProgress = useCallback(
    async (currentStep: number, overrides?: Partial<WizardData>) => {
      const business = getJsonItemFromLocalStorage('business');
      const businessId = business?.[0]?.businessId;
      if (!businessId) return;

      const current = { ...data, ...overrides };

      const payload: WizardSetupPayload = {
        allowInventorySync: current.inventorySyncEnabled,
        enabled: true,
        currentStep,
        inventoryStrictnessLevel: current.strictnessLevel,
        items: current.itemName
          ? [
              {
                name: current.itemName,
                description: current.description,
                itemType: current.itemType ?? 0,
                strictnessLevel: current.strictnessLevel,
                openingStock: parseFloat(current.openingStock) || 0,
                reorderLevel: parseFloat(current.reorderLevel) || 0,
                reorderQuantity: parseFloat(current.reorderQuantity) || 0,
                averageCostPerBaseUnit: parseFloat(current.costPerUnit) || 0,
                isActive: current.isActive,
                allowTracking: current.allowTracking,
                unitId: current.unitId,
                supplierId: current.supplierId,
              },
            ]
          : [],
        recipes: current.recipeDetails.length > 0
          ? [
              {
                name: current.recipeName || `${current.itemName} Recipe`,
                producedInventoryItemID: current.createdItemId ?? '',
                outputQuantity: parseFloat(current.outputQuantity) || 1,
                outputQuantityUnitId: current.outputQuantityUnitId || current.unitId,
                recipeType: current.recipeType,
                isActive: true,
                details: current.recipeDetails.map((d) => ({
                  id: '',
                  recipeID: '',
                  inventoryItemID: d.inventoryItemID,
                  quantityUsed: d.quantityUsed,
                })),
              },
            ]
          : [],
      };

      return await saveInventoryWizardSetup(businessId, payload);
    },
    [data]
  );

  const goNext = useCallback(() => {
    setStep((s) => {
      const nextStep = s + 1;
      saveProgress(nextStep);
      return nextStep;
    });
  }, [saveProgress]);

  const goBack = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  // Get unit name for preview
  const unitName = Array.isArray(unitsByBusiness)
    ? unitsByBusiness.find((u) => u.id === data.unitId)?.name ?? ''
    : '';

  const handleAddMoreItems = useCallback(() => {
    setData(INITIAL_WIZARD_DATA);
    setStep(1);
  }, []);

  const handleViewInventoryList = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleSyncComplete = useCallback(() => {
    updateData({ inventorySyncEnabled: true });
    setStep(7);
  }, [updateData]);

  // Show loading while restoring saved state
  if (restoring) {
    return (
      <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex items-center justify-center">
        <Spinner size="lg" color="secondary" />
      </div>
    );
  }

  // Step routing
  switch (step) {
    case 1:
      return <WelcomeStep onNext={goNext} />;

    case 2:
      return (
        <SyncStep
          inventorySyncEnabled={data.inventorySyncEnabled}
          onUpdate={(enabled) => updateData({ inventorySyncEnabled: enabled })}
          onNext={goNext}
          onBack={goBack}
          menuSummaryData={menuSummaryData}
          menuSummaryLoading={menuSummaryLoading}
          onSyncComplete={handleSyncComplete}
        />
      );

    case 3:
      return (
        <StrictnessStep
          strictnessLevel={data.strictnessLevel}
          onUpdate={(level) => updateData({ strictnessLevel: level })}
          onNext={goNext}
          onBack={goBack}
        />
      );

    case 4:
      return (
        <AddItemStep
          itemName={data.itemName}
          description={data.description}
          unitId={data.unitId}
          costPerUnit={data.costPerUnit}
          itemType={data.itemType}
          openingStock={data.openingStock}
          reorderLevel={data.reorderLevel}
          reorderQuantity={data.reorderQuantity}
          isActive={data.isActive}
          allowTracking={data.allowTracking}
          supplierId={data.supplierId}
          createdItemId={data.createdItemId}
          strictnessLevel={data.strictnessLevel}
          onUpdate={(partial) => updateData(partial)}
          onNext={goNext}
          onBack={goBack}
          saveProgress={saveProgress}
        />
      );

    case 5:
      return (
        <BuildRecipeStep
          createdItemId={data.createdItemId!}
          createdItemName={data.itemName}
          itemType={data.itemType}
          recipeDetails={data.recipeDetails}
          recipeName={data.recipeName}
          outputQuantity={data.outputQuantity}
          outputQuantityUnitId={data.outputQuantityUnitId}
          recipeType={data.recipeType}
          onUpdateRecipeDetails={(details) => updateData({ recipeDetails: details })}
          onUpdateRecipeName={(val) => updateData({ recipeName: val })}
          onUpdateOutputQuantity={(val) => updateData({ outputQuantity: val })}
          onUpdateOutputQuantityUnitId={(val) => updateData({ outputQuantityUnitId: val })}
          onUpdateRecipeType={(val) => updateData({ recipeType: val })}
          onNext={goNext}
          onBack={goBack}
        />
      );

    case 6:
      return (
        <PreviewStep
          itemName={data.itemName}
          description={data.description}
          unitId={data.unitId}
          unitName={unitName}
          costPerUnit={data.costPerUnit}
          itemType={data.itemType}
          openingStock={data.openingStock}
          reorderLevel={data.reorderLevel}
          reorderQuantity={data.reorderQuantity}
          isActive={data.isActive}
          allowTracking={data.allowTracking}
          supplierId={data.supplierId}
          strictnessLevel={data.strictnessLevel}
          inventorySyncEnabled={data.inventorySyncEnabled}
          recipeDetails={data.recipeDetails}
          recipeName={data.recipeName}
          outputQuantity={data.outputQuantity}
          outputQuantityUnitId={data.outputQuantityUnitId}
          recipeType={data.recipeType}
          onNext={() => setStep(7)}
          onBack={goBack}
        />
      );

    case 7:
      return (
        <SuccessStep
          createdItemId={data.createdItemId}
          onAddMoreItems={handleAddMoreItems}
          onViewInventoryList={handleViewInventoryList}
        />
      );

    default:
      return null;
  }
};

export default HobwiseWizard;
