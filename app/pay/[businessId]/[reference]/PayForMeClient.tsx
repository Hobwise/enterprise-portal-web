"use client";

import { useState, useEffect } from "react";
import { CheckoutData } from "@/app/api/controllers/dashboard/qrPayment";
import { formatPrice } from "@/lib/utils";
import { CustomButton } from "@/components/customButton";
import { toast } from "sonner";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import Image from "next/image";
import PaymentSheet from "@/app/order/PaymentSheet";

interface PayForMeClientProps {
  checkoutData: CheckoutData;
  businessId: string;
  cooperateId?: string;
}

export default function PayForMeClient({ checkoutData, businessId, cooperateId }: PayForMeClientProps) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  
  // Default Hobwise purple
  const primaryColor = "#5F35D2";

  // Force sheet open initially
  useEffect(() => {
    setIsSheetOpen(true);
  }, []);

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
          <div className="grid place-content-center mb-6">
            <Image src="/assets/images/success.png" alt="success" width={100} height={100} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Thank you for paying for this order. The business has been notified.
          </p>
          <CustomButton 
            className="w-full h-12 text-white font-semibold rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onClick={() => window.location.href = `/order?businessID=${businessId}${cooperateId ? `&cooperateID=${cooperateId}` : ''}`}
          >
            Make another order
          </CustomButton>
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
              onClick={() => window.location.href = `/order?businessID=${businessId}${cooperateId ? `&cooperateID=${cooperateId}` : ''}`}
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {!isSheetOpen && (
        <div className="text-center space-y-4">
          <p className="text-gray-600 font-medium">Payment session closed.</p>
          <CustomButton 
            onClick={() => setIsSheetOpen(true)}
            style={{ backgroundColor: primaryColor }}
            className="text-white px-6 py-2 rounded-xl shadow-md"
          >
            Review & Pay Order
          </CustomButton>
        </div>
      )}

      <PaymentSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        businessId={businessId}
        orderId={checkoutData.orderId || ""}
        orderReference={checkoutData.reference}
        grandTotal={checkoutData.grandTotal}
        businessName={checkoutData.businessName}
        cartItems={checkoutData.items}
        hideShareOption={true}
        onPaymentSuccess={() => {
          setPaymentSuccess(true);
          setIsSheetOpen(false);
        }}
      />
    </div>
  );
}
