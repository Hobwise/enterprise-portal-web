export type ReportCategory =
  | "orders"
  | "payments"
  | "bookings"
  | "users"
  | "inventory";

export type ReportApiRoute = "orders" | "payment" | "booking" | "audit-logs";

const CATEGORY_TO_API_ROUTE: Record<ReportCategory, ReportApiRoute | null> = {
  orders: "orders",
  payments: "payment",
  bookings: "booking",
  users: "audit-logs",
  inventory: null,
};

const API_ROUTE_TO_CATEGORY: Record<ReportApiRoute, ReportCategory> = {
  orders: "orders",
  payment: "payments",
  booking: "bookings",
  "audit-logs": "users",
};

export const KNOWN_CATEGORIES: ReportCategory[] = [
  "orders",
  "payments",
  "bookings",
  "users",
  "inventory",
];

export const isReportCategory = (value: string): value is ReportCategory =>
  (KNOWN_CATEGORIES as string[]).includes(value);

export const categoryToApiRoute = (
  category: string
): ReportApiRoute | null => {
  if (!isReportCategory(category)) return null;
  return CATEGORY_TO_API_ROUTE[category];
};

export const apiRouteToCategory = (route: string): ReportCategory | null => {
  if (route in API_ROUTE_TO_CATEGORY) {
    return API_ROUTE_TO_CATEGORY[route as ReportApiRoute];
  }
  return null;
};

export const slugifyReportName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildReportPath = (
  apiRoute: string,
  reportName: string
): string | null => {
  const category = apiRouteToCategory(apiRoute);
  if (!category) return null;
  return `/dashboard/reports/${category}/${slugifyReportName(reportName)}`;
};
