"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  useDisclosure,
} from "@nextui-org/react";
import { Pencil, Trash2, ShieldCheck, Mail, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
import SelectInput from "@/components/selectInput";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import {
  Bank,
  BankAccount,
  addBankAccount,
  deleteBankAccount,
  deleteSettlementAccount,
  getBankAccounts,
  getBanks,
  onboardBusiness,
  requestSettlementOtp,
  setDefaultBankAccount,
  updateSettlementAccount,
  acceptOnboardTerms,
} from "@/app/api/controllers/dashboard/qrPayment";

interface BankOption {
  label: string;
  value: string;
}

type Mode = "empty" | "form" | "details";
type EditKind = "settlement" | "other";

const resolveBusiness = () => {
  const business = getJsonItemFromLocalStorage("business");
  return {
    businessId: business?.[0]?.businessId ?? "",
    businessName: business?.[0]?.businessName ?? business?.[0]?.name ?? "",
  };
};

const accountKey = (account: BankAccount) =>
  account.id ?? account.accountId ?? account.accountNumber;

const accountIdOf = (account: BankAccount) => account.id ?? account.accountId;

// A resolved response means HTTP 2xx (the controller swallows errors and returns
// undefined). Some mutation endpoints return a bare 200 with no envelope, so
// treat the call as successful unless `isSuccessful` is explicitly false.
const succeeded = (response: any): boolean =>
  !!response && response?.data?.isSuccessful !== false;

const errorOf = (response: any): string | undefined => response?.data?.error;

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3 text-sm">
    <span className="w-32 shrink-0 text-[#667085]">{label}:</span>
    <span className="font-medium text-[#101928]">{value}</span>
  </div>
);

