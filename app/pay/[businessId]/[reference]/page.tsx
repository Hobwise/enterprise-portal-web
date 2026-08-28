import { getCustomerCheckout, getCustomerOrderByReference } from "@/app/api/controllers/customerOrder";
import PayForMeClient from "./PayForMeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pay for Me | Hobwise",
  description: "Help someone pay for their order",
};

export default async function PayForMePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string; reference: string }>;
  searchParams: Promise<{ cooperateId?: string }>;
}) {
  const { businessId, reference } = await params;
  const { cooperateId } = await searchParams;

  let checkoutData;
  let rawResponse;
  try {
    rawResponse = await getCustomerOrderByReference(reference, businessId, cooperateId);
    const order = rawResponse?.data ?? rawResponse;
    if (order?.orderDetails) {
      checkoutData = await getCustomerCheckout(reference, businessId, cooperateId);
    }
  } catch (err: any) {
    rawResponse = { error: err.message };
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-4">
            We couldn't find the order you're looking for. The link might be invalid or the order may have expired.
          </p>
          <div className="text-left bg-gray-100 text-gray-800 p-4 rounded-xl text-xs overflow-auto space-y-2">
            <p><strong className="text-gray-900">Business ID:</strong> <span className="break-all">{businessId}</span></p>
            <p><strong className="text-gray-900">Reference:</strong> <span className="break-all">{reference}</span></p>
            <p><strong className="text-gray-900">Raw Response:</strong> <span className="break-all">{JSON.stringify(rawResponse, null, 2)}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return <PayForMeClient checkoutData={checkoutData} businessId={businessId} cooperateId={cooperateId} />;
}
