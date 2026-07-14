"use client";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
import {
  formatPrice,
  getJsonItemFromLocalStorage,
  printPDF,
  saveAsPDF,
  validateEmail,
} from "@/lib/utils";
import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import useOrderDetails from "@/hooks/cachedEndpoints/useOrderDetails";
import { initializePayment } from "@/app/api/controllers/dashboard/qrPayment";

const InvoiceModal = ({
  isOpenInvoice,
  singleOrder,
  toggleInvoiceModal,
}: any) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");
  const invoiceRef = useRef(null);
  const businessId = businessInformation?.[0]?.businessId;
  const [email, setEmail] = useState("");
  const [qrBase64, setQrBase64] = useState("");
  const [initializing, setInitializing] = useState(false);

  // Use cached order details hook
  const {
    orderDetails: order,
    isLoading,
    isSuccessful,
    error
  } = useOrderDetails(singleOrder?.id, {
    enabled: !!singleOrder?.id && isOpenInvoice
  });

  // Initialize a QR payment for the order so the receipt can show a scannable
  // "scan to pay" code. Falls back to the logged-in user's email when no customer
  // email is supplied (orders don't carry one).
  const generateQr = async (customerEmail: string) => {
    if (!singleOrder?.id || !order) return;
    setInitializing(true);
    try {
      const base = singleOrder?.amountRemaining ?? order?.totalAmount ?? 0; // naira
      const amountKobo = Math.round(base * 100);
      const response = await initializePayment(businessId, {
        orderId: singleOrder.id,
        customerEmail,
        amountKobo,
      });
      const qr = response?.data?.data?.qrCodeBase64;
      if (qr) setQrBase64(qr);
    } finally {
      setInitializing(false);
    }
  };

  // Generate the payment QR once the order details load; reset it on close.
  useEffect(() => {
    if (!isOpenInvoice) {
      setQrBase64("");
      return;
    }
    if (isSuccessful && order) {
      generateQr(email || userInformation?.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenInvoice, isSuccessful]);

  // Group items by itemName + unit + isPacked status
  const groupItems = (orderDetails: any[]) => {
    if (!orderDetails) return [];

    const grouped = orderDetails.reduce((acc: any, item: any) => {
      const key = `${item.itemName}-${item.unit || 'default'}-${item.isPacked ? 'packed' : 'unpacked'}`;

      if (!acc[key]) {
        acc[key] = {
          itemName: item.itemName,
          unit: item.unit,
          unitPrice: item.unitPrice,
          quantity: 0,
          totalPrice: 0,
          isPacked: item.isPacked,
          packingCost: item.packingCost,
          totalPackingCost: 0
        };
      }

      acc[key].quantity += item.quantity;
      acc[key].totalPrice += item.totalPrice;
      if (item.isPacked && item.packingCost) {
        acc[key].totalPackingCost += item.packingCost * item.quantity;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  };

  const groupedItems = order?.orderDetails ? groupItems(order.orderDetails) : [];
  const totalItems = groupedItems.length;

  return (
    <Modal
    
      isDismissable={false}
      isOpen={isOpenInvoice}
      onOpenChange={toggleInvoiceModal}
    >
      <ModalContent>
        {() => (
          <>

            <ModalBody className="max-h-[65vh] overflow-y-auto">
               <div ref={invoiceRef} className="h-auto flex flex-col">
                  {/* Header Section */}
                  <h3 className="font-[600] text-center text-lg text-black mt-6">
                    {businessInformation[0]?.businessName}
                  </h3>
                  <p className="text-center text-sm text-grey500 mb-4">
                    {businessInformation[0]?.businessAddress}
                    {businessInformation[0]?.city && businessInformation[0]?.state &&
                      `, ${businessInformation[0]?.city}, ${businessInformation[0]?.state}`
                    }
                  </p>

                  {/* Order Metadata - 2 Column Layout */}
                  <div className="text-sm mb-2">
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-black">Customer</span>
                      <span className="text-black">{singleOrder.placedByName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-black"> {singleOrder.qrReference || 'N/A'}</span>
                      <span className="text-black">{totalItems} items</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-black">Order Ref</span>
                      <span className="text-black">{singleOrder.reference}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-black">Date & Time</span>
                      <span className="text-black">
                        {moment(singleOrder.dateCreated).format("MMM. D, YYYY, h:mma")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-black">Printed Date</span>
                      <span className="text-black">
                        {moment().format("MMM. D, YYYY, h:mma")}
                      </span>
                    </div>
                  </div>

                  <Divider className="my-2"/>

                  <div className="flex justify-between text-sm py-1">
                    <span className="font-semibold text-black">Served By</span>
                    <span className="text-black">
                      {userInformation.firstName} {userInformation.lastName}
                    </span>
                  </div>

                  <Divider className="my-2"/>
              {isLoading ? (
                <div className={`flex flex-col items-center my-5`}>
                  <Spinner size="sm" />
                  <p className="text-center mt-1 text-[13px] text-grey400">
                    Fetching order details...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center my-5 p-4 bg-red-50 rounded-lg">
                  <p className="text-center text-red-600 font-medium">
                    Failed to load order details
                  </p>
                  <p className="text-center text-sm text-red-500 mt-1">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                  </p>
                  <CustomButton
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 text-white bg-red-600 hover:bg-red-700"
                  >
                    Retry
                  </CustomButton>
                </div>
              ) : !order || !isSuccessful ? (
                <div className="flex flex-col items-center my-5 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-center text-yellow-700 font-medium">
                    Order details not available
                  </p>
                  <p className="text-center text-sm text-yellow-600 mt-1">
                    The order may have been deleted or is no longer accessible.
                  </p>
                </div>
              ) : order ? (
                <>
                  {/* Items Table Header */}
                  <div className="flex gap-3 text-sm font-semibold text-black mb-2">
                    <div className="w-12">Qty</div>
                    <div className="flex-1">Description</div>
                    <div className="w-24 text-right">Amount(₦)</div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {groupedItems.map((item: any, index: number) => {
                      return (
                        <div key={index} className="flex gap-3 border-b pb-1 text-sm text-black">
                          {/* Quantity Column */}
                          <div className="w-12 text-black">
                            {item.quantity}
                          </div>

                          {/* Description Column */}
                          <div className="flex-1">
                            <div className="text-black font-medium">
                              {item.itemName}
                            
                            </div>
                            {item.isPacked && item.totalPackingCost > 0 && (
                              <div className="text-xs text-grey500 mt-0.5">
                                Packing {formatPrice(item.totalPackingCost, 'NGN')}
                              </div>
                            )}
                          </div>
                             <div className="text-black font-medium">
                              <span className="text-grey500 ml-1">
                                ({formatPrice(item.unitPrice, 'NGN')})
                              </span>
                            </div>

                          {/* Amount Column */}
                          <div className="w-24 text-right font-semibold text-black">
                            {formatPrice(item.totalPrice, 'NGN')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  

                  {/* Totals Section */}
                  <div className="text-sm ">
                    {/* Additional Cost */}
                    {order.additionalCostName !== "" && order.additionalCost && (
                      <div className="flex justify-between gap-3 text-black">
                        <span className="font-medium t">
                            Additional cost
                          <span className="text-grey-600 text-xs">
                            ({order.additionalCostName ? order.additionalCostName.toLowerCase() : ''})
                          </span>
                        </span>
                        <span className="font-semibold text-gray-600">{formatPrice(order.additionalCost, 'NGN')}</span>
                        <Divider className=""/>
                      </div>
                    )}
                    {/* Total (before VAT) */}
                    <div className="flex justify-between gap-3 text-gray-600 font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(order.subTotalAmount, 'NGN')}</span>
                    </div>

                    {/* VAT */}
                    {order.isVatApplied && (
                      <div className="flex justify-between gap-3 text-gray-600">
                        <span className="font-medium">
                          VAT at {order.vatPercentage || '7.5'}%{" "}
                          <span className="text-grey500 text-xs">
                            ({order.vatPercentage || '7.5'}% x {formatPrice(order.subTotalAmount, 'NGN')})
                          </span>
                        </span>
                        <span className="font-semibold">{formatPrice(order.vatAmount, 'NGN')}</span>
                      </div>
                    )}
                  <Divider className=""/>
                    {/* Grand Total */}
                    <div className="flex justify-center mt-3 mb-2">
                      <div className="text-center">
                        <p className="text-grey500 text-xs mb-1">Grand Total</p>
                        <p className="text-xl font-bold text-gray-600">
                          {formatPrice(order.totalAmount, 'NGN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-3"/>

                  {/* Payment QR — scannable "scan to pay" section */}
                  {(qrBase64 || initializing) && (
                    <div className="flex flex-col items-center gap-2 py-4">
                      {qrBase64 ? (
                        <>
                          <p className="text-sm font-semibold text-black">
                            Scan to Pay
                          </p>
                          <div className="rounded-xl border border-[#ECECEC] bg-white p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`data:image/png;base64,${qrBase64}`}
                              alt="Scan to pay"
                              width={150}
                              height={150}
                            />
                          </div>
                          <p className="max-w-[230px] text-center text-xs text-grey500">
                            Scan with your bank or Paystack app to pay{" "}
                            {formatPrice(order.totalAmount, 'NGN')}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-grey400">
                          <Spinner size="sm" />
                          <span className="text-xs">Generating payment code…</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className={`flex flex-col items-center my-5`}>
                  <p className="text-center text-[13px] text-grey400">
                    {error ? "Failed to load order details" : "No order data available"}
                  </p>
                </div>
              )}
               </div>
            </ModalBody>
            <Spacer y={1} />
            {!isLoading && order && (
              <>
                <div className="px-6">
                  <CustomInput
                    type="email"
                    name="customerEmail"
                    label="Customer email (optional)"
                    placeholder="customer@email.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    onBlur={() => {
                      // Regenerate the QR against the customer's email if valid.
                      if (validateEmail(email)) generateQr(email);
                    }}
                  />
                </div>
                <ModalFooter className="w-full flex  gap-5">
                  <CustomButton
                    className="bg-white text-black border border-primaryGrey flex-grow"
                    onClick={() => saveAsPDF(invoiceRef)}
                    type="submit"
                  >
                    Save
                  </CustomButton>
                  <CustomButton
                    onClick={() => printPDF(invoiceRef)}
                    className="flex-grow text-white"
                    type="submit"
                  >
                    Print
                  </CustomButton>
                </ModalFooter>
              </>
            )}
            <Spacer y={2} />
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;