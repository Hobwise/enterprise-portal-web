import { QR_PAYMENT } from "../../api-url";
import api, { handleError } from "../../apiService";

export interface Bank {
  name: string;
  code: string;
}

export interface BankAccount {
  id?: string;
  accountId?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  /** Present on the settlement account, which stores the bank code here. */
  settlementBank?: string;
  isDefault?: boolean;
}

export interface BankAccountsData {
  settlementAccount: BankAccount | null;
  bankAccounts: BankAccount[];
  hasSettlementAccount: boolean;
  hasBankAccounts: boolean;
}

export interface OnboardBusinessPayload {
  settlementBank: string; // bank code from getBanks()
  accountNumber: string;
  otp?: string;
  termsAccepted?: boolean;
}

export interface AddBankAccountPayload {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  isDefault: boolean;
}

export interface InitializePaymentPayload {
  orderId: string;
  customerEmail: string;
  amountKobo: number;
}

/** The `data` returned by initializePayment(). */
export interface InitializePaymentData {
  sessionId: string;
  hobwiseReference: string;
  authorizationUrl: string;
  accessCode: string;
  /** Base64-encoded PNG (no data-URL prefix) of the payment QR code. */
  qrCodeBase64: string;
  expiresAt: string;
}

export interface CheckoutBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
}

export interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
}

/** Everything the customer-facing checkout page needs to render. */
export interface CheckoutData {
  businessName: string;
  reference: string;
  orderId?: string;
  items: CheckoutItem[];
  total: number;
  tax: number;
  grandTotal: number;
  bankAccounts: CheckoutBankAccount[];
  /** Base64-encoded PNG (no data-URL prefix) of the payment QR, from initialize. */
  qrCodeBase64?: string;
  /** Fallback value to encode client-side when no qrCodeBase64 is available. */
  qrValue: string;
  accessCode?: string;
  authorizationUrl?: string;
}

const withBusiness = (businessId: string) =>
  businessId ? { businessId } : {};

/** Fetches the list of supported settlement banks (name + code). */
export async function getBanks() {
  try {
    return await api.get(QR_PAYMENT.getBanks);
  } catch (error) {
    handleError(error, false);
  }
}

/** Onboards the business for QR payments with its first settlement account. */
export async function onboardBusiness(
  businessId: string,
  payload: OnboardBusinessPayload
) {
  try {
    return await api.post(QR_PAYMENT.onboardBusiness, payload, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Accepts terms and conditions for onboarding and requests OTP. */
export async function acceptOnboardTerms(
  businessId: string,
  payload: { termsAccepted: boolean }
) {
  try {
    return await api.post(QR_PAYMENT.acceptOnboardTerms, payload, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Initializes a QR payment for an order so a customer can pay it.
 *  `amountKobo` is the amount in kobo (naira × 100). */
export async function initializePayment(
  businessId: string,
  userId: string | undefined,
  payload: InitializePaymentPayload
) {
  try {
    return await api.post(QR_PAYMENT.initialize, payload, {
      headers: { ...withBusiness(businessId), ...(userId ? { userId } : {}) },
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Verifies a QR payment session using its reference */
export async function verifyQrPayment(businessId: string, reference: string) {
  try {
    return await api.get(`${QR_PAYMENT.verifySession}/${reference}`, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Fetches the business settlement account and any additional bank accounts. */
export async function getBankAccounts(businessId: string) {
  try {
    return await api.get(QR_PAYMENT.bankAccounts, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Deletes the business settlement account. */
export async function deleteSettlementAccount(businessId: string) {
  try {
    return await api.delete(QR_PAYMENT.deleteSettlement, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Requests an OTP to update the settlement account. */
export async function requestSettlementOtp(businessId: string) {
  try {
    return await api.post(QR_PAYMENT.requestSettlementOtp, {}, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Updates the business settlement account using an OTP. */
export async function updateSettlementAccount(
  businessId: string,
  payload: { settlementBank: string; accountNumber: string; reason: string; otp: string }
) {
  try {
    return await api.put(QR_PAYMENT.updateSettlement, payload, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/**
 * Whether the business has set up a payment account (a settlement account or
 * any bank account) and can therefore accept online card payments.
 *
 * Returns `null` when the status can't be determined — e.g. the request failed
 * — so callers fall through to the payment attempt and surface the real error
 * rather than wrongly telling the business its account is missing.
 */
export async function hasPaymentAccount(
  businessId: string
): Promise<boolean | null> {
  const response = await getBankAccounts(businessId);
  const data: BankAccountsData | undefined = response?.data?.data;

  if (!data) return null;

  return Boolean(
    data.hasSettlementAccount ||
      data.hasBankAccounts ||
      data.settlementAccount ||
      data.bankAccounts?.length
  );
}

/** Adds an additional bank account for the business. */
export async function addBankAccount(
  businessId: string,
  payload: AddBankAccountPayload
) {
  try {
    return await api.post(QR_PAYMENT.bankAccounts, payload, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/** Marks a bank account as the default settlement account. */
export async function setDefaultBankAccount(
  businessId: string,
  accountId: string
) {
  try {
    return await api.patch(
      `${QR_PAYMENT.bankAccounts}/${accountId}/set-default`,
      {},
      { headers: withBusiness(businessId) }
    );
  } catch (error) {
    handleError(error, false);
  }
}

/** Removes a bank account from the business. */
export async function deleteBankAccount(businessId: string, accountId: string) {
  try {
    return await api.delete(`${QR_PAYMENT.bankAccounts}/${accountId}`, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}
