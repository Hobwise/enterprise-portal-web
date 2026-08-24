"use client";

import { useState } from "react";
import { CheckoutData } from "@/app/api/controllers/dashboard/qrPayment";
import { formatPrice } from "@/lib/utils";
import { CustomButton } from "@/components/customButton";
import { initializeCustomerPayment } from "@/app/api/controllers/customerOrder";
import { toast } from "sonner";
import { FiArrowRight, FiLock, FiCheckCircle } from "react-icons/fi";
import Image from "next/image";

interface PayForMeClientProps {
  checkoutData: CheckoutData;
  businessId: string;
}

export default function PayForMeClient({ checkoutData, businessId }: PayForMeClientProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Default Hobwise purple
  const primaryColor = "#5F35D2";

  const handleProceedToPayment = async () => {
    if (!checkoutData.orderId) {
      toast.error("Invalid order ID. Cannot proceed to payment.");
      return;
    }

    setIsInitializing(true);
    try {
      const amountKobo = Math.round(checkoutData.grandTotal * 100);
      const res = await initializeCustomerPayment(businessId, {
        orderId: checkoutData.orderId,
        customerEmail: "", // Paystack inline will ask if needed, or we can use a dummy
        amountKobo,
      });

      if (res?.isSuccessful && res?.data?.accessCode) {
        // Load Paystack inline script
        const PaystackPop = (await import("paystack-inline-ts")).default;
        const popup = new PaystackPop();
        
        popup.resumeTransaction({
          accessCode: res.data.accessCode,
          onSuccess: () => {
            toast.success("Payment successful!");
            setPaymentSuccess(true);
            setIsInitializing(false);
          },
          onCancel: () => {
            toast.error("Payment cancelled.");
            setIsInitializing(false);
          },
        });
      } else {
        toast.error(res?.error || "Failed to initialize payment. Please try again.");
        setIsInitializing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize payment. Please try again.");
      setIsInitializing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for paying for this order. The business has been notified.
          </p>
        </div>
      </div>
    );
  }

  if (checkoutData.status !== 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full text-center">
          {/* Logo outside the modal at the top */}
          <div className="mb-8">
            {checkoutData.businessLogo ? (
               <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border border-gray-100 shadow-sm relative bg-white">
                  <Image src={checkoutData.businessLogo.length > 30 && !checkoutData.businessLogo.startsWith('http') ? `data:image/jpeg;base64,${checkoutData.businessLogo}` : checkoutData.businessLogo} alt={checkoutData.businessName} fill className="object-cover" />
               </div>
            ) : (
               <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border border-gray-100 shadow-sm relative bg-white flex items-center justify-center">
                  <Image src="/assets/icons/hobwise-logo.png" alt={checkoutData.businessName || "Hobwise"} fill className="object-contain p-4" />
               </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 px-8 py-10">
            {/* Circular Icon */}
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment link expired</h2>
            <p className="text-gray-500 mb-8 text-sm">
              The link you're trying to use to pay for an order has expired, was cancelled, or the order has already been paid for.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-center border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order Ref</p>
              <p className="font-semibold text-gray-900 tracking-wider break-all">{checkoutData.reference}</p>
            </div>

            <CustomButton
              className="w-full h-14 text-lg font-bold text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#5F35D2]/20 hover:shadow-[#5F35D2]/40"
              style={{ backgroundColor: primaryColor }}
              onClick={() => window.location.href = `/create-order?businessID=${businessId}`}
            >
              Make an order
            </CustomButton>
          </div>
          
          {/* Subtle Footer */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 opacity-50">
             <Image src="/assets/icons/hobwise-logo.png" alt="Hobwise Logo" width={20} height={20} className="object-contain grayscale" />
             <span className="text-sm font-medium text-gray-500">Powered by Hobwise</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="pt-10 pb-6 text-center px-6">
            {checkoutData.businessLogo ? (
               <div className="w-20 h-20 rounded-2xl mx-auto mb-5 overflow-hidden border border-gray-100 shadow-sm relative bg-white">
                  <Image src={checkoutData.businessLogo.length > 30 && !checkoutData.businessLogo.startsWith('http') ? `data:image/jpeg;base64,${checkoutData.businessLogo}` : checkoutData.businessLogo} alt={checkoutData.businessName} fill className="object-cover" />
               </div>
            ) : (
               <div className="w-20 h-20 rounded-2xl mx-auto mb-5 overflow-hidden border border-gray-100 shadow-sm relative bg-white flex items-center justify-center">
                  <Image src="/assets/icons/hobwise-logo.png" alt={checkoutData.businessName || "Hobwise"} fill className="object-contain p-4" />
               </div>
            )}
            <p className="text-xs font-bold text-[#5F35D2] uppercase tracking-widest mb-2">Payment Request</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{checkoutData.businessName}</h2>
            <p className="text-gray-500 text-sm">Order Ref: {checkoutData.reference}</p>
          </div>

          {/* Order Details */}
          <div className="px-8 pb-8">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Order Summary</h3>
            
            <div className="space-y-5 mb-8">
              {checkoutData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gray-100 shrink-0 border border-gray-100 shadow-sm">
                         <Image src={item.image.length > 30 && !item.image.startsWith('http') ? `data:image/jpeg;base64,${item.image}` : item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-400 text-sm font-medium">
                         {item.quantity}x
                      </div>
                    )}
                    <div className="flex flex-col">
                       <span className="font-semibold text-gray-900 text-base">{item.name}</span>
                       {item.image && <span className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</span>}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(item.price, "NGN")}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
              <div className="flex justify-between text-gray-500 text-sm font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900">{formatPrice(checkoutData.total, "NGN")}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm font-medium">
                <span>Tax (VAT)</span>
                <span className="text-gray-900">{formatPrice(checkoutData.tax, "NGN")}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                <span className="text-lg font-bold text-gray-900">Total Due</span>
                <span className="text-2xl font-black text-[#5F35D2]">{formatPrice(checkoutData.grandTotal, "NGN")}</span>
              </div>
            </div>

            <CustomButton
              className="w-full h-14 text-lg font-bold text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#5F35D2]/20 hover:shadow-[#5F35D2]/40"
              style={{ backgroundColor: primaryColor }}
              onClick={handleProceedToPayment}
              loading={isInitializing}
            >
              <span className="flex items-center justify-center gap-2">
                Pay {formatPrice(checkoutData.grandTotal, "NGN")} <FiArrowRight className="w-5 h-5" />
              </span>
            </CustomButton>

            <div className="flex items-center justify-center gap-2 mt-6 text-sm font-medium text-gray-400">
              <FiLock className="w-4 h-4" />
              <span>Secured by Paystack</span>
            </div>
          </div>
        </div>
        
        {/* Subtle Footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 opacity-50">
           <Image src="/assets/images/hobink-logo.png" alt="Hobwise Logo" width={20} height={20} className="object-contain grayscale" />
           <span className="text-sm font-medium text-gray-500">Powered by Hobwise</span>
        </div>
      </div>
    </div>
  );
}
