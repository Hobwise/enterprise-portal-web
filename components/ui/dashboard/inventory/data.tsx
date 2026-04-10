export const columns = [
  { name: "ITEM NAME", uid: "name", sortable: true },
  { name: "ITEM TYPE", uid: "itemType", sortable: true },
  { name: "CURRENT STOCK", uid: "stockLevel", sortable: true },
  { name: "REORDER THRESHOLD", uid: "reorderLevel", sortable: true },
  { name: "", uid: "actions", sortable: false },
];

export const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "itemType",
  "stockLevel",
  "reorderLevel",
  "actions",
];
