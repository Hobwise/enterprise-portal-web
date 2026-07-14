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
  items: CheckoutItem[];
  total: number;
  tax: number;
  grandTotal: number;
  bankAccounts: CheckoutBankAccount[];
  /** Base64-encoded PNG (no data-URL prefix) of the payment QR, from initialize. */
  qrCodeBase64?: string;
  /** Fallback value to encode client-side when no qrCodeBase64 is available. */
  qrValue: string;
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

/** Initializes a QR payment for an order so a customer can pay it.
 *  `amountKobo` is the amount in kobo (naira × 100). */
export async function initializePayment(
  businessId: string,
  payload: InitializePaymentPayload
) {
  try {
    return await api.post(QR_PAYMENT.initialize, payload, {
      headers: withBusiness(businessId),
    });
  } catch (error) {
    handleError(error, false);
  }
}

/**
 * TODO: no public endpoint exists yet to fetch a checkout by its reference.
 * Wire this to the real endpoint (or the `initialize` response shape) once the
 * backend provides it. Returns null so the page falls back to placeholder data.
 */
export async function getCheckout(reference: string): Promise<CheckoutData | null> {
  void reference;
  return null;
}

/**
 * TODO: no confirm-payment endpoint exists yet. Wire this to the real
 * "I have made payment" endpoint once available.
 */
export async function confirmPayment(reference: string): Promise<boolean> {
  void reference;
  return false;
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
