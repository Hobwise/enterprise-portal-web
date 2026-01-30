'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';
import {
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getRecipesByBusiness } from '@/app/api/controllers/dashboard/inventory';
import type { Recipe } from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useIngredients, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';

interface ViewRecipeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  itemId: string;
  itemName: string;
}

const ViewRecipeModal: React.FC<ViewRecipeModalProps> = ({
  isOpen,
  onOpenChange,
  itemId,
  itemName,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const { data: availableIngredients } = useIngredients();
  const { data: unitsByBusiness } = useUnitsByBusiness();

  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true);
      setExpandedRecipeId(null);
      const business = getJsonItemFromLocalStorage('business');
      getRecipesByBusiness(business[0]?.businessId)
        .then((response) => {
          if (response?.data?.isSuccessful) {
            const allRecipes: Recipe[] = response.data.data || [];
            setRecipes(allRecipes.filter((r) => r.producedInventoryItemID === itemId));
          }
        })
        .catch(() => {
          setRecipes([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setRecipes([]);
      setExpandedRecipeId(null);
    }
  }, [isOpen, itemId]);

  const getIngredientName = (inventoryItemID: string) => {
    const ingredient = availableIngredients.find((i) => i.id === inventoryItemID);
    return ingredient?.name || inventoryItemID;
  };

  const getUnitName = (unitId: string) => {
    const unit = unitsByBusiness.find((u) => u.id === unitId);
    return unit?.name || '';
  };

  const toggleRecipe = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Recipes
                    </h2>
                    <p className="text-sm text-gray-500">
                      {itemName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" color="secondary" />
                  </div>
                ) : recipes.length > 0 ? (
                  <div className="space-y-3">
                    {recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        {/* Recipe summary row */}
                        <button
                          onClick={() => toggleRecipe(recipe.id)}
                          className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-semibold text-gray-800 text-base">
                                {recipe.name}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  recipe.recipeType === 0
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {recipe.recipeType === 0 ? 'Standard' : 'Custom'}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  recipe.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {recipe.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 ml-4 shrink-0">
                              <span className="text-sm text-gray-500">
                                Output:{' '}
                                <span className="font-semibold text-gray-700">
                                  {recipe.outputQuantity}
                                  {recipe.outputQuantityUnitId &&
                                    ` ${getUnitName(recipe.outputQuantityUnitId)}`}
                                </span>
                              </span>
                              {expandedRecipeId === recipe.id ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Expanded ingredient details */}
                        {expandedRecipeId === recipe.id && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                            {recipe.details && recipe.details.length > 0 ? (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Ingredient
                                    </th>
                                    <th className="text-right py-2 px-2 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Quantity Used
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recipe.details.map((detail) => (
                                    <tr
                                      key={detail.id || detail.inventoryItemID}
                                      className="border-b border-gray-100 last:border-b-0"
                                    >
                                      <td className="py-2.5 px-2 text-gray-700">
                                        {getIngredientName(detail.inventoryItemID)}
                                      </td>
                                      <td className="py-2.5 px-2 text-right text-gray-700 font-medium">
                                        {detail.quantityUsed}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">
                                No ingredients listed
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No recipes found for this item
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewRecipeModal;
