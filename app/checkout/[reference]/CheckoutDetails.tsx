"use client";

import { CustomButton } from "@/components/customButton";
// Type-only on purpose: this page is public, so it must not pull in the
// authenticated apiService, whose 401 handler redirects to the staff login.
import type { CheckoutData } from "@/app/api/controllers/dashboard/qrPayment";
import { getCustomerCheckout, initializeCustomerPayment } from "@/app/api/controllers/customerOrder";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { FiArrowRight, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { TbCopy } from "react-icons/tb";
import PaystackPop from "paystack-inline-ts";

interface CheckoutDetailsProps {
  reference: string;
  businessId: string;
  cooperateId?: string;
  userId?: string;
}

const AmountRow = ({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span
      className={`text-[#45464E] ${emphasized ? "font-bold text-[#161618]" : ""}`}
    >
      {label}
    </span>
    <span
      className={`text-[#45464E] ${emphasized ? "font-bold text-[#161618]" : ""}`}
    >
      {formatPrice(value, "NGN")}
    </span>
  </div>
);

export default function CheckoutDetails({
  reference,
  businessId,
  cooperateId,
  userId,
}: CheckoutDetailsProps) {
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadFailed(false);
      try {
        const checkout = await getCustomerCheckout(
          reference,
          businessId,
          cooperateId
        );
        if (checkout) {
          let updatedCheckout = { ...checkout };
          if (businessId && checkout.orderId) {
            try {
              const amountKobo = Math.round(checkout.grandTotal * 100);
              const paymentRes = await initializeCustomerPayment(
                businessId,
                {
                  orderId: checkout.orderId,
                  customerEmail: "",
                  amountKobo,
                },
                userId
              );
              
              if (paymentRes?.data) {
                updatedCheckout.qrCodeBase64 = paymentRes.data.qrCodeBase64;
                updatedCheckout.accessCode = paymentRes.data.accessCode;
                updatedCheckout.authorizationUrl = paymentRes.data.authorizationUrl;
                updatedCheckout.bankAccounts = paymentRes.data.bankAccounts || [];
              }
            } catch (err) {
              console.error("Failed to initialize public QR payment:", err);
            }
          }
          setData(updatedCheckout);
        } else {
          setLoadFailed(true);
        }
      } catch {
        setLoadFailed(true);
      }
    };
    load();
  }, [reference, businessId, cooperateId, userId]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handlePayOnline = () => {
    if (!data?.accessCode) return;
    
    const popup = new PaystackPop();
    popup.resumeTransaction({
      accessCode: data.accessCode,
      onSuccess: () => {
        toast.success("Payment successful!");
        setTimeout(() => window.history.back(), 2000);
      },
      onCancel: () => {
        toast.error("Payment cancelled");
      }
    });
  };

  const handleMadeTransfer = () => {
    setConfirming(true);
    toast.message("We'll confirm your transfer shortly.");
    setConfirming(false);
  };

  if (loadFailed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 text-center font-satoshi text-[#45464E]">
        We couldn&apos;t load this order. Please check the link or ask a member
        of staff for help.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 font-satoshi text-[#45464E]">
        Loading checkout…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white px-5 py-8 font-satoshi">
      <h1 className="text-center text-xl font-bold text-[#161618]">
        Checkout Details
      </h1>

      <button
        type="button"
        onClick={() => setShowItems((prev) => !prev)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-primaryColor px-4 py-3 text-primaryColor"
      >
        <span className="font-semibold">View Order Details</span>
        {showItems ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {showItems && (
        <div className="mt-4 text-sm">
          <div className="flex items-center justify-between border-b border-[#EEE] pb-2 text-xs font-semibold uppercase text-[#45464E]">
            <span className="flex-1">Item</span>
            <span className="w-12 text-center">Qty</span>
            <span className="w-24 text-right">Price</span>
          </div>
          {data.items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center justify-between py-2 text-[#45464E]"
            >
              <span className="flex-1">{item.name}</span>
              <span className="w-12 text-center">{item.quantity}</span>
              <span className="w-24 text-right">
                {formatPrice(item.price, "NGN")}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-[#EEE] pt-3 text-sm">
        <AmountRow label="Total" value={data.total} />
        <AmountRow label="Tax" value={data.tax} />
        <AmountRow label="Grand Total" value={data.grandTotal} emphasized />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="rounded-lg bg-white p-2">
          {data.qrCodeBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${data.qrCodeBase64}`}
              alt="Payment QR code"
              width={160}
              height={160}
            />
          ) : (
            <QRCode value={data.qrValue} size={160} />
          )}
        </div>
        <span className="text-sm text-[#98A2B3]">Checkout Details</span>
      </div>

      <div className="mt-8 space-y-3">
        {data.bankAccounts.map((account, index) => (
          <div
            key={`${account.bankName}-${account.accountNumber}-${index}`}
            className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm text-[#45464E] ${
              index === 0 ? "bg-[#F4F4F6]" : "border-b border-[#F0F0F0]"
            }`}
          >
            <div className="space-y-1">
              <p>
                <span className="text-[#98A2B3]">Bank:</span> {account.bankName}
              </p>
              <p>
                <span className="text-[#98A2B3]">Account Number:</span>{" "}
                {account.accountNumber}
              </p>
              <p>
                <span className="text-[#98A2B3]">Account Name:</span>{" "}
                {account.accountName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(account.accountNumber)}
              aria-label="Copy account number"
              className="shrink-0 text-[#667085] hover:text-primaryColor"
            >
              <TbCopy className="text-lg" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {data.accessCode && (
          <CustomButton
            className="h-[52px] w-full border border-primaryColor font-semibold text-white hover:bg-primaryColor/90 transition-colors"
            backgroundColor="bg-primaryColor"
            onClick={handlePayOnline}
          >
            <span className="flex items-center justify-center gap-2">
              Pay Online <FiArrowRight />
            </span>
          </CustomButton>
        )}

        <CustomButton
          className="h-[52px] w-full border border-[#E4E7EC] font-semibold text-[#161618]"
          backgroundColor="bg-[#F4F4F6]"
          loading={confirming}
          onClick={handleMadeTransfer}
        >
          <span className="flex items-center justify-center gap-2">
            I have made a transfer <FiArrowRight />
          </span>
        </CustomButton>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex w-full items-center justify-center gap-2 text-[#667085]"
        >
          Cancel <FiX />
        </button>
      </div>
    </div>
  );
}
