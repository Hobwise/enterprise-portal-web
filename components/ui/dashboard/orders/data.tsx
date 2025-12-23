const columns = [
  { name: "ID", uid: "menuID", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "TOTAL AMOUNT", uid: "amount", sortable: true },
  { name: "REMAINING AMOUNT", uid: "amountRemaining", sortable: true },
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

type AvailableOption =
  | "Update Order"
  | "Checkout"
  | "Cancel Order"
  | "Generate Invoice"
  | "Payment Summary"
  | "Refund Order"
  | "Confirm Payment"
  | "Order History";

export const availableOptions: Record<string, AvailableOption[]> = {
  open: [
    "Update Order",
    "Checkout",
    "Confirm Payment",
    "Cancel Order",
    "Payment Summary",
    "Refund Order",
    "Order History",
  ],
  closed: ["Generate Invoice", "Payment Summary", "Refund Order", "Order History"],
  cancelled: ["Payment Summary", "Order History"],
  "awaiting confirmation": [
    "Update Order",
    "Checkout",
    "Confirm Payment",
    "Cancel Order",
    "Payment Summary",
    "Refund Order",
    "Order History",
  ],
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
