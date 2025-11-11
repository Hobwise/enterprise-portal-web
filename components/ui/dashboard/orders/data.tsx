const columns = [
  { name: "ID", uid: "menuID", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "AMOUNT", uid: "amount", sortable: true },
  { name: "TABLE NAME", uid: "qrReference", sortable: true },
  { name: "ORDER ID", uid: "orderID", sortable: true },
  { name: "PHONE NUMBER", uid: "placedByPhoneNumber", sortable: true },
  { name: "PAYMENT", uid: "payment", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "DATE UPDATED", uid: "dateUpdated", sortable: true },
  { name: "", uid: "actions", sortable: false },
];
export const statusColorMap: Record<
  number,
  "warning" | "success" | "danger" | "secondary"
> = {
  0: "success",
  1: "warning",
  2: "danger",
  3: "secondary",
};

type AvailableOption = "Update Order" | "Checkout" | "Cancel Order" | "Generate Invoice";

export const availableOptions: Record<string, AvailableOption[]> = {
  open: ["Update Order", "Checkout", "Cancel Order"],
  closed: ["Generate Invoice"],
  cancelled: [],
  "awaiting confirmation": ["Update Order", "Checkout", "Cancel Order"],
};
export const statusDataMap: Record<
  number,
  "open" | "closed" | "cancelled" | "awaiting confirmation"
> = {
  0: "open",
  1: "closed",
  2: "cancelled",
  3: "awaiting confirmation",
};

export { columns };
