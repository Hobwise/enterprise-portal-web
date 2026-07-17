"use client";
import { useState, useEffect } from "react";
import { initializeCustomerPayment } from "@/app/api/controllers/customerOrder";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { TbCopy } from "react-icons/tb";
import { FiArrowRight, FiX } from "react-icons/fi";
import { HiArrowLongLeft } from "react-icons/hi2";
import PaystackPop from "paystack-inline-ts";
import { CustomButton } from "@/components/customButton";

interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  isDefault: boolean;
}

interface PaymentData {
  accessCode?: string;
  authorizationUrl?: string;
  qrCodeBase64?: string;
  bankAccounts?: BankAccount[];
  expiresAt?: string;
  hobwiseReference?: string;
}

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  orderId: string;
  grandTotal: number;
  userId?: string;
  menuConfig?: {
    backgroundColour?: string;
    textColour?: string;
  };
  onPaymentSuccess?: () => void;
}

type PaymentTab = "online" | "qr" | "bank";

export default function PaymentSheet({
  isOpen,
  onClose,
  businessId,
  orderId,
  grandTotal,
  userId,
  menuConfig,
  onPaymentSuccess,
}: PaymentSheetProps) {
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryStyle = { backgroundColor: primaryColor };
  const primaryBorderStyle = { borderColor: primaryColor };
  const primaryTextStyle = { color: primaryColor };

  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [activeTab, setActiveTab] = useState<PaymentTab>("online");
  const [hasMadeTransfer, setHasMadeTransfer] = useState(false);

  useEffect(() => {
    if (!isOpen || !businessId || !orderId) return;

    const init = async () => {
      setLoading(true);
      setPaymentData(null);
      try {
        const amountKobo = Math.round(grandTotal * 100);
        const res = await initializeCustomerPayment(
          businessId,
          { orderId, customerEmail: "", amountKobo },
          userId
        );

        if (res?.isSuccessful && res?.data) {
          setPaymentData(res.data);
        } else {
          const msg = res?.error ?? (res === null ? "Server returned no data" : "Failed to initialize payment");
          toast.error(msg + ". Please try again.");
        }
      } catch {
        toast.error("Failed to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isOpen, businessId, orderId, grandTotal, userId]);

  const handlePayOnline = () => {
    if (!paymentData?.accessCode) return;
    const popup = new PaystackPop();
    popup.resumeTransaction({
      accessCode: paymentData.accessCode,
      onSuccess: () => {
        toast.success("Payment successful!");
        onPaymentSuccess?.();
        onClose();
      },
      onCancel: () => {
        toast.error("Payment cancelled.");
      },
    });
  };

  const copy = async (value: string, label = "Copied!") => {
    await navigator.clipboard.writeText(value);
    toast.success(label);
  };

  const handleMadeTransfer = () => {
    setHasMadeTransfer(true);
    toast.message("Transfer noted — we'll confirm your payment shortly.");
    setTimeout(() => {
      onPaymentSuccess?.();
      onClose();
    }, 2000);
  };

  const tabs: { id: PaymentTab; label: string }[] = [
    { id: "online", label: "Pay Online" },
    { id: "qr", label: "Scan QR" },
    { id: "bank", label: "Bank Transfer" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#161618]">Complete Payment</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatPrice(grandTotal, "NGN")} due
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FiX className="text-gray-600 text-sm" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex px-5 pt-4 gap-2 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                activeTab === tab.id
                  ? { ...primaryStyle, color: "#fff" }
                  : { backgroundColor: "#F4F4F6", color: "#45464E" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div
                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: primaryColor, borderTopColor: "transparent" }}
              />
              <p className="text-sm text-gray-500">Initializing payment…</p>
            </div>
          )}

          {!loading && !paymentData && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <p className="text-gray-500 text-sm">
                Could not load payment options. Please try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  initializeCustomerPayment(
                    businessId,
                    { orderId, customerEmail: "", amountKobo: Math.round(grandTotal * 100) },
                    userId
                  ).then((res) => {
                    if (res?.isSuccessful && res?.data) setPaymentData(res.data);
                  }).finally(() => setLoading(false));
                }}
                className="text-sm font-semibold underline"
                style={primaryTextStyle}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && paymentData && (
            <>
              {/* Online tab */}
              {activeTab === "online" && (
                <div className="flex flex-col items-center gap-5 py-2">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}18` }}
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[#161618] font-semibold">Pay with Card / Wallet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Secure payment via Paystack — card, USSD, or bank transfer
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-xl bg-gray-50 text-sm space-y-2">
                    <div className="flex justify-between text-gray-500">
                      <span>Amount</span>
                      <span className="font-semibold text-[#161618]">{formatPrice(grandTotal, "NGN")}</span>
                    </div>
                    {paymentData.hobwiseReference && (
                      <div className="flex justify-between text-gray-500">
                        <span>Reference</span>
                        <span className="font-mono text-xs text-[#161618] truncate ml-4">{paymentData.hobwiseReference}</span>
                      </div>
                    )}
                  </div>

                  <CustomButton
                    className="w-full h-[52px] font-semibold text-white"
                    backgroundColor={primaryColor}
                    style={primaryStyle}
                    onClick={handlePayOnline}
                    disabled={!paymentData.accessCode}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Pay {formatPrice(grandTotal, "NGN")} Now <FiArrowRight />
                    </span>
                  </CustomButton>
                </div>
              )}

              {/* QR tab */}
              {activeTab === "qr" && (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="text-center">
                    <p className="text-[#161618] font-semibold">Scan to Pay</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Open your banking app and scan this QR code
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                    {paymentData.qrCodeBase64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                        alt="Payment QR code"
                        width={200}
                        height={200}
                        className="rounded-xl"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 text-sm text-center">
                        QR code unavailable
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Amount: <span className="font-semibold text-[#161618]">{formatPrice(grandTotal, "NGN")}</span>
                  </p>

                  <div className="w-full border-t border-gray-100 pt-4">
                    <CustomButton
                      className="w-full h-[52px] font-semibold"
                      backgroundColor="#F4F4F6"
                      onClick={handleMadeTransfer}
                      loading={hasMadeTransfer}
                    >
                      <span className="flex items-center justify-center gap-2 text-[#161618]">
                        I have made payment <FiArrowRight />
                      </span>
                    </CustomButton>
                  </div>
                </div>
              )}

              {/* Bank Transfer tab */}
              {activeTab === "bank" && (
                <div className="flex flex-col gap-4 py-2">
                  <div className="text-center">
                    <p className="text-[#161618] font-semibold">Bank Transfer</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Transfer exactly{" "}
                      <span className="font-semibold text-[#161618]">{formatPrice(grandTotal, "NGN")}</span>{" "}
                      to any account below
                    </p>
                  </div>

                  {(paymentData.bankAccounts ?? []).length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">
                      No bank accounts available.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {paymentData.bankAccounts!.map((account, i) => (
                        <div
                          key={account.id}
                          className="rounded-xl p-4 border transition-all"
                          style={
                            account.isDefault
                              ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                              : { borderColor: "#E4E7EC", backgroundColor: "#FAFAFA" }
                          }
                        >
                          {account.isDefault && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                            >
                              Default
                            </span>
                          )}
                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Bank</span>
                              <span className="font-semibold text-[#161618]">{account.bankName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Account Name</span>
                              <span className="font-semibold text-[#161618]">{account.accountName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Account Number</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#161618] text-base tracking-widest">
                                  {account.accountNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copy(account.accountNumber, "Account number copied!")}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                  aria-label="Copy account number"
                                >
                                  <TbCopy className="text-lg" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <CustomButton
                    className="w-full h-[52px] font-semibold"
                    backgroundColor="#F4F4F6"
                    onClick={handleMadeTransfer}
                    loading={hasMadeTransfer}
                  >
                    <span className="flex items-center justify-center gap-2 text-[#161618]">
                      I have made the transfer <HiArrowLongLeft className="rotate-180 w-5 h-5" />
                    </span>
                  </CustomButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
