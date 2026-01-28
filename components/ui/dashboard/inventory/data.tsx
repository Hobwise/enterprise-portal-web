export const columns = [
  { name: "ITEM NAME", uid: "name", sortable: true },
  { name: "ITEM TYPE", uid: "itemType", sortable: true },
  { name: "COST/UNIT", uid: "averageCostPerUnit", sortable: true },
  { name: "REORDER LEVEL", uid: "reorderLevel", sortable: true },
  { name: "STATUS", uid: "isActive", sortable: true },
  { name: "", uid: "actions", sortable: false },
];

export const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "itemType",
  "averageCostPerUnit",
  "reorderLevel",
  "isActive",
  "actions",
];
