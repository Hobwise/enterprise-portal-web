"use client";

import { CustomButton } from "@/components/customButton";
import {
  CheckoutData,
  confirmPayment,
  getCheckout,
} from "@/app/api/controllers/dashboard/qrPayment";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { FiArrowRight, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { TbCopy } from "react-icons/tb";

interface CheckoutDetailsProps {
  reference: string;
}

// TODO: replace with real data once the checkout-by-reference endpoint (or the
// `initialize` response shape) is available. Rendered so the page is reviewable.
const placeholderCheckout = (reference: string): CheckoutData => ({
  businessName: "Cubana Restaurant & Grills",
  reference,
  items: [
    { name: "Chicken Biryani", quantity: 5, price: 100000 },
    { name: "Four cousins", quantity: 2, price: 50000 },
    { name: "Fresh pineapple juice", quantity: 2, price: 20000 },
    { name: "Omelca Tequila", quantity: 2, price: 200000 },
    { name: "Asun", quantity: 4, price: 40000 },
    { name: "Cannibal Platter", quantity: 1, price: 50000 },
    { name: "Seafood Boil", quantity: 1, price: 50000 },
    { name: "Nestle water", quantity: 6, price: 9000 },
    { name: "Steamed fried rice", quantity: 10, price: 250000 },
  ],
  total: 769000,
  tax: 57675,
  grandTotal: 831675,
  bankAccounts: [
    {
      bankName: "PayStack Titan",
      accountNumber: "0123456789",
      accountName: "Cubana Restaurant & Grills",
    },
    {
      bankName: "Opay",
      accountNumber: "0123456789",
      accountName: "Cubana Restaurant & Grills",
    },
    {
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: "Cubana Restaurant & Grills",
    },
  ],
  // Sample QR from an `initialize` response — placeholder until the checkout
  // endpoint supplies the real qrCodeBase64.
  qrCodeBase64:
    "iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaAQAAAAAefbjOAAACGklEQVR4nO2ayY3DMAxFCaQAlaTWXZILMMCRuElxnBnMlfw62I78H3MhuMnE/18HAQIECBAgQIAAOUS2XuP5fDF1fXuNrXYNyemCDqgIpKqhHzsCDX2feBjadIAqQNNRTCVP4jLDgw6iDQdUEWoX7V7VLkC1obltviQvWFINoHKQ+426kSaY0Pc/8hOgfJAtE3xeXACoCLSWdyS79CYBVABygTQjRNKleN1BtL8FVAaKZBKFhkaSacMM3QILoMyQhJPDHUX11G7WPMQAyg/Zj6hEj8bqS8z8tWUFlBjySGJDTStC2WxY09LCOKAKEMUwa6YVr0n3p5AAqgC1qEmbHYqtcGL6h/wEKCtkWcan3ta3qsCgVZoAKgBJXLEsE9Dh5ehKNZ/RCFBOyPXuS1ucoa8tK6DE0BKofks1UoT6bEv/AFARiPU8zHtUF3jf+jwdBZQUktWjD7FwEuOMuHRARSD9dkJ2VmBxa4pHaQKoBBSpprvg1pbsdgEVgNZFx1r8Vp2SlaOACkH2aa5ONidkM072RBTBBlABaC3bblGQbP71eKYGKCVkjvKeVo6tW33x07wcUF6oy+1cpx9xfsqrMP3ocwElhsJbdHl7Sna2LnuPNSyg7FD32dbWmywbHVA5aC4pTNWDrIOdWeb8PbAAygXJTSebF63eZH1mYzigIhBtfhN9q7sR0c0QoPTQ/xYgQIAAAQIECNCEfgBWu4+Wq1uOaQAAAABJRU5ErkJggg==",
  qrValue:
    typeof window !== "undefined" ? window.location.href : `checkout/${reference}`,
});

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

export default function CheckoutDetails({ reference }: CheckoutDetailsProps) {
  const [data, setData] = useState<CheckoutData | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const load = async () => {
      // TODO: getCheckout returns null until the endpoint exists; fall back to
      // placeholder data so the layout renders.
      const checkout = await getCheckout(reference);
      setData(checkout ?? placeholderCheckout(reference));
    };
    load();
  }, [reference]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleMadePayment = async () => {
    setConfirming(true);
    try {
      // TODO: wire to the real confirm-payment endpoint. Currently a no-op stub.
      const ok = await confirmPayment(reference);
      if (ok) {
        toast.success("Payment confirmation received");
      } else {
        toast.message("We'll confirm your payment shortly.");
      }
    } finally {
      setConfirming(false);
    }
  };

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
        <CustomButton
          className="h-[52px] w-full border border-[#E4E7EC] font-semibold text-[#161618]"
          backgroundColor="bg-[#F4F4F6]"
          loading={confirming}
          onClick={handleMadePayment}
        >
          <span className="flex items-center justify-center gap-2">
            I have made payment <FiArrowRight />
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
