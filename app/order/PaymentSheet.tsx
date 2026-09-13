"use client";
import { useState, useEffect } from "react";
import { initializeCustomerPayment, verifyCustomerPayment } from "@/app/api/controllers/customerOrder";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { TbCopy } from "react-icons/tb";
import { FiArrowRight, FiX, FiShare2 } from "react-icons/fi";
import { HiArrowLongLeft } from "react-icons/hi2";
import { CustomButton } from "@/components/customButton";
import { IoArrowBack } from "react-icons/io5";

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
  orderReference?: string;
  cooperateId?: string;
  grandTotal: number;
  userId?: string;
  menuConfig?: {
    backgroundColour?: string;
    textColour?: string;
  };
  onPaymentSuccess?: () => void;
  /** Cart items to display in order review step */
  cartItems?: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  businessName?: string;
  hideShareOption?: boolean;
}

type PaymentMethod = "online" | "share" | "bank";
type Step = "review" | "payment";

export default function PaymentSheet({
  isOpen,
  onClose,
  businessId,
  orderId,
  orderReference,
  cooperateId,
  grandTotal,
  userId,
  menuConfig,
  onPaymentSuccess,
  cartItems = [],
  businessName,
  hideShareOption = false,
}: PaymentSheetProps) {
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryStyle = { backgroundColor: primaryColor };
  const primaryTextStyle = { color: primaryColor };
  const primaryBorderStyle = { borderColor: primaryColor };

  const [step, setStep] = useState<Step>("review");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("online");
  const [hasMadeTransfer, setHasMadeTransfer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setStep("review");
      setSelectedMethod("online");
      setHasMadeTransfer(false);
      setPaymentData(null);
    }
  }, [isOpen]);

  // Initialise payment when moving to payment step
  const initPayment = async () => {
    if (paymentData) return; // already initialized
    setLoading(true);
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

  // Poll for payment status (using public endpoint - no auth redirect)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && step === "payment" && paymentData?.hobwiseReference) {
      interval = setInterval(async () => {
        try {
          const res = await verifyCustomerPayment(businessId, paymentData.hobwiseReference!);
          if (res?.data?.data?.status === "Success" || res?.data?.status === "Success") {
            clearInterval(interval);
            toast.success("Payment verified successfully!");
            onPaymentSuccess?.();
            onClose();
          }
        } catch {
          // Silent catch for polling
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, step, paymentData?.hobwiseReference, businessId, onPaymentSuccess, onClose]);

  const handleProceedToPayment = async () => {
    setStep("payment");
    await initPayment();
  };

  const handlePayOnline = async () => {
    if (!paymentData?.accessCode) return;
    setIsProcessing(true);
    try {
      const PaystackPop = (await import("paystack-inline-ts")).default;
      const popup = new PaystackPop();
      popup.resumeTransaction({
        accessCode: paymentData.accessCode,
        onSuccess: () => {
          toast.success("Payment successful!");
          onPaymentSuccess?.();
          onClose();
          setIsProcessing(false);
        },
        onCancel: () => {
          toast.error("Payment cancelled.");
          setIsProcessing(false);
        },
      });
    } catch {
      toast.error("Failed to load payment gateway.");
      setIsProcessing(false);
    }
  };

  const copy = async (value: string, label = "Copied!") => {
    await navigator.clipboard.writeText(value);
    toast.success(label);
  };

  const buildShareUrl = () => {
    const referenceToShare = orderReference || paymentData?.hobwiseReference;
    let url = paymentData?.authorizationUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (referenceToShare && typeof window !== "undefined") {
      url = `${window.location.origin}/pay/${businessId}/${referenceToShare}`;
      if (cooperateId) url += `?cooperateId=${cooperateId}`;
    }
    return url;
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const url = buildShareUrl();
      const shareData = {
        title: "Pay for my order",
        text: `Please help me pay for my order of ${formatPrice(grandTotal, "NGN")}.`,
        url,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          toast.success("Shared successfully!");
        } catch {
          // User cancelled share
        }
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Payment link copied to clipboard!");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleMadeTransfer = () => {
    setHasMadeTransfer(true);
    toast.message("Transfer noted — we'll confirm your payment shortly.");
    setTimeout(() => {
      onPaymentSuccess?.();
      onClose();
    }, 2000);
  };

  const handlePlaceOrder = async () => {
    if (selectedMethod === "online") {
      await handlePayOnline();
    } else if (selectedMethod === "share") {
      await handleShare();
    } else if (selectedMethod === "bank") {
      handleMadeTransfer();
    }
  };

  if (!isOpen) return null;

  const baseString = "data:image/jpeg;base64,";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Step Indicator Header ── */}
        <div className="px-5 pt-5 pb-0 shrink-0">
          {/* Back / Close row */}
          <div className="flex items-center justify-between mb-4">
            {step === "payment" ? (
              <button
                type="button"
                onClick={() => setStep("review")}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <IoArrowBack className="w-4 h-4" />
                Back
              </button>
            ) : (
              <h3 className="text-base font-bold text-[#161618]">Review</h3>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FiX className="text-gray-600 text-sm" />
            </button>
          </div>

          {/* Two-step progress bar */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900 mb-1.5">Your Order</p>
              <div className="h-1 rounded-full" style={primaryStyle} />
            </div>
            <div className="flex-1">
              <p className={`text-xs font-semibold mb-1.5 ${step === "payment" ? "text-gray-900" : "text-gray-400"}`}>
                Payment
              </p>
              <div
                className={`h-1 rounded-full transition-all duration-300 ${step === "payment" ? "" : "bg-gray-200"}`}
                style={step === "payment" ? primaryStyle : {}}
              />
            </div>
          </div>
        </div>

        {/* ── STEP 1: Order Review ── */}
        {step === "review" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {/* Business name section */}
              {businessName && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">{businessName}</p>
                    <p className="text-xs text-gray-500">{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</p>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h4>

              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No items in order.</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {/* Item image */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {item.image && item.image.length > baseString.length ? (
                          <img
                            src={`${baseString}${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                            style={primaryStyle}
                          >
                            {item.quantity}x
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm shrink-0">{formatPrice(item.price, "NGN")}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(grandTotal, "NGN")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span style={primaryTextStyle}>{formatPrice(grandTotal, "NGN")}</span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-gray-400 mt-5">
                By proceeding, you agree to our{" "}
                <a href="/privacy-policy/terms-of-use" target="_blank" className="underline" style={primaryTextStyle}>Terms of Use</a>{" "}
                and{" "}
                <a href="/privacy-policy" target="_blank" className="underline" style={primaryTextStyle}>Privacy Policy</a>
              </p>
            </div>

            {/* Make Payment CTA */}
            <div className="px-5 pt-3 pb-6 border-t border-gray-100 shrink-0">
              <CustomButton
                className="w-full h-[56px] font-bold text-white text-base rounded-2xl"
                style={primaryStyle}
                onClick={handleProceedToPayment}
              >
                <span className="flex items-center justify-center gap-2">
                  Make Payment
                  <span className="ml-auto font-bold">{formatPrice(grandTotal, "NGN")}</span>
                </span>
              </CustomButton>
            </div>
          </>
        )}

        {/* ── STEP 2: Payment Method ── */}
        {step === "payment" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold text-gray-900">Payment Method</h4>
              </div>

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
                  <p className="text-gray-500 text-sm">Could not load payment options. Please try again.</p>
                  <button
                    type="button"
                    onClick={initPayment}
                    className="text-sm font-semibold underline"
                    style={primaryTextStyle}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && paymentData && (
                <div className="space-y-3">
                  {/* Pay Online */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedMethod === "online" ? "" : "border-gray-100 bg-gray-50"
                    }`}
                    style={selectedMethod === "online" ? { ...primaryBorderStyle, backgroundColor: `${primaryColor}08` } : {}}
                    onClick={() => setSelectedMethod("online")}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Pay Online</p>
                      <p className="text-xs text-gray-500 mt-0.5">Card, USSD or Bank Transfer via Paystack</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all`}
                      style={selectedMethod === "online" ? { borderColor: primaryColor } : { borderColor: "#D1D5DB" }}
                    >
                      {selectedMethod === "online" && (
                        <div className="w-2.5 h-2.5 rounded-full" style={primaryStyle} />
                      )}
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedMethod === "bank" ? "" : "border-gray-100 bg-gray-50"
                    }`}
                    style={selectedMethod === "bank" ? { ...primaryBorderStyle, backgroundColor: `${primaryColor}08` } : {}}
                    onClick={() => setSelectedMethod("bank")}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" 
                          stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Bank Transfer</p>
                      <p className="text-xs text-gray-500 mt-0.5">Transfer to our bank account</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={selectedMethod === "bank" ? { borderColor: primaryColor } : { borderColor: "#D1D5DB" }}
                    >
                      {selectedMethod === "bank" && (
                        <div className="w-2.5 h-2.5 rounded-full" style={primaryStyle} />
                      )}
                    </div>
                  </label>

                  {/* Share Link / Pay for Me */}
                  {!hideShareOption && (
                    <label
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedMethod === "share" ? "" : "border-gray-100 bg-gray-50"
                      }`}
                      style={selectedMethod === "share" ? { ...primaryBorderStyle, backgroundColor: `${primaryColor}08` } : {}}
                      onClick={() => setSelectedMethod("share")}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 shrink-0">
                        <FiShare2 className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Pay for me</p>
                        <p className="text-xs text-gray-500 mt-0.5">Share a link for someone else to pay</p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={selectedMethod === "share" ? { borderColor: primaryColor } : { borderColor: "#D1D5DB" }}
                      >
                        {selectedMethod === "share" && (
                          <div className="w-2.5 h-2.5 rounded-full" style={primaryStyle} />
                        )}
                      </div>
                    </label>
                  )}

                  {/* Expanded Bank Transfer Details */}
                  {selectedMethod === "bank" && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3 mt-1">
                      <p className="text-xs text-gray-500 text-center">
                        Transfer exactly{" "}
                        <span className="font-bold text-gray-900">{formatPrice(grandTotal, "NGN")}</span>{" "}
                        to any account below
                      </p>
                      {(paymentData.bankAccounts ?? []).length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-2">No bank accounts available.</p>
                      ) : (
                        <div className="space-y-3">
                          {[...paymentData.bankAccounts!]
                            .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                            .map((account) => (
                              <div
                                key={account.id}
                                className="rounded-xl p-3.5 border bg-white"
                                style={{ borderColor: account.isDefault ? primaryColor : "#E4E7EC" }}
                              >
                                {account.isDefault && (
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                                    style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                                  >
                                    Preferred
                                  </span>
                                )}
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Bank</span>
                                    <span className="font-semibold text-gray-900">{account.bankName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-semibold text-gray-900">{account.accountName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Account</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-gray-900 tracking-widest">
                                        {account.accountNumber}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => copy(account.accountNumber, "Account number copied!")}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    </div>
                  )}

                  {/* Expanded Share Link Details */}
                  {selectedMethod === "share" && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 mt-1">
                      <p className="text-xs text-gray-500 mb-3">Share this link with someone to pay on your behalf:</p>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200">
                        <p className="flex-1 text-xs text-gray-700 truncate">{buildShareUrl()}</p>
                        <button
                          type="button"
                          onClick={() => copy(buildShareUrl(), "Link copied!")}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                        >
                          <TbCopy className="text-lg" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            {!loading && paymentData && (
              <div className="px-5 pt-3 pb-6 border-t border-gray-100 shrink-0">
                <CustomButton
                  className="w-full h-[56px] font-bold text-white text-base rounded-2xl"
                  style={primaryStyle}
                  onClick={handlePlaceOrder}
                  loading={isProcessing || isSharing || hasMadeTransfer}
                  disabled={selectedMethod === "bank" && (paymentData.bankAccounts ?? []).length === 0}
                >
                  <span className="flex items-center justify-center gap-2">
                    {selectedMethod === "bank" ? "I've Made the Transfer" : selectedMethod === "share" ? "Share Payment Link" : `Pay ${formatPrice(grandTotal, "NGN")}`}
                    {selectedMethod === "online" && <FiArrowRight className="w-4 h-4" />}
                  </span>
                </CustomButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
