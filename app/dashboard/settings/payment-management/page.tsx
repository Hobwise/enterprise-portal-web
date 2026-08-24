"use client";
import { TermsAndConditionsContent } from "@/app/privacy-policy/TermsAndConditionsContent";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
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
import { Pencil, Trash2, ShieldCheck, Mail, CreditCard, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
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
  requestBankAccountOtp,
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

// Extract a human-readable error string from the API response.
// The API can return error as:
//   • a plain string:  { error: "Some message" }
//   • a nested object: { error: { responseCode: "H003", responseDescription: "..." } }
const errorOf = (response: any): string | undefined => {
  const err = response?.data?.error;
  if (!err) return undefined;
  if (typeof err === "string") return err;
  // Nested object shape — prefer responseDescription, fall back to responseCode
  return err?.responseDescription || err?.responseCode || undefined;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3 text-sm">
    <span className="w-32 shrink-0 text-[#667085]">{label}:</span>
    <span className="font-medium text-[#101928]">{value}</span>
  </div>
);

// Generates bank initials avatar from bank name
const BankInitials = ({ name }: { name: string }) => {
  const words = name.trim().split(/\s+/);
  const initials = words.length >= 2
    ? `${words[0][0]}${words[1][0]}`
    : name.slice(0, 2);
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-primaryColor uppercase">
      {initials}
    </div>
  );
};

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
  const [reason, setReason] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [termsModalTab, setTermsModalTab] = useState<"privacy" | "terms" | "guide">("terms");

  const {
    isOpen: isTermsModalOpen,
    onOpen: onTermsModalOpen,
    onOpenChange: onTermsModalOpenChange,
    onClose: onTermsModalClose,
  } = useDisclosure();
  const [onboardOtpSent, setOnboardOtpSent] = useState<boolean>(false);
  // Controls which sub-step is shown inside mode==="form" for new/add-account flows
  const [formStep, setFormStep] = useState<"bankDetails" | "verifyOtp">("bankDetails");

  // Bank search state
  const [bankSearch, setBankSearch] = useState<string>("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState<boolean>(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const hasCheckedTerms = useRef<boolean>(false);

  const filteredBankOptions = useMemo(() => {
    const q = bankSearch.toLowerCase().trim();
    if (!q) return bankOptions;

    const searchTerms = q.split(/\s+/).filter(Boolean);

    return bankOptions
      .filter((b) => {
        const labelStr = (b.label || "").toLowerCase();
        // Split label into word tokens so "bank" won't match inside "bankit"
        const tokens = labelStr.split(/[^a-z0-9]+/).filter(Boolean);
        return searchTerms.every((term) =>
          tokens.some((token) => token.startsWith(term))
        );
      })
      .sort((a, b) => {
        const aLabel = (a.label || "").toLowerCase();
        const bLabel = (b.label || "").toLowerCase();

        // Exact match wins
        if (aLabel === q) return -1;
        if (bLabel === q) return 1;

        // Starts-with next
        const aStarts = aLabel.startsWith(q);
        const bStarts = bLabel.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return aLabel.localeCompare(bLabel);
      });
  }, [bankSearch, bankOptions]);

  const selectedBankLabel = useMemo(
    () => bankOptions.find((b) => b.value === settlementBank)?.label ?? "",
    [settlementBank, bankOptions]
  );

  // Close bank dropdown when clicking outside.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
        setBankDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    return hasAny;
  }, [businessId]);

  const { data: banksData } = useQuery<Bank[]>({
    queryKey: ["banksList"],
    queryFn: async () => {
      const response = await getBanks();
      return response?.data?.data ?? [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (banksData) {
      const seen = new Set<string>();
      const uniqueBanks = banksData.filter((bank: Bank) => {
        const key = bank.code || bank.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setBankOptions(
        uniqueBanks.map((bank: Bank) => ({
          label: bank.name,
          value: bank.code,
        }))
      );
    }
  }, [banksData]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const hasAny = await loadAccounts();
        if (mounted) {
          if (!hasAny && !hasCheckedTerms.current) {
            hasCheckedTerms.current = true;
            onTermsModalOpen();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [loadAccounts, onTermsModalOpen]);

  const canSubmit =
    accountName.trim().length > 0 &&
    settlementBank.length > 0 &&
    accountNumber.trim().length === 10 &&
    (editingKind === "settlement" ? (otp.trim().length > 0 && reason.trim().length > 0) : true) &&
    // For existing accounts being edited, OTP is required; for new onboarding OTP is collected via modal after Proceed
    (editingAccount ? otp.trim().length > 0 : true) &&
    !submitting;

  // For new onboarding: can proceed to request OTP when bank details are filled
  const canProceedToOtp =
    !isOnboarded &&
    !editingAccount &&
    accountName.trim().length > 0 &&
    settlementBank.length > 0 &&
    accountNumber.trim().length === 10 &&
    termsAccepted &&
    !submitting;

  // For adding another account (already onboarded): can proceed to request OTP when bank details are filled
  const canProceedAddAccount =
    isOnboarded &&
    !editingAccount &&
    accountName.trim().length > 0 &&
    settlementBank.length > 0 &&
    accountNumber.trim().length === 10 &&
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

  // "Proceed" button on the bank details form — calls acceptOnboardTerms, sends OTP, then shows inline OTP step.
  const handleProceedToOtp = async () => {
    if (!canProceedToOtp) return;
    setSubmitting(true);
    try {
      const response = await acceptOnboardTerms(businessId, { termsAccepted: true });
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to request OTP. Please try again.");
        return;
      }
      setOnboardOtpSent(true);
      setTermsAccepted(true);
      toast.success("OTP sent to your email.");
      setOnboardOtp("");
      startOnboardResendCountdown();
      setFormStep("verifyOtp");
    } finally {
      setSubmitting(false);
    }
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

  // Resend OTP — uses requestBankAccountOtp when adding another account, acceptOnboardTerms otherwise.
  const handleOnboardResendOtp = async () => {
    if (onboardResendCountdown > 0) return;
    setSubmitting(true);
    try {
      const response = isOnboarded
        ? await requestBankAccountOtp(businessId)
        : await acceptOnboardTerms(businessId, { termsAccepted });
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

  // Verify OTP and submit — onboardBusiness for first-time setup, addBankAccount when adding another account.
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
      let response;
      if (isOnboarded) {
        // Adding another account to an already-onboarded business
        response = await addBankAccount(businessId, {
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          bankName,
          bankCode: settlementBank,
          isDefault,
          otp: onboardOtp.trim(),
        });
      } else {
        // First-time onboarding
        response = await onboardBusiness(businessId, {
          settlementBank,
          accountNumber: accountNumber.trim(),
          otp: onboardOtp.trim(),
          termsAccepted: true,
        });
      }
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to save account. Please try again.");
        return;
      }
      toast.success(isOnboarded ? "Payment account added successfully" : "Payment account saved successfully");
      setFormStep("bankDetails");
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
    setFormStep("bankDetails");
  };

  const openCreateForm = () => {
    const currentTerms = termsAccepted;
    const currentOtpSent = onboardOtpSent;
    resetForm();
    setTermsAccepted(currentTerms);
    setOnboardOtpSent(currentOtpSent);
    setMode("form");
  };

  // Add Other Accounts: just navigate to the form; OTP is requested only after the user fills bank details.
  const handleAddOtherAccounts = () => {
    resetForm();
    setTermsAccepted(true);
    setOnboardOtpSent(true);
    setMode("form");
  };

  // "Proceed" button on the add-account form — calls requestBankAccountOtp, then shows inline OTP step.
  const handleProceedAddAccountOtp = async () => {
    if (!canProceedAddAccount) return;
    setSubmitting(true);
    try {
      const response = await requestBankAccountOtp(businessId);
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to request OTP. Please try again.");
        return;
      }
      toast.success("OTP sent to your email.");
      setOnboardOtp("");
      startOnboardResendCountdown();
      setFormStep("verifyOtp");
    } finally {
      setSubmitting(false);
    }
  };

  // T&C accepted — just navigate to the bank details form; API is called only after the user fills in their details.
  const handleAcceptTermsAndContinue = () => {
    setTermsAccepted(true);
    onTermsModalClose();
    resetForm();
    setTermsAccepted(true);
    setMode("form");
  };

  // Resend OTP for onboarding (from the inline form OTP field).
  const handleResendOnboardOtp = async () => {
    if (onboardResendCountdown > 0) return;
    setSubmitting(true);
    try {
      const response = await acceptOnboardTerms(businessId, { termsAccepted: true });
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to resend OTP. Please try again.");
        return;
      }
      toast.success("OTP resent to your email.");
      setOtp("");
      startOnboardResendCountdown();
    } finally {
      setSubmitting(false);
    }
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
      } else {
        const accountId = accountIdOf(pendingEditAccount);
        if (!accountId) {
          toast.error("Account ID missing.");
          return;
        }
        const response = await requestBankAccountOtp(businessId, accountId);
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
    if (resendCountdown > 0 || !pendingEditKind || !pendingEditAccount) return;
    setSendingOtp(true);
    try {
      if (pendingEditKind === "settlement") {
        const response = await requestSettlementOtp(businessId);
        if (!succeeded(response)) {
          toast.error(errorOf(response) ?? "Unable to resend OTP. Please try again.");
          return;
        }
      } else {
        const accountId = accountIdOf(pendingEditAccount);
        if (!accountId) return;
        const response = await requestBankAccountOtp(businessId, accountId);
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
    if (otp.trim().length === 0) {
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
          otp: otp.trim(),
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
          otp: otp.trim(),
        });
      } else {
        response = await onboardBusiness(businessId, {
          settlementBank,
          accountNumber: trimmedNumber,
          otp: otp.trim(),
          termsAccepted: true,
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

  const onboardOtpModal = (
    <>
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
                          <h3 className="text-lg font-semibold text-[#101928]">Verify OTP</h3>
                          <p className="text-sm leading-relaxed text-[#475467]">
                            A one-time password has been sent to your registered email.
                            Enter it below to complete your account setup.
                          </p>
                        </div>
                        <div className="w-full">
                          <CustomInput
                            type="text"
                            name="onboard-otp"
                            label="Verify OTP"
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

  const termsModal = (
    <Modal
      isOpen={isTermsModalOpen}
      onOpenChange={onTermsModalOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{ closeButton: "top-4 right-4 text-[#667085]" }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-0 px-6 pb-0 pt-6">
              <h2 className="text-xl font-semibold text-[#101928]">Review Terms &amp; Conditions</h2>
              <p className="text-xs text-[#667085] font-normal mt-1">
                Please read all sections before accepting.
              </p>
              {/* Tab bar */}
              <div className="flex gap-0 mt-4 border-b border-[#E4E7EC] w-full -mx-0">
                {([
                  { key: "privacy", label: "Privacy Policy" },
                  { key: "terms",   label: "Terms Of Use" },
                  { key: "guide",   label: "User Guide" },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTermsModalTab(key)}
                    className={[
                      "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
                      termsModalTab === key
                        ? "border-primaryColor text-primaryColor"
                        : "border-transparent text-[#667085] hover:text-[#344054] hover:border-[#D0D5DD]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              <div className="text-[#101928] text-sm">
                {termsModalTab === "privacy" && (
                  <div className="space-y-5 leading-relaxed">
                    <div className="space-y-2">
                      <h2 className="text-base font-bold text-primaryColor">Welcome to Hobwise</h2>
                      <p>Hobwise is a modern hospitality management app designed to streamline operations for hotels, restaurants, bars, lounges, clubs, and coffee shops. It offers features like reservations, menu management, bookings, business analytics, and customer engagement tools. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our hospitality web app (HOBWISE). By accessing or using the App, you agree to the terms outlined below.</p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Information We Collect</h2>
                      <p>We collect the following types of information:</p>
                      <ul className="space-y-1.5">
                        <li>&#8226; <span className="font-medium">Personal Information:</span> Name, email address, phone number, business details provided during account registration or usage.</li>
                        <li>&#8226; <span className="font-medium">Usage Data:</span> Information about how you interact with the App, including IP address, device information, browser type, and pages viewed.</li>
                        <li>&#8226; <span className="font-medium">Transactional Data:</span> Details related to reservations, menu orders, bookings, and payments processed through the App.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">How We Use Your Information</h2>
                      <ul className="space-y-1.5">
                        <li>&#8226; Facilitate account registration, authentication, and access.</li>
                        <li>&#8226; Manage bookings, reservations, menus, and other hospitality-related operations.</li>
                        <li>&#8226; Process payments securely.</li>
                        <li>&#8226; Provide customer support.</li>
                        <li>&#8226; Send notifications about updates, features, or changes to the App.</li>
                        <li>&#8226; Improve the App&apos;s functionality and user experience.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Sharing Your Information</h2>
                      <p>We do not sell or rent your personal information. However, we may share your information with:</p>
                      <ul className="space-y-1.5">
                        <li>&#8226; <span className="font-medium">Service Providers:</span> Technical support.</li>
                        <li>&#8226; <span className="font-medium">Legal Authorities:</span> If required by law or to enforce our terms and policies.</li>
                        <li>&#8226; <span className="font-medium">Affiliates:</span> For business operations, where applicable.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Data Security</h2>
                      <p>We implement security measures to protect your information from unauthorised access, alteration, disclosure, or destruction.</p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Your Rights</h2>
                      <p>Depending on your location, you may have the following rights:</p>
                      <ul className="space-y-1.5">
                        <li>&#8226; Access and update your personal information.</li>
                        <li>&#8226; Request deactivation of your account.</li>
                        <li>&#8226; Opt-out of promotional communications.</li>
                      </ul>
                      <p>To exercise these rights, contact us at <a href="mailto:hello@hobwise.com" className="text-primaryColor underline">hello@hobwise.com</a>.</p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Cookies &amp; Tracking</h2>
                      <p>We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings.</p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Updates To This Privacy Policy</h2>
                      <p>We may update this Privacy Policy periodically. Changes will be effective upon posting to the App.</p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Contact Us</h2>
                      <p>If you have questions about this Privacy Policy, contact us at: <a href="mailto:hello@hobwise.com" className="text-primaryColor underline">hello@hobwise.com</a>.</p>
                    </div>
                  </div>
                )}
                {termsModalTab === "terms" && (
                  <div className="space-y-5 leading-relaxed overflow-y-auto max-h-[60vh] pr-2">
                    <TermsAndConditionsContent />
                  </div>
                )}
                {termsModalTab === "guide" && (
                  <div className="space-y-5 leading-relaxed">
                    <div className="space-y-2">
                      <h2 className="text-base font-bold text-primaryColor">Overview</h2>
                      <p>This guide will help you navigate the platform and use its key features, including managing menus, processing orders, creating QR codes, running campaigns, managing reservations, and handling payments.</p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Dashboard Overview</h2>
                      <p>The <span className="font-semibold">Dashboard</span> is the first screen you will see after logging in. It provides real-time analytics of your business operations, including orders, payments, and performance metrics.</p>
                      <ul className="space-y-1.5">
                        <li>&#8226; View analytics on sales, orders, menu and reservations.</li>
                        <li>&#8226; Access to quick performance summaries and reports.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Menu Management</h2>
                      <p>The Menu module allows you to create and manage your business offerings.</p>
                      <p className="font-semibold">Creating a New Menu:</p>
                      <ul className="space-y-1.5">
                        <li>1. Navigate to the <span className="font-semibold">Menu</span> module from the side panel.</li>
                        <li>2. Click on <span className="font-semibold">Create a New Menu.</span></li>
                        <li>3. Enter the Menu Name in the pop-up modal and click <span className="font-semibold">Save.</span></li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Order Management</h2>
                      <p>The Order module helps you manage and track customer orders efficiently.</p>
                      <p className="font-semibold">Creating a New Order:</p>
                      <ul className="space-y-1.5">
                        <li>1. Access the <span className="font-semibold">Order</span> module.</li>
                        <li>2. Click on <span className="font-semibold">Create Order.</span></li>
                        <li>3. Select the customer&apos;s items from the Menu.</li>
                        <li>4. Enter the customer&apos;s details (Name, Phone Number, Table, Comment).</li>
                        <li>5. Proceed to <span className="font-semibold">Checkout.</span></li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Handling Payments</h2>
                      <ul className="space-y-1.5">
                        <li>&#8226; Click the Payment Method you prefer from the payment method modal.</li>
                        <li>&#8226; Enter a Payment Reference Number (if available).</li>
                        <li>&#8226; Click <span className="font-semibold">Confirm Payment.</span></li>
                        <li>&#8226; If Pay Later is selected, the order remains <span className="font-semibold">Open</span> so the customer can add more items.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">QR Code Management</h2>
                      <p>The QR Code feature allows you to generate QR codes and map them to tables.</p>
                      <ul className="space-y-1.5">
                        <li>1. Navigate to the <span className="font-semibold">QR</span> module.</li>
                        <li>2. Click on <span className="font-semibold">Create a QR.</span></li>
                        <li>3. Input the Name for the QR code and save it.</li>
                        <li>4. Download the generated QR code or create another one.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Campaign Management</h2>
                      <p>The Campaign module lets you create and manage campaigns related to your business.</p>
                      <ul className="space-y-1.5">
                        <li>1. Go to the <span className="font-semibold">Campaign</span> module.</li>
                        <li>2. Click <span className="font-semibold">Add Campaign.</span></li>
                        <li>3. Fill in Time, Description, Start Date, End Date, and upload an Image.</li>
                        <li>4. Click <span className="font-semibold">Schedule Campaign</span> to finalise.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Reservation Management</h2>
                      <p>The Reservation module allows you to create and manage reservations for your restaurant.</p>
                      <ul className="space-y-1.5">
                        <li>1. Go to the <span className="font-semibold">Reservation</span> module.</li>
                        <li>2. Click on <span className="font-semibold">Add Reservation.</span></li>
                        <li>3. Fill out Reservation Name, Description, Fee, Minimum Spend, Quantity, and Image.</li>
                        <li>4. Click <span className="font-semibold">Add Reservation</span> to save.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Booking Management</h2>
                      <p>Manage customer bookings from the Booking module.</p>
                      <ul className="space-y-1.5">
                        <li>1. Access the <span className="font-semibold">Booking</span> module and enter customer details.</li>
                        <li>2. Click <span className="font-semibold">Create Booking.</span></li>
                        <li>3. To confirm, enter the Booking Reference Number and click <span className="font-semibold">Confirm.</span></li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Payment Management</h2>
                      <p>Handle payments via the <span className="font-semibold">Payments</span> module.</p>
                      <ul className="space-y-1.5">
                        <li>1. Once an order is created and payment is pending, go to the <span className="font-semibold">More</span> options icon on the order.</li>
                        <li>2. Click <span className="font-semibold">Confirm Payment</span> to complete the process.</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-base font-bold">Bills and Subscription</h2>
                      <p>Choosing a plan will allow you to manage the features you want for your business.</p>
                      <ul className="space-y-1.5">
                        <li>1. After login, navigate to the Settings page.</li>
                        <li>2. Click on <span className="font-semibold">Bills &amp; Subscription</span> to view all plans.</li>
                        <li>3. Select a plan and make payment through the gateway.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="gap-3 px-6 pb-6 pt-2 border-t border-[#E4E7EC]">
              <CustomButton
                className="h-[44px] w-full border border-[#E4E7EC] font-semibold text-[#344054]"
                backgroundColor="bg-white"
                onClick={onTermsModalClose}
              >
                Cancel
              </CustomButton>
              <CustomButton
                className="h-[44px] w-full font-semibold text-white"
                onClick={handleAcceptTermsAndContinue}
              >
                Accept &amp; Continue
              </CustomButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
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

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 w-full max-w-sm">
          <input
            type="checkbox"
            id="emptyTermsAccepted"
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#E4E7EC] text-primaryColor focus:ring-primaryColor"
            checked={termsAccepted}
            onChange={(e) => {
              if (e.target.checked) {
                onTermsModalOpen();
              } else {
                setTermsAccepted(false);
              }
            }}
          />
          <label htmlFor="emptyTermsAccepted" className="text-sm leading-snug text-[#475467] cursor-pointer">
            I accept the{" "}
            <span className="font-medium text-primaryColor">Terms and Conditions</span>{" "}
            for managing the settlement account.
          </label>
        </div>

        {/* CTA */}
        <CustomButton
          className="h-[52px] w-full max-w-[260px] px-6 text-base font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
          disabled={!termsAccepted}
          onClick={openCreateForm}
        >
          + Onboard Settlement Account
        </CustomButton>
        {onboardOtpModal}
        {termsModal}
      </div>
    );
  }

  // Create/add/edit account form.
  if (mode === "form") {
    const isOtpStep = formStep === "verifyOtp" && !editingAccount;

    const heading = editingAccount
      ? "Edit payment account"
      : isOtpStep
      ? "Verify your identity"
      : isOnboarded
      ? "Add a payment account"
      : "Onboard Settlement Account";

    const subHeading = editingAccount
      ? "Update your payment account details for settlements."
      : isOtpStep
      ? "Enter the one-time password sent to your registered email."
      : "Provide your bank details to receive settlements securely.";

    return (
      <>
        <div className="p-6 sm:p-8">
          <div className="mx-auto max-w-2xl">

            {/* ── Step Indicator ── */}
            {!editingAccount && (
              <div className="mb-8 flex items-center gap-0">
                {/* Step 1 */}
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                    isOtpStep
                      ? "border-2 border-primaryColor bg-white text-primaryColor"
                      : "bg-primaryColor text-white"
                  }`}>
                    {isOtpStep ? (
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : "1"}
                  </div>
                  <span className={`text-xs font-semibold ${isOtpStep ? "text-[#98A2B3]" : "text-primaryColor"}`}>
                    Bank Details
                  </span>
                </div>
                {/* Connector */}
                <div className={`mb-5 h-px flex-1 transition-colors ${isOtpStep ? "bg-primaryColor" : "bg-gradient-to-r from-primaryColor to-[#E4E7EC]"}`} />
                {/* Step 2 */}
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                    isOtpStep
                      ? "bg-primaryColor text-white"
                      : "border-2 border-[#E4E7EC] bg-white text-[#98A2B3]"
                  }`}>
                    2
                  </div>
                  <span className={`text-xs font-semibold ${isOtpStep ? "text-primaryColor" : "text-[#98A2B3]"}`}>
                    Verify OTP
                  </span>
                </div>
              </div>
            )}

            {/* ── Header ── */}
            <div className="mb-7 flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isOtpStep ? "bg-purple-100" : "bg-purple-100"}`}>
                {isOtpStep
                  ? <ShieldCheck className="h-6 w-6 text-primaryColor" />
                  : <CreditCard className="h-6 w-6 text-primaryColor" />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#101928]">{heading}</h2>
                <p className="mt-0.5 text-sm text-[#667085]">{subHeading}</p>
              </div>
            </div>

            {/* ── OTP Step (Step 2) ── */}
            {isOtpStep ? (
              <>
                <div className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
                  {/* Section label */}
                  <div className="rounded-t-2xl border-b border-[#F0F2F5] bg-[#FAFAFA] px-6 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#98A2B3]">
                      One-Time Password
                    </p>
                  </div>

                  <div className="space-y-5 p-6">
                    {/* Email hint */}
                    <div className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primaryColor" />
                      <p className="text-sm text-[#475467]">
                        A 6-digit OTP has been sent to your registered email address. Check your inbox and enter it below.
                      </p>
                    </div>

                    {/* OTP input */}
                    <div className="pt-2">
                      <CustomInput
                        type="text"
                        name="onboard-otp"
                        label="Enter OTP"
                        placeholder="e.g. 123456"
                        value={onboardOtp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setOnboardOtp(e.target.value.replace(/\D/g, "").slice(0, 6).trim())
                        }
                      />
                      <p className="mt-1.5 text-xs text-[#98A2B3]">
                        OTP is valid for 10 minutes. Do not share it with anyone.
                      </p>
                    </div>

                    {/* Resend */}
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-[#667085]">Didn&apos;t receive it?</span>
                      {onboardResendCountdown > 0 ? (
                        <span className="text-[#98A2B3]">
                          Resend in <span className="font-semibold text-primaryColor">{onboardResendCountdown}s</span>
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

                  {/* Security strip */}
                  <div className="flex items-center gap-2.5 rounded-b-2xl border-t border-[#F0F2F5] bg-green-50 px-6 py-3">
                    <svg className="h-4 w-4 shrink-0 text-green-600" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L2 3.5v4c0 3.5 2.5 6.7 6 7.5 3.5-.8 6-4 6-7.5v-4L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M5.5 8l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-xs text-green-700">
                      Never share this OTP with anyone. Hobwise will never ask for your OTP over the phone.
                    </p>
                  </div>
                </div>

                {/* OTP Footer */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  <CustomButton
                    className="h-11 w-full max-w-[130px] border border-[#E4E7EC] px-6 text-sm font-semibold text-[#344054] transition-colors hover:bg-gray-50"
                    backgroundColor="bg-white"
                    disabled={submitting}
                    onClick={() => {
                      setFormStep("bankDetails");
                      setOnboardOtp("");
                    }}
                  >
                    ← Back
                  </CustomButton>
                  <CustomButton
                    className="h-11 flex-1 max-w-[240px] px-6 text-sm font-semibold text-white shadow-sm"
                    disabled={onboardOtp.trim().length === 0}
                    loading={submitting}
                    onClick={handleOnboardVerifyAndSubmit}
                  >
                    Verify &amp; Complete
                  </CustomButton>
                </div>
              </>
            ) : (
              <>
                {/* ── Form Card (Step 1) ── */}
                <div className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">

                  {/* Section label */}
                  <div className="rounded-t-2xl border-b border-[#F0F2F5] bg-[#FAFAFA] px-6 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#98A2B3]">
                      Account Information
                    </p>
                  </div>

                  <div className="space-y-5 p-6">
                    {/* Account Name */}
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
                      <p className="mt-1.5 text-xs text-[#98A2B3]">
                        This should match the name on your bank account exactly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Searchable Bank Dropdown */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#000]">Settlement Bank</label>
                        <div className="relative" ref={bankDropdownRef}>
                          <button
                            type="button"
                            onClick={() => { setBankDropdownOpen((o) => !o); setBankSearch(""); }}
                            className="flex w-full items-center justify-between rounded-[8px] border border-[#E4E7EC] bg-white px-3 py-[11px] text-sm text-left hover:border-[#C3ADFF] focus:border-[#C3ADFF] focus:outline-none min-h-[48px] transition-colors"
                            aria-haspopup="listbox"
                            aria-expanded={bankDropdownOpen}
                          >
                            <span className={selectedBankLabel ? "text-[#000]" : "text-[#98A2B3]"}>
                              {selectedBankLabel || "Select bank"}
                            </span>
                            <div className="flex items-center gap-1">
                              {settlementBank && (
                                <span
                                  role="button"
                                  aria-label="Clear bank selection"
                                  tabIndex={0}
                                  onClick={(e) => { e.stopPropagation(); setSettlementBank(""); setBankSearch(""); }}
                                  onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), setSettlementBank(""), setBankSearch(""))}
                                  className="flex h-4 w-4 items-center justify-center rounded-full text-[#98A2B3] hover:text-[#475467] cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                              <ChevronDown className={`h-4 w-4 text-[#98A2B3] transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {bankDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E4E7EC] bg-white shadow-xl">
                              <div className="flex items-center gap-2 border-b border-[#E4E7EC] px-3 py-2">
                                <Search className="h-4 w-4 shrink-0 text-[#98A2B3]" />
                                <input
                                  autoFocus
                                  type="text"
                                  placeholder="Search bank..."
                                  value={bankSearch}
                                  onChange={(e) => setBankSearch(e.target.value)}
                                  className="flex-1 bg-transparent text-sm text-[#101928] placeholder:text-[#98A2B3] focus:outline-none"
                                />
                                {bankSearch && (
                                  <button type="button" onClick={() => setBankSearch("")} className="text-[#98A2B3] hover:text-[#475467]">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              <ul role="listbox" className="max-h-[220px] overflow-y-auto py-1" aria-label="Bank options">
                                {filteredBankOptions.length === 0 ? (
                                  <li className="px-4 py-3 text-center text-sm text-[#98A2B3]">No banks found</li>
                                ) : (
                                  filteredBankOptions.map((bank) => (
                                    <li
                                      key={bank.value}
                                      role="option"
                                      aria-selected={settlementBank === bank.value}
                                      onClick={() => { setSettlementBank(bank.value); setBankDropdownOpen(false); setBankSearch(""); }}
                                      className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 hover:text-primaryColor ${
                                        settlementBank === bank.value ? "bg-purple-50 font-medium text-primaryColor" : "text-[#101928]"
                                      }`}
                                    >
                                      {bank.label}
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-[#98A2B3]">Select the bank where you receive payouts.</p>
                      </div>

                      {/* Account Number */}
                      <div>
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
                        <p className="mt-1.5 text-xs text-[#98A2B3]">Enter your 10-digit NUBAN account number.</p>
                      </div>
                    </div>

                    {/* Reason field (settlement edit only) */}
                    {editingAccount && editingKind === "settlement" && (
                      <div>
                        <CustomInput
                          type="text"
                          name="reason"
                          label="Reason for Update"
                          placeholder="e.g. Changed primary bank"
                          value={reason}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setReason(e.target.value)
                          }
                        />
                        <p className="mt-1.5 text-xs text-[#98A2B3]">
                          Briefly describe why you are updating the settlement account.
                        </p>
                      </div>
                    )}

                    {/* Preferred toggle */}
                    {showDefaultToggle && (
                      <div className="flex items-center justify-between rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                            <svg className="h-4 w-4 text-primaryColor" viewBox="0 0 16 16" fill="none">
                              <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.2l-3.7 2.1.7-4.1-3-2.9 4.2-.7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#101928]">Set as preferred account</span>
                            <p className="text-xs text-[#667085]">Payments will be settled to this account first.</p>
                          </div>
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

                    {/* Terms & Conditions Checkbox (Onboarding only) */}
                    {!isOnboarded && !editingAccount && (
                      <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                        <input
                          type="checkbox"
                          id="formTermsAccepted"
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#E4E7EC] text-primaryColor focus:ring-primaryColor"
                          checked={termsAccepted}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onTermsModalOpen();
                            } else {
                              setTermsAccepted(false);
                            }
                          }}
                        />
                        <label htmlFor="formTermsAccepted" className="text-sm leading-snug text-[#475467] cursor-pointer">
                          I accept the{" "}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onTermsModalOpen();
                            }}
                            className="font-medium text-primaryColor hover:underline cursor-pointer"
                          >
                            Terms and Conditions
                          </span>{" "}
                          for managing the settlement account.
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Security trust strip */}
                  <div className="flex items-center gap-2.5 rounded-b-2xl border-t border-[#F0F2F5] bg-green-50 px-6 py-3">
                    <svg className="h-4 w-4 shrink-0 text-green-600" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L2 3.5v4c0 3.5 2.5 6.7 6 7.5 3.5-.8 6-4 6-7.5v-4L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M5.5 8l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-xs text-green-700">
                      Your bank details are encrypted and stored securely. We never share them with third parties.
                    </p>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  <CustomButton
                    className="h-11 w-full max-w-[130px] border border-[#E4E7EC] px-6 text-sm font-semibold text-[#344054] transition-colors hover:bg-gray-50"
                    backgroundColor="bg-white"
                    disabled={submitting}
                    onClick={handleBack}
                  >
                    ← Back
                  </CustomButton>

                  {!isOnboarded && !editingAccount ? (
                    <CustomButton
                      type="button"
                      className="h-11 flex-1 max-w-[240px] px-6 text-sm font-semibold text-white shadow-sm"
                      disabled={!canProceedToOtp}
                      loading={submitting}
                      onClick={handleProceedToOtp}
                    >
                      Continue to Verify →
                    </CustomButton>
                  ) : isOnboarded && !editingAccount ? (
                    <CustomButton
                      type="button"
                      className="h-11 flex-1 max-w-[240px] px-6 text-sm font-semibold text-white shadow-sm"
                      disabled={!canProceedAddAccount}
                      loading={submitting}
                      onClick={handleProceedAddAccountOtp}
                    >
                      Continue to Verify →
                    </CustomButton>
                  ) : (
                    <CustomButton
                      className="h-11 flex-1 max-w-[240px] px-6 text-sm font-semibold text-white shadow-sm"
                      disabled={!canSubmit}
                      loading={submitting}
                      onClick={handleSubmit}
                    >
                      Save Changes
                    </CustomButton>
                  )}
                </div>
              </>
            )}

          </div>
        </div>

      {termsModal}
      </>
    );
  }





  // Details state — settlement account and any other accounts.
  return (
    <div className="space-y-6 p-6 sm:p-8">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-[#F0F2F5] pb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#101928]">Payment Accounts</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-[#667085]">
            Manage the bank accounts where Hobwise sends your settlements. Your{" "}
            <span className="font-medium text-[#344054]">Settlement Account</span> receives
            automatic payouts, while{" "}
            <span className="font-medium text-[#344054]">Other Accounts</span> can be
            used as alternate payment destinations.
          </p>
        </div>
      </div>

      {/* ── Settlement Account ── */}
      {settlementAccount && (
        <div className="overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {/* Card header strip */}
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F2F5] bg-[#F9FAFB] px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Primary Settlement
              </span>
            </div>
            <AccountActions account={settlementAccount} kind="settlement" />
          </div>

          {/* Card body */}
          <div className="flex items-start gap-4 p-5">
            <BankInitials name={resolveBankName(settlementAccount)} />
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-base font-semibold text-[#101928] truncate">{settlementAccount.accountName}</p>
              <p className="text-sm text-[#667085] truncate">{resolveBankName(settlementAccount)}</p>
              <p className="font-mono text-sm font-medium tracking-wider text-[#344054]">{settlementAccount.accountNumber}</p>
            </div>
          </div>

          {/* Info footer */}
          <div className="flex items-start gap-2.5 border-t border-[#F0F2F5] bg-purple-50 px-5 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-primaryColor" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" />
              <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="text-xs leading-relaxed text-primaryColor">
              All online payment settlements are automatically sent to this account.
              To change it, click the edit icon above.
            </p>
          </div>
        </div>
      )}

      {/* ── Other Payment Options ── */}
      {bankAccounts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#101928]">Other Payment Accounts</h3>
              <p className="text-xs text-[#98A2B3] mt-0.5">Alternate accounts customers or staff can pay into directly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...bankAccounts]
              .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
              .map((account) => (
              <div
                key={accountKey(account)}
                className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                  account.isDefault ? "border-primaryColor" : "border-[#E4E7EC]"
                }`}
              >
                {/* Preferred ribbon */}
                {account.isDefault && (
                  <div className="absolute right-0 top-0">
                    <div className="flex items-center gap-1 rounded-bl-xl bg-primaryColor px-2.5 py-1 text-[10px] font-semibold text-white">
                      <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M5 0l1.12 3.45H9.76L6.82 5.59l1.12 3.45L5 7.03l-2.94 2.01L3.18 5.59.24 3.45H3.88z" />
                      </svg>
                      Preferred
                    </div>
                  </div>
                )}

                {/* Card top: avatar + name + actions */}
                <div className="flex items-start justify-between gap-3 p-4 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <BankInitials name={resolveBankName(account)} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#101928] truncate">{account.accountName}</p>
                      <p className="text-xs text-[#667085] truncate">{resolveBankName(account)}</p>
                    </div>
                  </div>
                  <AccountActions account={account} kind="other" />
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-[#F0F2F5]" />

                {/* Account number + preferred toggle */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#98A2B3]">Account No.</p>
                    <p className="font-mono text-sm font-semibold text-[#344054]">{account.accountNumber}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#98A2B3]">Preferred</span>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Account CTA ── */}
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-[#C3ADFF] bg-purple-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <svg className="h-5 w-5 text-primaryColor" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9.5" stroke="currentColor" strokeWidth="1" />
              <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#101928]">Add another account</p>
            <p className="text-xs text-[#667085]">Link an alternate bank account for payments.</p>
          </div>
        </div>
        <CustomButton
          className="h-10 px-5 text-sm font-semibold text-white shadow-sm"
          loading={submitting}
          onClick={handleAddOtherAccounts}
        >
          + Add Account
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
      {onboardOtpModal}
      {termsModal}
    </div>
  );
};

export default PaymentManagement;
