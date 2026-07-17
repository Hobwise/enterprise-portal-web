"use client";
import { CustomButton } from "@/components/customButton";
import {
  formatPrice,
  getJsonItemFromLocalStorage,
  printPDF,
  saveAsPDF,
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
import { HiOutlineDownload } from "react-icons/hi";
import { FiPrinter } from "react-icons/fi";

const InvoiceModal = ({
  isOpenInvoice,
  singleOrder,
  toggleInvoiceModal,
}: any) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");
  const invoiceRef = useRef(null);
  const businessId = businessInformation?.[0]?.businessId;
  const [qrBase64, setQrBase64] = useState("");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
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

  // Fetch QR code + bank accounts from /v1/QrPayment/initialize.
  // Returns true when data is ready so callers can proceed to save/print.
  const generateQr = async (): Promise<boolean> => {
    if (!singleOrder?.id || !order) return false;
    // If we already have the data, skip the API call
    if (qrBase64 || bankAccounts.length > 0) return true;

    const base = singleOrder?.amountRemaining ?? order?.totalAmount ?? 0;
    
    // If payment has already been fully made (amount remaining is 0), skip initializing QR
    if (base <= 0) return true;

    setInitializing(true);
    try {
      const amountKobo = Math.round(base * 100);
      const response = await initializePayment(businessId, userInformation?.id, {
        orderId: singleOrder.id,
        customerEmail: userInformation?.email,
        amountKobo,
      });
      // Axios wraps the JSON body in response.data
      // API envelope: { data: { qrCodeBase64, bankAccounts, ... }, isSuccessful }
      const payload = response?.data?.data;
      if (payload?.qrCodeBase64) setQrBase64(payload.qrCodeBase64);
      if (payload?.bankAccounts?.length) setBankAccounts(payload.bankAccounts);
      if (!payload) {
        console.error("[invoice] initializePayment returned no data", response?.data);
      }
      return !!(payload?.qrCodeBase64 || payload?.bankAccounts?.length);
    } catch (err) {
      console.error("[invoice] initializePayment error:", err);
      return false;
    } finally {
      setInitializing(false);
    }
  };

  // Reset payment data when modal closes
  useEffect(() => {
    if (!isOpenInvoice) {
      setQrBase64("");
      setBankAccounts([]);
    }
  }, [isOpenInvoice]);

  // Fetch QR + bank accounts, wait one tick for the DOM to render, then act
  const handleSave = async () => {
    await generateQr();
    // Give React a tick to render the payment section into the ref
    requestAnimationFrame(() => {
      setTimeout(() => saveAsPDF(invoiceRef), 100);
    });
  };

  const handlePrint = async () => {
    await generateQr();
    requestAnimationFrame(() => {
      setTimeout(() => printPDF(invoiceRef), 100);
    });
  };

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

                  {/* ─────────────── PAYMENT PAGE (print / PDF only) ─────────────────
                      Appears as page 2 when printing or saving as PDF.
                      Hidden from the on-screen modal preview via .print-only.          */}
                  {(qrBase64 || bankAccounts.length > 0) && (
                    <div
                      className="print-only"
                      style={{
                        pageBreakBefore: "always",
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #f8f7ff 0%, #ffffff 50%, #f0f4ff 100%)",
                        padding: "40px 32px",
                        fontFamily: "inherit",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Decorative background circles */}
                      <div style={{
                        position: "absolute", top: "-60px", right: "-60px",
                        width: "240px", height: "240px", borderRadius: "50%",
                        background: "rgba(95,53,210,0.06)", pointerEvents: "none",
                      }} />
                      <div style={{
                        position: "absolute", bottom: "-80px", left: "-80px",
                        width: "320px", height: "320px", borderRadius: "50%",
                        background: "rgba(95,53,210,0.04)", pointerEvents: "none",
                      }} />

                      {/* Business name at top */}
                      <p style={{
                        fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "#9ca3af", marginBottom: "4px",
                      }}>
                        {businessInformation[0]?.businessName}
                      </p>

                      {/* Heading */}
                      <h2 style={{
                        fontSize: "22px", fontWeight: 800, color: "#111827",
                        marginBottom: "4px", textAlign: "center",
                      }}>
                        Pay Your Bill
                      </h2>
                      <p style={{
                        fontSize: "13px", color: "#6b7280", marginBottom: "32px",
                        textAlign: "center",
                      }}>
                        Choose how you&apos;d like to pay
                      </p>

                      {/* Grand total pill */}
                      {order && (
                        <div style={{
                          background: "linear-gradient(135deg, #5F35D2, #7c5ce5)",
                          borderRadius: "50px",
                          padding: "10px 32px",
                          marginBottom: "36px",
                          boxShadow: "0 8px 24px rgba(95,53,210,0.28)",
                        }}>
                          <p style={{ color: "#fff", fontSize: "24px", fontWeight: 800, margin: 0 }}>
                            {formatPrice(order.totalAmount, "NGN")}
                          </p>
                        </div>
                      )}

                      {/* ── Two-column card row ── */}
                      <div style={{
                        display: "flex", gap: "24px", width: "100%",
                        maxWidth: "560px", alignItems: "flex-start",
                      }}>

                        {/* QR Code card */}
                        {qrBase64 && (
                          <div style={{
                            flex: "0 0 auto",
                            background: "#fff",
                            borderRadius: "20px",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                            border: "1px solid #ede9fe",
                          }}>
                            {/* Icon label */}
                            <div style={{
                              background: "#f5f3ff", borderRadius: "8px",
                              padding: "4px 12px", marginBottom: "2px",
                            }}>
                              <p style={{
                                fontSize: "10px", fontWeight: 700, color: "#5F35D2",
                                letterSpacing: "0.08em", textTransform: "uppercase", margin: 0,
                              }}>
                                Scan to Pay
                              </p>
                            </div>

                            {/* QR image with purple border */}
                            <div style={{
                              border: "3px solid #5F35D2", borderRadius: "14px",
                              padding: "8px", background: "#fff",
                            }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`data:image/png;base64,${qrBase64}`}
                                alt="Scan to pay"
                                width={140}
                                height={140}
                                style={{ display: "block", borderRadius: "6px" }}
                              />
                            </div>

                            <p style={{
                              fontSize: "10px", color: "#9ca3af", textAlign: "center",
                              maxWidth: "140px", margin: 0, lineHeight: 1.4,
                            }}>
                              Open your banking app &amp; scan this code
                            </p>
                          </div>
                        )}

                        {/* Divider */}
                        {qrBase64 && bankAccounts.length > 0 && (
                          <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "center", gap: "6px", paddingTop: "24px",
                          }}>
                            <div style={{ width: "1px", height: "60px", background: "#e5e7eb" }} />
                            <span style={{
                              fontSize: "10px", color: "#9ca3af", fontWeight: 600,
                              textTransform: "uppercase", letterSpacing: "0.08em",
                            }}>or</span>
                            <div style={{ width: "1px", height: "60px", background: "#e5e7eb" }} />
                          </div>
                        )}

                        {/* Bank accounts card */}
                        {bankAccounts.length > 0 && (
                          <div style={{
                            flex: 1,
                            background: "#fff",
                            borderRadius: "20px",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
                            padding: "20px",
                            border: "1px solid #ede9fe",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}>
                            <div style={{
                              background: "#f5f3ff", borderRadius: "8px",
                              padding: "4px 12px", alignSelf: "flex-start",
                            }}>
                              <p style={{
                                fontSize: "10px", fontWeight: 700, color: "#5F35D2",
                                letterSpacing: "0.08em", textTransform: "uppercase", margin: 0,
                              }}>
                                Bank Transfer
                              </p>
                            </div>

                            {bankAccounts.map((account: any, idx: number) => (
                              <div
                                key={account.id}
                                style={{
                                  borderRadius: "12px",
                                  padding: "14px 16px",
                                  background: account.isDefault ? "linear-gradient(135deg, #f5f3ff, #ede9fe)" : "#f9fafb",
                                  border: account.isDefault ? "1.5px solid #c4b5fd" : "1px solid #e5e7eb",
                                  position: "relative",
                                }}
                              >
                                {account.isDefault && (
                                  <div style={{
                                    position: "absolute", top: "-10px", right: "12px",
                                    background: "linear-gradient(135deg, #5F35D2, #7c5ce5)",
                                    borderRadius: "20px", padding: "2px 10px",
                                  }}>
                                    <span style={{
                                      fontSize: "9px", fontWeight: 700, color: "#fff",
                                      letterSpacing: "0.06em", textTransform: "uppercase",
                                    }}>
                                      Default
                                    </span>
                                  </div>
                                )}
                                <p style={{
                                  fontSize: "20px", fontWeight: 800, color: "#111827",
                                  letterSpacing: "0.1em", margin: "0 0 2px",
                                }}>
                                  {account.accountNumber}
                                </p>
                                <p style={{ fontSize: "11px", color: "#374151", fontWeight: 600, margin: "0 0 1px" }}>
                                  {account.accountName}
                                </p>
                                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                                  {account.bankName}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer note */}
                      <p style={{
                        marginTop: "32px", fontSize: "10px", color: "#9ca3af",
                        textAlign: "center", maxWidth: "360px", lineHeight: 1.6,
                      }}>
                        Please use the order reference{" "}
                        <strong style={{ color: "#374151" }}>{singleOrder?.reference}</strong>{" "}
                        as your payment description. Thank you for your patronage!
                      </p>

                      {/* Powered-by badge */}
                      <div style={{
                        position: "absolute", bottom: "20px",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        <span style={{ fontSize: "9px", color: "#d1d5db", letterSpacing: "0.05em" }}>
                          POWERED BY HOBWISE
                        </span>
                      </div>
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
              <ModalFooter className="w-full flex gap-4 px-5 pb-5 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={initializing}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    borderRadius: "12px",
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: initializing ? "not-allowed" : "pointer",
                    opacity: initializing ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!initializing) {
                      e.currentTarget.style.borderColor = "#5F35D2";
                      e.currentTarget.style.color = "#5F35D2";
                      e.currentTarget.style.background = "#f8f7ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.color = "#374151";
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  <HiOutlineDownload style={{ fontSize: "18px" }} />
                  {initializing ? "Generating…" : "Save as PDF"}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={initializing}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #5F35D2, #7c5ce5)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: initializing ? "not-allowed" : "pointer",
                    opacity: initializing ? 0.6 : 1,
                    boxShadow: "0 4px 14px rgba(95, 53, 210, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!initializing) {
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(95, 53, 210, 0.45)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(95, 53, 210, 0.35)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FiPrinter style={{ fontSize: "18px" }} />
                  {initializing ? "Generating…" : "Print Invoice"}
                </button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;