const columns = [
  { name: "ID", uid: "menuID", sortable: true },
  { name: "Name", uid: "name", sortable: true },
  { name: "Amount", uid: "amount", sortable: true },
  { name: "Table Name", uid: "qrReference", sortable: true },
  { name: "Order ID", uid: "orderID", sortable: true },
  { name: "Phone number", uid: "placedByPhoneNumber", sortable: true },
  { name: "Payment", uid: "payment", sortable: true },
  { name: "Status", uid: "status", sortable: true },
  { name: "Date Updated", uid: "dateUpdated", sortable: true },
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
  "awaiting confirmation": ["Generate Invoice"],
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
