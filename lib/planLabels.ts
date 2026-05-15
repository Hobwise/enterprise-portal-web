export const PLAN_LABELS: Record<number, string> = {
  1: "Basic",
  2: "Professional",
  3: "Premium",
};

export const getPlanLabel = (plan?: number | null): string => {
  if (typeof plan !== "number") return "Free";
  return PLAN_LABELS[plan] ?? "Free";
};
