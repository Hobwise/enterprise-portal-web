import React from "react";
const columns = [
  { name: "PAYMENT", uid: "paymentType", sortable: true },
  { name: "AMOUNT", uid: "totalAmount", sortable: true },
  { name: "TABLE", uid: "qrName", sortable: true },
  //   { name: 'ORDER ID', uid: 'orderID' },
  { name: "ORDER ID", uid: "reference", sortable: true },
  { name: "STAFF", uid: "treatedBy", sortable: true },
  { name: "DATE CREATED", uid: "dateCreated", sortable: true },
  { name: "CUSTOMER", uid: "customer", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "PAYMENT METHOD", uid: "paymentMethod", sortable: true },
  { name: "PAYMENT REFERENCE", uid: "paymentReference", sortable: true },
  { name: "", uid: "actions", sortable: false },
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

export const paymentTypeMap: Record<number, string> = {
  0: "Order",
  1: "Refund",
};

export const paymentMethodMap: Record<number, string> = {
  0: "Cash",
  1: "POS",
  2: "Bank transfer",
  3: "Checkout",
};

/** Payment method enum value for Checkout (Paystack online checkout) */
export const CHECKOUT_PAYMENT_METHOD = 3;

/** Helper to determine if a payment method corresponds to Checkout */
export const isCheckoutPayment = (paymentMethod?: number | string) => {
  if (paymentMethod === 3 || paymentMethod === "3") return true;
  if (typeof paymentMethod === "string" && paymentMethod.toLowerCase() === "checkout") return true;
  if (typeof paymentMethod === "number" && paymentMethodMap[paymentMethod] === "Checkout") return true;
  return false;
};

export const availableOptions = {
  pending: ["Approve payment"],
  confirmed: [],
  cancelled: [],
  "awaiting confirmation": ["Generate Invoice", "Checkout"],
};
export const statusDataMap: Record<
  number,
  "pending" | "confirmed" | "cancelled" | "awaiting confirmation"
> = {
  0: "pending",
  1: "confirmed",
  2: "cancelled",
  3: "awaiting confirmation",
};

const getTableClasses = () => {
  return React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],

      th: [
        "bg-transparent",
        "text-default-500",
        "border-b",
        "border-[#E4E7EC]",
      ],
      tr: " border-b border-[#E4E7EC]",
      td: [
        // changing the rows border radius
        // first
        "py-3",
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        // middle
        "group-data-[middle=true]:before:rounded-none",
        // last
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
    }),
    []
  );
};

export { columns, getTableClasses };
