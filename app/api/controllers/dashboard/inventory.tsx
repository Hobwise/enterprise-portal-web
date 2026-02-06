import { z } from 'zod';
import { DASHBOARD, INVENTORY } from '../../api-url';
import api, { handleError } from '../../apiService';

// Types
export enum InventoryItemType {
  Direct = 0,
  Ingredient = 1,
  Produced = 2,
}

// Validation schemas
const inventoryItemSchema = z.object({
  itemName: z.string().trim().min(1, 'Item name is required'),
  unitId: z.string().trim().min(1, 'Unit is required'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  salesPrice: z.number().min(0, 'Sales price must be positive'),
  itemType: z.nativeEnum(InventoryItemType),
});

const createInventorySchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  unitId: z.string().trim().min(1, 'Unit is required'),
  itemType: z.number().min(0),
  averageCostPerBaseUnit: z.number().min(0, 'Cost must be positive'),
  reorderLevel: z.number().min(0),
  reorderQuantity: z.number().min(0),
  strictnessLevel: z.number().min(0),
});

const recipeIngredientSchema = z.object({
  ingredientId: z.string().trim().min(1, 'Ingredient is required'),
  quantity: z.number().min(0.001, 'Quantity must be positive'),
});

const createItemUnitSchema = z.object({
  inventoryItemId: z.string().trim().min(1),
  unitId: z.string().trim().min(1),
  unitName: z.string().trim().min(1),
  unitCode: z.string().trim().min(1),
  isPurchasable: z.boolean(),
  isConsumable: z.boolean(),
  baseUnitEquivalent: z.number().min(0),
});

const createRecipeSchema = z.object({
  name: z.string().trim().min(1),
  producedInventoryItemID: z.string().trim().min(1),
  outputQuantity: z.number().min(0.001),
  outputQuantityUnitId: z.string().trim().min(1),
  recipeType: z.number().min(0),
  isActive: z.boolean(),
});

export type InventoryTrackingMode = 'safe' | 'strict';

export type PendingRecipeTracking = {
  trackingId: string;
  inventoryItemId: string;
  itemName: string;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  unitCategory: number;
  itemType: InventoryItemType;
  strictnessLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  averageCostPerUnit: number;
  isActive: boolean;
  isDeleted: boolean;
  allowTracking?: boolean;
  stockLevel: number;
  stockStatus: string;
  unitId: string;
  unitName?: string;
  unitCode?: string;
  unit: string | null;
  supplierId: string;
  supplierName?: string;
  supplier: string | null;
  cooperateID: string;
  businessID: string;
  itemUnits: ItemUnit[];
  stocks: any[];
  recipe?: any;
  units?: any[];
  dateCreated: string;
  dateUpdated: string;
};

export type RecipeIngredient = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitName: string;
};

export type InventoryUnit = {
  id: string;
  name: string;
  abbreviation: string;
};

export type Supplier = {
  id: string;
  name: string;
};

export type PayloadInventoryItem = {
  itemName: string;
  unitId: string;
  costPrice: number;
  salesPrice: number;
  itemType: InventoryItemType;
  isTracked: boolean;
  trackingMode: InventoryTrackingMode;
  recipe?: {
    ingredientId: string;
    quantity: number;
  }[];
};

export type CreateInventoryPayload = {
  name: string;
  description: string;
  itemType: number;
  strictnessLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  averageCostPerBaseUnit: number;
  isActive: boolean;
  unitId: string;
  supplierId?: string;
};

