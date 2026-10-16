const REFERRAL_CODE_STORAGE_KEY = "signupReferralCode";

const sanitize = (code?: string | null) =>
  (code ?? "").replace(/^[?\s]+/, "").trim().toUpperCase();

// Persist the referral code captured during signup so it can still be applied
// later in the flow (email confirmation -> business creation), even if the
// visitor refreshes or the in-memory signup state is lost.
export const saveSignupReferralCode = (code?: string | null) => {
  if (typeof window === "undefined") return;
  const sanitized = sanitize(code);
  if (!sanitized) return;
  window.localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, sanitized);
};

export const getSignupReferralCode = (): string => {
  if (typeof window === "undefined") return "";
  return sanitize(window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY));
};

export const clearSignupReferralCode = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
};
