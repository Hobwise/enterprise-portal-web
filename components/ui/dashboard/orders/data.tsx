const columns = [
  { name: "ID", uid: "menuID" },
  { name: "Name", uid: "name" },
  { name: "Amount", uid: "amount" },
  { name: "Order ID", uid: "orderID" },
  { name: "Phone number", uid: "placedByPhoneNumber" },
  { name: "Payment", uid: "payment" },
  { name: "Status", uid: "status" },

  { name: "", uid: "actions" },
];
export const statusColorMap: Record<
  number,
  "warning" | "success" | "danger" | "secondary"
> = {
  0: "warning",
  1: "success",
  2: "danger",
  3: "secondary",
};

export const availableOptions = {
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