export type InventoryItemsResponse = {
  items: InventoryItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type CreateItemUnitPayload = {
  inventoryItemId: string;
  unitId: string;
  unitName: string;
  unitCode: string;
  isPurchasable: boolean;
  isConsumable: boolean;
  baseUnitEquivalent: number;
};

export type CreateRecipePayload = {
  name: string;
  producedInventoryItemID: string;
  outputQuantity: number;
  outputQuantityUnitId: string;
  recipeType: number;
  isActive: boolean;
  details: RecipeDetail[];
};

export type RecipeDetail = {
  id?: string;
  recipeID?: string;
  inventoryItemID?: string;
  inventoryItemId?: string;
  inventoryItemName?: string;
  quantityUsed: number;
};

export type Recipe = {
  id: string;
  name: string;
  producedInventoryItemID: string;
  producedInventoryItemName?: string;
  outputQuantity: number;
  outputQuantityUnitId: string;
  outputQuantityUnitCode?: string;
  outputQuantityUnitName?: string;
  recipeType: number;
  isActive: boolean;
  details: RecipeDetail[];
  productionHistory?: BatchProductionRecord[];
};

export type ItemUnit = {
  id: string;
  inventoryItemId: string;
  unitId: string;
  unitName: string;
  unitCode: string;
  isPurchasable: boolean;
  isConsumable: boolean;
  baseUnitEquivalent: number;
  notes?: string;
};

export type CreateGlobalUnitPayload = {
  name: string;
  code: string;
  category: number;
};

export type UpdateItemUnitPayload = {
  inventoryItemId: string;
  unitId: string;
  unitName: string;
  unitCode: string;
  isPurchasable: boolean;
  isConsumable: boolean;
  baseUnitEquivalent: number;
};

export type ProduceBatchPayload = {
  recipeId: string;
  producedQuantityMultiplier: number;
};

export type BatchProductionRecord = {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  producedBy: string;
  producedByName: string;
  dateProduced: string;
};

export type RecipeWithHistory = {
  recipe: Recipe;
  productionHistory: BatchProductionRecord[];
};

// API Functions

export async function getInventoryItems(
  businessId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;

  try {
    let url = `${DASHBOARD.inventoryByBusiness}?Page=${page}&PageSize=${pageSize}&SortBy=dateCreated&SortOrder=desc`;
    if (search) url += `&Search=${encodeURIComponent(search)}`;
    const data = await api.get(url, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getInventoryItem(businessId: string, itemId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (itemId) headers.inventoryItemId = itemId;

  try {
    const data = await api.get(DASHBOARD.inventory, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function createInventoryItem(
  businessId: string,
  payload: CreateInventoryPayload
) {
  const validatedFields = createInventorySchema.safeParse({
    name: payload.name,
    unitId: payload.unitId,
    itemType: payload.itemType,
    averageCostPerBaseUnit: payload.averageCostPerBaseUnit,
    reorderLevel: payload.reorderLevel,
    reorderQuantity: payload.reorderQuantity,
    strictnessLevel: payload.strictnessLevel,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.inventory, payload, {
      headers,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateInventoryItem(
  businessId: string,
  itemId: string,
  payload: CreateInventoryPayload
) {
  const validatedFields = createInventorySchema.safeParse({
    name: payload.name,
    unitId: payload.unitId,
    itemType: payload.itemType,
    averageCostPerBaseUnit: payload.averageCostPerBaseUnit,
    reorderLevel: payload.reorderLevel,
    reorderQuantity: payload.reorderQuantity,
    strictnessLevel: payload.strictnessLevel,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (itemId) headers.inventoryItemId = itemId;

  try {
    const data = await api.put(DASHBOARD.inventory, payload, { headers });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteInventoryItem(businessId: string, itemId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (itemId) headers.inventoryItemId = itemId;

  try {
    const data = await api.delete(DASHBOARD.inventory, { headers });
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getSuppliers(businessId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.get(`${DASHBOARD.supplierByBusiness}?Page=1&PageSize=100`, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getUnitsByBusiness(businessId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.get(INVENTORY.unitByBusiness, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getIngredients(businessId: string) {
  const clientParameters = 'page,1,pageSize,100';
  const headers: Record<string, string> = { clientParameters };
  if (businessId) headers.businessId = businessId;

  try {
    const data = await api.get(DASHBOARD.inventoryByBusiness, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function saveRecipe(
  businessId: string,
  itemId: string,
  ingredients: { ingredientId: string; quantity: number }[]
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(
      DASHBOARD.inventoryRecipe,
      { itemId, ingredients },
      { headers }
    );
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getItemRecipe(businessId: string, itemId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(
      `${DASHBOARD.inventoryRecipe}?itemId=${itemId}`,
      { headers }
    );
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function createItemUnit(
  businessId: string,
  payload: CreateItemUnitPayload
) {
  const validatedFields = createItemUnitSchema.safeParse(payload);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.inventoryItemUnit, payload, {
      headers,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function createRecipe(
  businessId: string,
  payload: CreateRecipePayload
) {
  const validatedFields = createRecipeSchema.safeParse({
    name: payload.name,
    producedInventoryItemID: payload.producedInventoryItemID,
    outputQuantity: payload.outputQuantity,
    outputQuantityUnitId: payload.outputQuantityUnitId,
    recipeType: payload.recipeType,
    isActive: payload.isActive,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.inventoryRecipe, payload, {
      headers,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateRecipe(
  businessId: string,
  recipeId: string,
  payload: CreateRecipePayload
) {
  const validatedFields = createRecipeSchema.safeParse({
    name: payload.name,
    producedInventoryItemID: payload.producedInventoryItemID,
    outputQuantity: payload.outputQuantity,
    outputQuantityUnitId: payload.outputQuantityUnitId,
    recipeType: payload.recipeType,
    isActive: payload.isActive,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (recipeId) headers.recipeId = recipeId;

  try {
    const data = await api.put(DASHBOARD.inventoryRecipe, payload, { headers });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getRecipesByBusiness(businessId: string) {
  const headers: Record<string, string> = {
    clientParameters: 'page,1,pageSize,100',
  };
  if (businessId) headers.businessId = businessId;

  try {
    const data = await api.get(DASHBOARD.inventoryRecipeByBusiness, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getRecipeByItem(businessId: string, itemId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (itemId) headers.inventoryItem = itemId;

  try {
    const data = await api.get(DASHBOARD.inventoryRecipeByItem, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

// Unit management functions
export async function getUnit(businessId: string, unitId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (unitId) headers.unitId = unitId;

  try {
    const data = await api.get(DASHBOARD.unit, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getUnits(
  businessId: string,
  page: number = 1,
  pageSize: number = 10
) {
  const clientParameters = `page,${page},pageSize,${pageSize}`;
  const headers: Record<string, string> = { clientParameters };
  if (businessId) headers.businessId = businessId;

  try {
    const data = await api.get(INVENTORY.unitByBusiness, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function createUnit(
  businessId: string,
  payload: CreateGlobalUnitPayload
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.unit, payload, { headers });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateUnit(
  businessId: string,
  unitId: string,
  payload: CreateGlobalUnitPayload
) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (unitId) headers.unitId = unitId;

  try {
    const data = await api.put(DASHBOARD.unit, payload, { headers });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUnit(businessId: string, unitId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (unitId) headers.unitId = unitId;

  try {
    const data = await api.delete(DASHBOARD.unit, { headers });
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Item unit management functions
export async function updateItemUnit(
  businessId: string,
  itemUnitId: string,
  payload: UpdateItemUnitPayload
) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (itemUnitId) headers.itemUnitId = itemUnitId;

  try {
    const data = await api.put(DASHBOARD.inventoryItemUnit, payload, { headers });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteItemUnit(businessId: string, itemUnitId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (itemUnitId) headers.itemUnitId = itemUnitId;

  try {
    const data = await api.delete(DASHBOARD.inventoryItemUnit, { headers });
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Batch production functions
export async function produceBatch(
  businessId: string,
  payload: ProduceBatchPayload
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.inventoryRecipeProduceBatch, payload, {
      headers,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getRecipeDetails(businessId: string, recipeId: string) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (recipeId) headers.recipeId = recipeId;

  try {
    const data = await api.get(DASHBOARD.inventoryRecipeDetails, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}
