/**
 * Shared helpers for the order list's category (status) tabs and summary cards.
 *
 * The server returns order categories with their own counts, but it knows
 * nothing about orders still sitting in the device's offline queue. Both the
 * tab badges and the POS summary cards have to add those locally so the number
 * a user sees matches the rows actually on screen.
 */

/** Minimal shape of a category row; both the list and the cards use this. */
export interface OrderCategoryLike {
  name: string;
  count?: number;
  totalAmount?: number;
  /** Present on some responses; passed through untouched. */
  orders?: unknown[];
}

/**
 * Maps a category name to the order `status` it represents, or `null` when the
 * category is "all orders" (i.e. no status filter).
 */
export const getStatusForCategory = (categoryName: string): number | null => {
  switch (categoryName.toLowerCase()) {
    case 'open orders':
      return 0;
    case 'closed orders':
      return 1;
    case 'cancelled orders':
      return 2;
    case 'awaitingconfirmation orders':
    case 'awaiting confirmation orders':
      return 3;
    case 'all orders':
    default:
      return null; // null means show all orders
  }
};

/**
 * Returns a copy of `categories` with queued (offline) orders folded into the
 * categories they belong to — "All orders" and "Open orders", since a queued
 * order is always a new, open order.
 *
 * Counts and totals are both adjusted so the summary cards stay consistent with
 * the rows in the list below them.
 */
export const withQueuedOrders = <T extends OrderCategoryLike>(
  categories: T[] | undefined,
  queued: Array<{ totalAmount?: number }>
): T[] | undefined => {
  if (!categories?.length || queued.length === 0) return categories;

  const queuedCount = queued.length;
  const queuedAmount = queued.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);

  return categories.map((category) => {
    const status = getStatusForCategory(category.name);
    if (status === null || status === 0) {
      return {
        ...category,
        count: (category.count || 0) + queuedCount,
        totalAmount: (category.totalAmount || 0) + queuedAmount,
      };
    }
    return category;
  });
};
