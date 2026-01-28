import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
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
  unitId: string;
  unit: string | null;
  supplierId: string;
  supplier: string | null;
  cooperateID: string;
  businessID: string;
  itemUnits: any[];
  stocks: any[];
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
  id: string;
  recipeID: string;
  inventoryItemID: string;
  quantityUsed: number;
};

export type Recipe = {
  id: string;
  name: string;
  producedInventoryItemID: string;
  outputQuantity: number;
  outputQuantityUnitId: string;
  recipeType: number;
  isActive: boolean;
  details: RecipeDetail[];
};

// API Functions

export async function getInventoryItems(
  businessId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  let clientParameters = `page,${page},pageSize,${pageSize}`;
  if (search) clientParameters += `,search,${search}`;

  const headers: Record<string, string> = { clientParameters };
  if (businessId) headers.businessId = businessId;

  try {
    const data = await api.get(DASHBOARD.inventoryByBusiness, { headers });
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
    const data = await api.get(DASHBOARD.supplierByBusiness, { headers });
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getUnitsByBusiness(businessId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.get(DASHBOARD.unitByBusiness, { headers });
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