const PaymentManagement = () => {
  const { businessId, businessName: defaultBusinessName } = resolveBusiness();

  const [mode, setMode] = useState<Mode>("empty");
  const [loading, setLoading] = useState(true);

  const [settlementAccount, setSettlementAccount] =
    useState<BankAccount | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [bankOptions, setBankOptions] = useState<BankOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [accountName, setAccountName] = useState<string>(defaultBusinessName);
  const [settlementBank, setSettlementBank] = useState<string>(""); // bank code
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [reason, setReason] = useState<string>("Update settlement account");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [onboardOtpSent, setOnboardOtpSent] = useState<boolean>(false);

  // Edit mode — set when editing an existing account.
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editingKind, setEditingKind] = useState<EditKind | null>(null);

  // Per-account async guard for the default toggle.
  const [settingDefaultId, setSettingDefaultId] = useState<string>();
  
  // Delete confirmation.
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<BankAccount | null>(null);
  const [pendingDeleteKind, setPendingDeleteKind] = useState<EditKind | null>(null);
  const [deleting, setDeleting] = useState(false);

  // OTP prompt modal — shown before sending the OTP.
  const {
    isOpen: isOtpPromptOpen,
    onOpen: onOtpPromptOpen,
    onOpenChange: onOtpPromptOpenChange,
    onClose: onOtpPromptClose,
  } = useDisclosure();

  // OTP entry modal — shown after the OTP has been sent.
  const {
    isOpen: isOtpEntryOpen,
    onOpen: onOtpEntryOpen,
    onOpenChange: onOtpEntryOpenChange,
    onClose: onOtpEntryClose,
  } = useDisclosure();

  // The account + kind queued for editing (held while the user goes through OTP).
  const [pendingEditAccount, setPendingEditAccount] = useState<BankAccount | null>(null);
  const [pendingEditKind, setPendingEditKind] = useState<EditKind | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendCountdown = () => {
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    setResendCountdown(30);
    resendTimerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current!);
          resendTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); }, []);

  // Whether a settlement account already exists — drives onboard vs add-account.
  const isOnboarded = settlementAccount !== null || bankAccounts.length > 0;
  const showDefaultToggle = isOnboarded && editingKind !== "settlement";

  const loadAccounts = useCallback(async () => {
    const response = await getBankAccounts(businessId);
    const data = response?.data?.data;
    const settlement: BankAccount | null = data?.settlementAccount ?? null;
    const accounts: BankAccount[] = data?.bankAccounts ?? [];

    setSettlementAccount(settlement);
    setBankAccounts(accounts);

    const hasAny =
      data?.hasSettlementAccount ||
      data?.hasBankAccounts ||
      settlement !== null ||
      accounts.length > 0;
    setMode(hasAny ? "details" : "empty");
  }, [businessId]);

  useEffect(() => {
    const init = async () => {
      const [banksResponse] = await Promise.all([getBanks(), loadAccounts()]);
      const banks: Bank[] = banksResponse?.data?.data ?? [];
      setBankOptions(
        banks.map((bank) => ({ label: bank.name, value: bank.code }))
      );
      setLoading(false);
    };
    init();
  }, [loadAccounts]);

  const canSubmit =
    accountName.trim().length > 0 &&
    settlementBank.length > 0 &&
    accountNumber.trim().length === 10 &&
    (editingKind === "settlement" ? otp.trim().length > 0 : true) &&
    !submitting;

  const canRequestOnboardOtp =
    !isOnboarded &&
    accountName.trim().length > 0 &&
    settlementBank.length > 0 &&
    accountNumber.trim().length === 10 &&
    termsAccepted &&
    !submitting;

  // Onboard OTP prompt modal.
  const {
    isOpen: isOnboardPromptOpen,
    onOpen: onOnboardPromptOpen,
    onOpenChange: onOnboardPromptOpenChange,
    onClose: onOnboardPromptClose,
  } = useDisclosure();

  // Onboard OTP entry modal.
  const {
    isOpen: isOnboardOtpOpen,
    onOpen: onOnboardOtpOpen,
    onOpenChange: onOnboardOtpOpenChange,
    onClose: onOnboardOtpClose,
  } = useDisclosure();

  const [onboardOtp, setOnboardOtp] = useState("");
  const [onboardResendCountdown, setOnboardResendCountdown] = useState(0);
  const onboardTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startOnboardResendCountdown = () => {
    if (onboardTimerRef.current) clearInterval(onboardTimerRef.current);
    setOnboardResendCountdown(30);
    onboardTimerRef.current = setInterval(() => {
      setOnboardResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(onboardTimerRef.current!);
          onboardTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (onboardTimerRef.current) clearInterval(onboardTimerRef.current); }, []);

  // Opens the onboard OTP prompt modal when user clicks "Request OTP".
  const handleRequestOnboardOtp = () => {
    if (!canRequestOnboardOtp) return;
    onOnboardPromptOpen();
  };

  // Step 2 — send OTP after user confirms in prompt modal.
  const handleOnboardSendOtp = async () => {
    setSubmitting(true);
    try {
      const response = await acceptOnboardTerms(businessId, { termsAccepted });
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to request OTP. Please try again.");
        return;
      }
      setOnboardOtpSent(true);
      toast.success("OTP sent to your email.");
      onOnboardPromptClose();
      startOnboardResendCountdown();
      onOnboardOtpOpen();
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP for onboarding.
  const handleOnboardResendOtp = async () => {
    if (onboardResendCountdown > 0) return;
    setSubmitting(true);
    try {
      const response = await acceptOnboardTerms(businessId, { termsAccepted });
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to resend OTP. Please try again.");
        return;
      }
      toast.success("OTP resent to your email.");
      setOnboardOtp("");
      startOnboardResendCountdown();
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 — verify OTP and submit onboarding.
  const handleOnboardVerifyAndSubmit = async () => {
    if (onboardOtp.trim().length === 0) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }
    setOtp(onboardOtp);
    setSubmitting(true);
    try {
      const bankName =
        bankOptions.find((bank) => bank.value === settlementBank)?.label ?? settlementBank;
      const response = await onboardBusiness(businessId, {
        settlementBank,
        accountNumber: accountNumber.trim(),
        otp: onboardOtp.trim(),
        termsAccepted,
      });
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to save account. Please try again.");
        return;
      }
      toast.success("Payment account saved successfully");
      onOnboardOtpClose();
      resetForm();
      await loadAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAccountName(defaultBusinessName);
    setSettlementBank("");
    setAccountNumber("");
    setIsDefault(false);
    setEditingAccount(null);
    setEditingKind(null);
    setOtp("");
    setTermsAccepted(false);
    setOnboardOtpSent(false);
  };

  const openCreateForm = () => {
    resetForm();
    setMode("form");
  };

  // Step 1 — user clicks the edit pencil: store the target and open the prompt.
  const openEditForm = (account: BankAccount, kind: EditKind) => {
    setPendingEditAccount(account);
    setPendingEditKind(kind);
    setOtp("");
    onOtpPromptOpen();
  };

  // Step 2 — user clicks "Send OTP" in the prompt modal.
  const handleSendEditOtp = async () => {
    if (!pendingEditAccount || !pendingEditKind) return;
    setSendingOtp(true);
    try {
      if (pendingEditKind === "settlement") {
        const response = await requestSettlementOtp(businessId);
        if (!succeeded(response)) {
          toast.error(errorOf(response) ?? "Unable to request OTP. Please try again.");
          return;
        }
      }
      toast.success("OTP sent to your registered email.");
      onOtpPromptClose();
      startResendCountdown();
      onOtpEntryOpen();
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP (inside the entry modal).
  const handleResendEditOtp = async () => {
    if (resendCountdown > 0 || !pendingEditKind) return;
    setSendingOtp(true);
    try {
      if (pendingEditKind === "settlement") {
        const response = await requestSettlementOtp(businessId);
        if (!succeeded(response)) {
          toast.error(errorOf(response) ?? "Unable to resend OTP. Please try again.");
          return;
        }
      }
      toast.success("OTP resent to your registered email.");
      setOtp("");
      startResendCountdown();
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 3 — user enters OTP and clicks "Verify & Continue".
  const handleVerifyEditOtp = () => {
    if (!pendingEditAccount || !pendingEditKind) return;
    if (pendingEditKind === "settlement" && otp.trim().length === 0) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }
    // Populate the edit form with the pending account's data.
    setEditingAccount(pendingEditAccount);
    setEditingKind(pendingEditKind);
    setAccountName(pendingEditAccount.accountName ?? defaultBusinessName);
    setSettlementBank(pendingEditAccount.bankCode ?? pendingEditAccount.settlementBank ?? "");
    setAccountNumber(pendingEditAccount.accountNumber ?? "");
    setIsDefault(!!pendingEditAccount.isDefault);
    onOtpEntryClose();
    setMode("form");
  };

  // The settlement account stores only the bank code, so resolve a display name
  // from the fetched banks list when the account has no bankName of its own.
  const resolveBankName = (account: BankAccount): string => {
    if (account.bankName) return account.bankName;
    const code = account.bankCode ?? account.settlementBank;
    return bankOptions.find((bank) => bank.value === code)?.label ?? code ?? "";
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const bankName =
      bankOptions.find((bank) => bank.value === settlementBank)?.label ??
      settlementBank;
    const trimmedNumber = accountNumber.trim();

    setSubmitting(true);
    try {
      let response;

      if (editingAccount && editingKind === "settlement") {
        response = await updateSettlementAccount(businessId, {
          settlementBank,
          accountNumber: trimmedNumber,
          reason,
          otp: otp.trim(),
        });
      } else if (editingAccount) {
        // No update endpoint — add the new version, then remove the old one
        // only once the add has succeeded so nothing is lost on failure.
        response = await addBankAccount(businessId, {
          accountNumber: trimmedNumber,
          accountName: accountName.trim(),
          bankName,
          bankCode: settlementBank,
          isDefault,
        });
        const oldId = accountIdOf(editingAccount);
        if (succeeded(response) && oldId) {
          await deleteBankAccount(businessId, oldId);
        }
      } else if (isOnboarded) {
        response = await addBankAccount(businessId, {
          accountNumber: trimmedNumber,
          accountName: accountName.trim(),
          bankName,
          bankCode: settlementBank,
          isDefault,
        });
      } else {
        response = await onboardBusiness(businessId, {
          settlementBank,
          accountNumber: trimmedNumber,
          otp: otp.trim(),
          termsAccepted,
        });
      }

      if (!succeeded(response)) {
        toast.error(
          errorOf(response) ?? "Unable to save account. Please try again."
        );
        return;
      }

      toast.success(
        editingAccount
          ? "Account updated successfully"
          : "Payment account saved successfully"
      );
      resetForm();
      await loadAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDefault = async (account: BankAccount) => {
    const id = accountIdOf(account);
    // set-default only promotes an account; it can't be toggled off directly.
    if (!id || account.isDefault) return;

    setSettingDefaultId(id);
    try {
      const response = await setDefaultBankAccount(businessId, id);
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to set preferred account.");
        return;
      }
      toast.success("Preferred account updated");
      await loadAccounts();
    } finally {
      setSettingDefaultId(undefined);
    }
  };

  const confirmDelete = (account: BankAccount, kind: EditKind) => {
    setPendingDelete(account);
    setPendingDeleteKind(kind);
    onOpen();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    try {
      let response;
      if (pendingDeleteKind === "settlement") {
        response = await deleteSettlementAccount(businessId);
      } else {
        const id = accountIdOf(pendingDelete);
        if (!id) return;
        response = await deleteBankAccount(businessId, id);
      }

      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to remove account.");
        return;
      }
      toast.success("Account removed");
      onClose();
      setPendingDelete(null);
      setPendingDeleteKind(null);
      await loadAccounts();
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    resetForm();
    setMode(isOnboarded ? "details" : "empty");
  };

  const AccountActions = ({
    account,
    kind,
  }: {
    account: BankAccount;
    kind: EditKind;
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => openEditForm(account, kind)}
        aria-label="Edit account"
        className="text-[#667085] transition-colors hover:text-primaryColor"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => confirmDelete(account, kind)}
        aria-label="Remove account"
        className="text-[#D42620] transition-colors hover:text-[#a51d18]"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-6">
        <Spinner color="secondary" />
      </div>
    );
  }

  // Empty state — no payment account created yet.
  if (mode === "empty") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 p-8 sm:p-12">

        {/* Illustration */}
        <div className="relative flex items-center justify-center">
          {/* Glow rings */}
          <div className="absolute h-48 w-48 rounded-full bg-purple-100 opacity-50" />
          <div className="absolute h-36 w-36 rounded-full bg-purple-200 opacity-40" />

          {/* Card illustration */}
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="relative z-10 drop-shadow-lg">
            {/* Card body */}
            <rect x="8" y="28" width="104" height="68" rx="12" fill="url(#cardGrad)" />
            {/* Card shine */}
            <rect x="8" y="28" width="104" height="30" rx="12" fill="white" fillOpacity="0.12" />
            {/* Chip */}
            <rect x="20" y="48" width="22" height="16" rx="4" fill="#F9D98A" />
            <line x1="20" y1="54" x2="42" y2="54" stroke="#C9A830" strokeWidth="1" />
            <line x1="20" y1="58" x2="42" y2="58" stroke="#C9A830" strokeWidth="1" />
            <line x1="29" y1="48" x2="29" y2="64" stroke="#C9A830" strokeWidth="1" />
            <line x1="33" y1="48" x2="33" y2="64" stroke="#C9A830" strokeWidth="1" />
            {/* Contactless */}
            <path d="M52 52 Q56 56 52 60" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7"/>
            <path d="M56 49 Q62 56 56 63" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
            {/* Card number dots */}
            <circle cx="20" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="27" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="34" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="41" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="52" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="59" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="66" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="73" cy="80" r="2.5" fill="white" fillOpacity="0.9"/>
            {/* Last 4 digits */}
            <text x="82" y="84" fontSize="9" fontWeight="600" fill="white" fontFamily="monospace">4289</text>
            {/* Network logo rings */}
            <circle cx="92" cy="37" r="8" fill="#EB001B" fillOpacity="0.85"/>
            <circle cx="101" cy="37" r="8" fill="#F79E1B" fillOpacity="0.85"/>
            <defs>
              <linearGradient id="cardGrad" x1="8" y1="28" x2="112" y2="96" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C3DE8"/>
                <stop offset="1" stopColor="#9B59F5"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Floating coin */}
          <div className="absolute -top-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 shadow-md text-white text-base font-bold z-20">
            ₦
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-[22px] font-semibold text-[#101928]">
            Set up your payment account
          </h2>
          <p className="text-sm text-[#667085] leading-relaxed">
            Connect a bank account to start receiving settlements directly. It only takes a minute.
          </p>
        </div>

        {/* Benefit chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Instant Settlements", "Secure & Encrypted", "Multiple Accounts"].map((label) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-primaryColor">
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M3.5 6 L5.2 7.8 L8.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <CustomButton
          className="h-[52px] w-full max-w-[260px] px-6 text-base font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
          onClick={openCreateForm}
        >
          + Create Payment Account
        </CustomButton>
      </div>
    );
  }

  // Create/add/edit account form.
  if (mode === "form") {
    const heading = editingAccount
      ? "Edit payment account"
      : isOnboarded
      ? "Add a payment account"
      : "Create payment account";
    
    const subHeading = editingAccount
      ? "Update your payment account details for settlements."
      : "Provide your bank details to receive settlements securely.";

    return (
      <>
        <div className="p-6 sm:p-8">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
            {/* Header Area */}
            <div className="border-b border-[#E4E7EC] bg-[#F9FAFB] p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-50">
                  <CreditCard className="h-6 w-6 text-primaryColor" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#101928]">{heading}</h2>
                  <p className="mt-1 text-sm text-[#475467]">{subHeading}</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <CustomInput
                  type="text"
                  name="accountName"
                  label="Account Name"
                  placeholder="e.g. John Doe"
                  value={accountName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAccountName(e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SelectInput
                  label="Settlement Bank"
                  name="settlementBank"
                  placeholder="Select bank"
                  contents={bankOptions}
                  value={settlementBank}
                  selectedKeys={settlementBank ? [settlementBank] : []}
                  onChange={(e: { target: { value: string } }) =>
                    setSettlementBank(e.target.value)
                  }
                />
                <CustomInput
                  type="text"
                  name="accountNumber"
                  label="Account Number"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
              </div>

              {!isOnboarded && (
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#E4E7EC] text-primaryColor focus:ring-primaryColor"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="termsAccepted" className="text-sm leading-snug text-[#475467] cursor-pointer">
                    I accept the <span className="font-medium text-primaryColor">Terms and Conditions</span> for managing the settlement account.
                  </label>
                </div>
              )}

              {showDefaultToggle && (
                <div className="flex items-center justify-between rounded-xl border border-[#E4E7EC] px-5 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#101928]">
                      Set as preferred account
                    </span>
                    <span className="mt-0.5 text-xs text-[#667085]">
                      Payments will be settled to this account.
                    </span>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={isDefault}
                    onValueChange={setIsDefault}
                    classNames={{
                      wrapper: `m-0 ${isDefault ? "!bg-primaryColor" : "bg-[#E4E7EC]"}`,
                    }}
                    aria-label="Set as preferred account"
                  />
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between gap-4 border-t border-[#E4E7EC] bg-[#F9FAFB] p-6 sm:px-8 sm:py-5">
              <CustomButton
                className="h-11 w-full max-w-[140px] border border-[#E4E7EC] px-6 text-sm font-semibold text-[#344054] transition-colors hover:bg-gray-50"
                backgroundColor="bg-white"
                disabled={submitting}
                onClick={handleBack}
              >
                Back
              </CustomButton>
              {!isOnboarded && !onboardOtpSent ? (
                <CustomButton
                  className="h-11 w-full max-w-[200px] px-6 text-sm font-semibold text-white shadow-sm"
                  disabled={!canRequestOnboardOtp}
                  loading={submitting}
                  onClick={handleRequestOnboardOtp}
                >
                  Request OTP
                </CustomButton>
              ) : (
                <CustomButton
                  className="h-11 w-full max-w-[200px] px-6 text-sm font-semibold text-white shadow-sm"
                  disabled={!canSubmit}
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  {editingAccount ? "Save Changes" : "Complete Setup"}
                </CustomButton>
              )}
            </div>
          </div>
        </div>

      {/* ── Onboard: OTP prompt modal ── */}
      <Modal
        isOpen={isOnboardPromptOpen}
        onOpenChange={onOnboardPromptOpenChange}
        placement="center"
        classNames={{ closeButton: "top-4 right-4 text-[#667085]" }}
      >
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="px-6 pb-0 pt-6" />
              <ModalBody className="px-6 py-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                    <Mail className="h-7 w-7 text-primaryColor" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#101928]">Verify your identity</h3>
                    <p className="text-sm leading-relaxed text-[#475467]">
                      To complete your account setup, we&apos;ll send a one-time password
                      (OTP) to your registered email address. Please confirm to continue.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="gap-3 px-6 pb-6 pt-2">
                <CustomButton
                  className="h-[44px] w-full border border-[#E4E7EC] font-semibold text-[#344054]"
                  backgroundColor="bg-white"
                  disabled={submitting}
                  onClick={close}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="h-[44px] w-full font-semibold text-white"
                  loading={submitting}
                  onClick={handleOnboardSendOtp}
                >
                  Send OTP
                </CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Onboard: OTP entry modal ── */}
      <Modal
        isOpen={isOnboardOtpOpen}
        onOpenChange={onOnboardOtpOpenChange}
        placement="center"
        classNames={{ closeButton: "top-4 right-4 text-[#667085]" }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="px-6 pb-0 pt-6" />
              <ModalBody className="px-6 py-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                    <ShieldCheck className="h-7 w-7 text-primaryColor" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#101928]">Enter OTP</h3>
                    <p className="text-sm leading-relaxed text-[#475467]">
                      A one-time password has been sent to your registered email.
                      Enter it below to complete your account setup.
                    </p>
                  </div>
                  <div className="w-full">
                    <CustomInput
                      type="text"
                      name="onboard-otp"
                      label="One-Time Password"
                      placeholder="Enter OTP"
                      value={onboardOtp}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOnboardOtp(e.target.value.trim())
                      }
                    />
                    {/* Resend link */}
                    <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                      <span className="text-[#667085]">Didn&apos;t receive it?</span>
                      {onboardResendCountdown > 0 ? (
                        <span className="text-[#98A2B3]">
                          Resend in{" "}
                          <span className="font-semibold text-primaryColor">{onboardResendCountdown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOnboardResendOtp}
                          disabled={submitting}
                          className="font-semibold text-primaryColor transition-opacity hover:opacity-70 disabled:opacity-40"
                        >
                          {submitting ? "Sending…" : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="gap-3 px-6 pb-6 pt-2">
                <CustomButton
                  className="h-[44px] w-full border border-[#E4E7EC] font-semibold text-[#344054]"
                  backgroundColor="bg-white"
                  disabled={submitting}
                  onClick={() => { onOnboardOtpClose(); setOnboardOtp(""); }}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="h-[44px] w-full font-semibold text-white"
                  disabled={onboardOtp.trim().length === 0}
                  loading={submitting}
                  onClick={handleOnboardVerifyAndSubmit}
                >
                  Verify &amp; Complete
                </CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      </>
    );
  }

  // Details state — settlement account and any other accounts.
  return (
    <div className="space-y-8 p-6 sm:p-8">
      {settlementAccount && (
        <div className="space-y-4 rounded-lg bg-[#F9FAFB] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-semibold text-[#101928]">
              Settlement Account Details
            </h3>
            <AccountActions account={settlementAccount} kind="settlement" />
          </div>
          <div className="space-y-3">
            <DetailRow
              label="Account Name"
              value={settlementAccount.accountName}
            />
            <DetailRow
              label="Bank Name"
              value={resolveBankName(settlementAccount)}
            />
            <DetailRow
              label="Account Number"
              value={settlementAccount.accountNumber}
            />
          </div>
        </div>
      )}

      {bankAccounts.length > 0 && (
        <div className="space-y-5 px-1">
          <h3 className="text-base font-semibold text-[#101928]">
            Other Payment Options
          </h3>
          {[...bankAccounts]
            .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
            .map((account) => (
            <div
              key={accountKey(account)}
              className="flex items-start justify-between gap-4 border-b border-[#F0F2F5] pb-5 last:border-b-0 last:pb-0"
            >
              <div className="space-y-3">
                <DetailRow label="Account Name" value={account.accountName} />
                <DetailRow label="Bank Name" value={resolveBankName(account)} />
                <DetailRow
                  label="Account Number"
                  value={account.accountNumber}
                />
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#667085]">Preferred</span>
                  <Switch
                    size="sm"
                    isSelected={!!account.isDefault}
                    isDisabled={
                      !!account.isDefault ||
                      settingDefaultId === accountIdOf(account)
                    }
                    onValueChange={() => handleToggleDefault(account)}
                    classNames={{
                      wrapper: `m-0 ${
                        account.isDefault ? "!bg-primaryColor" : "bg-[#E4E7EC]"
                      }`,
                    }}
                    aria-label="Set as preferred account"
                  />
                </div>
                <AccountActions account={account} kind="other" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <CustomButton
          className="h-[56px] w-full max-w-[280px] px-6 font-semibold text-white"
          onClick={openCreateForm}
        >
          Add Other Accounts
        </CustomButton>
      </div>

      {/* ── Delete confirmation modal ── */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        classNames={{ closeButton: "top-4 right-4 text-[#667085]" }}
      >
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="px-6 pb-2 pt-6 text-lg font-semibold text-[#101928]">
                Remove bank account
              </ModalHeader>
              <ModalBody className="px-6 py-2">
                <p className="text-sm leading-6 text-[#475467]">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-[#101928]">
                    {pendingDelete?.accountName}
                  </span>{" "}
                  ({pendingDelete?.accountNumber})? This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter className="gap-3 px-6 pb-6 pt-4">
                <CustomButton
                  className="h-[44px] w-auto px-5 border border-[#E4E7EC] font-semibold text-[#344054]"
                  backgroundColor="bg-white"
                  disabled={deleting}
                  onClick={close}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="h-[44px] w-auto px-5 font-semibold text-white"
                  backgroundColor="bg-[#D42620]"
                  loading={deleting}
                  onClick={handleDelete}
                >
                  Remove
                </CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Step 1: OTP prompt modal ── */}
      <Modal
        isOpen={isOtpPromptOpen}
        onOpenChange={onOtpPromptOpenChange}
        placement="center"
        classNames={{ closeButton: "top-4 right-4 text-[#667085]" }}
      >
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="px-6 pb-0 pt-6" />
              <ModalBody className="px-6 py-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                    <Mail className="h-7 w-7 text-primaryColor" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#101928]">
                      Verify your identity
                    </h3>
                    <p className="text-sm leading-relaxed text-[#475467]">
                      To edit this payment account, we'll send a one-time password
                      (OTP) to your registered email address. Please confirm to
                      continue.
                    </p>
                  </div>
                  <div className="w-full rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-3 text-left">
                    <p className="text-xs text-[#667085]">Account</p>
                    <p className="mt-0.5 text-sm font-medium text-[#101928]">
                      {pendingEditAccount?.accountName}
                    </p>
                    <p className="text-xs text-[#667085]">
                      {pendingEditAccount?.accountNumber}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="gap-3 px-6 pb-6 pt-2">
                <CustomButton
                  className="h-[44px] w-full border border-[#E4E7EC] font-semibold text-[#344054]"
                  backgroundColor="bg-white"
                  disabled={sendingOtp}
                  onClick={close}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="h-[44px] w-full font-semibold text-white"
                  loading={sendingOtp}
                  onClick={handleSendEditOtp}
                >
                  Send OTP
                </CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Step 2: OTP entry modal ── */}
      <Modal
        isOpen={isOtpEntryOpen}
        onOpenChange={onOtpEntryOpenChange}
        placement="center"
        classNames={{ closeButton: "top-4 right-4 text-[#667085]" }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="px-6 pb-0 pt-6" />
              <ModalBody className="px-6 py-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                    <ShieldCheck className="h-7 w-7 text-primaryColor" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#101928]">
                      Enter OTP
                    </h3>
                    <p className="text-sm leading-relaxed text-[#475467]">
                      A one-time password has been sent to your registered email.
                      Enter it below to proceed with editing.
                    </p>
                  </div>
                  <div className="w-full">
                    <CustomInput
                      type="text"
                      name="edit-otp"
                      label="One-Time Password"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOtp(e.target.value.trim())
                      }
                    />
                    {/* Resend link */}
                    <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                      <span className="text-[#667085]">Didn&apos;t receive it?</span>
                      {resendCountdown > 0 ? (
                        <span className="text-[#98A2B3]">
                          Resend in <span className="font-semibold text-primaryColor">{resendCountdown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendEditOtp}
                          disabled={sendingOtp}
                          className="font-semibold text-primaryColor transition-opacity hover:opacity-70 disabled:opacity-40"
                        >
                          {sendingOtp ? "Sending…" : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="gap-3 px-6 pb-6 pt-2">
                <CustomButton
                  className="h-[44px] w-full border border-[#E4E7EC] font-semibold text-[#344054]"
                  backgroundColor="bg-white"
                  disabled={verifyingOtp}
                  onClick={() => { onOtpEntryClose(); setOtp(""); }}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="h-[44px] w-full font-semibold text-white"
                  disabled={otp.trim().length === 0}
                  loading={verifyingOtp}
                  onClick={handleVerifyEditOtp}
                >
                  Verify &amp; Continue
                </CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
