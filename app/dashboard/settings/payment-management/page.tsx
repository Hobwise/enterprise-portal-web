"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Pencil, Trash2 } from "lucide-react";
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
  getBankAccounts,
  getBanks,
  onboardBusiness,
  setDefaultBankAccount,
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

  // Edit mode — set when editing an existing account.
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editingKind, setEditingKind] = useState<EditKind | null>(null);

  // Per-account async guard for the default toggle.
  const [settingDefaultId, setSettingDefaultId] = useState<
    string | undefined
  >();

  // Delete confirmation.
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    !submitting;

  const resetForm = () => {
    setAccountName(defaultBusinessName);
    setSettlementBank("");
    setAccountNumber("");
    setIsDefault(false);
    setEditingAccount(null);
    setEditingKind(null);
  };

  const openCreateForm = () => {
    resetForm();
    setMode("form");
  };

  const openEditForm = (account: BankAccount, kind: EditKind) => {
    setEditingAccount(account);
    setEditingKind(kind);
    setAccountName(account.accountName ?? defaultBusinessName);
    setSettlementBank(account.bankCode ?? account.settlementBank ?? "");
    setAccountNumber(account.accountNumber ?? "");
    setIsDefault(!!account.isDefault);
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
        // No update endpoint — re-onboard to change the settlement account.
        response = await onboardBusiness(businessId, {
          settlementBank,
          accountNumber: trimmedNumber,
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
        toast.error(errorOf(response) ?? "Unable to set default account.");
        return;
      }
      toast.success("Default account updated");
      await loadAccounts();
    } finally {
      setSettingDefaultId(undefined);
    }
  };

  const confirmDelete = (account: BankAccount) => {
    setPendingDelete(account);
    onOpen();
  };

  const handleDelete = async () => {
    const id = pendingDelete ? accountIdOf(pendingDelete) : undefined;
    if (!id) return;

    setDeleting(true);
    try {
      const response = await deleteBankAccount(businessId, id);
      if (!succeeded(response)) {
        toast.error(errorOf(response) ?? "Unable to remove account.");
        return;
      }
      toast.success("Account removed");
      onClose();
      setPendingDelete(null);
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
        onClick={() => confirmDelete(account)}
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
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-10 p-6 sm:p-10">
        <h2 className="max-w-md text-center text-2xl font-medium text-[#344054]">
          Create a payment account with us to ease your payment
        </h2>
        <CustomButton
          className="h-[56px] w-full max-w-[320px] px-6 text-base font-semibold text-white"
          onClick={openCreateForm}
        >
          Create Account
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
      : "Create a payment account with us";

    return (
      <div className="space-y-8 p-6 sm:p-8">
        <h2 className="text-2xl font-medium text-[#344054]">{heading}</h2>

        <div className="max-w-2xl space-y-6">
          <CustomInput
            type="text"
            name="accountName"
            label="Account Name"
            placeholder="Account name"
            value={accountName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAccountName(e.target.value)
            }
          />

          <SelectInput
            label="Settlement Bank"
            name="settlementBank"
            placeholder="Select your bank name"
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

          {showDefaultToggle && (
            <div className="flex items-center justify-between rounded-lg border border-[#E4E7EC] px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#101928]">
                  Set as default account
                </span>
                <span className="text-xs text-[#667085]">
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
                aria-label="Set as default account"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <CustomButton
            className="h-[52px] w-full max-w-[220px] border border-[#E4E7EC] px-6 text-[#98A2B3]"
            backgroundColor="bg-white"
            disabled={submitting}
            onClick={handleBack}
          >
            Back
          </CustomButton>
          <CustomButton
            className="h-[52px] w-full max-w-[260px] px-6 font-semibold text-white"
            disabled={!canSubmit}
            loading={submitting}
            onClick={handleSubmit}
          >
            {editingAccount ? "Save Changes" : "Create Account"}
          </CustomButton>
        </div>
      </div>
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
          {bankAccounts.map((account) => (
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
                  <span className="text-xs text-[#667085]">Default</span>
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
                    aria-label="Set as default account"
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
    </div>
  );
};

export default PaymentManagement;
