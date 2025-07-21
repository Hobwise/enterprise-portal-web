export const columns = [
  { name: "Name", uid: "firstName", sortable: true },
  { name: "Reservation", uid: "reservationName", sortable: true },
  { name: "Booking ID", uid: "reference", sortable: true },
  { name: "Quantity", uid: "quantity", sortable: true },
  { name: "Description", uid: "description", sortable: true },
  { name: "Time", uid: "bookingDateTime", sortable: true },
  { name: "Status", uid: "bookingStatus", sortable: true },
  { name: "", uid: "actions", sortable: false },
];

export const statusColorMap: Record<
  number,
  "warning" | "success" | "danger" | "secondary" | "default"
> = {
  0: "warning",
  1: "success",
  2: "default",
  3: "danger",
  4: "success",
  5: "danger",
  6: "secondary",
};
export const statusDataMap: Record<
  number,
  | "pending"
  | "confirmed"
  | "admitted"
  | "cancelled"
  | "completed"
  | "failed"
  | "expired"
> = {
  0: "pending",
  1: "confirmed",
  2: "admitted",
  3: "cancelled",
  4: "completed",
  5: "failed",
  6: "expired",
};
