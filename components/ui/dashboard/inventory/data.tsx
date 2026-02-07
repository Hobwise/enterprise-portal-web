export const columns = [
  { name: "ACCOUNT NAME", uid: "name", sortable: true },
  { name: "ITEM TYPE", uid: "itemType", sortable: true },
  { name: "STOCK LEVEL", uid: "stockLevel", sortable: true },
  { name: "REORDER LEVEL", uid: "reorderLevel", sortable: true },
  { name: "", uid: "actions", sortable: false },
];

export const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "itemType",
  "stockLevel",
  "reorderLevel",
  "actions",
];
