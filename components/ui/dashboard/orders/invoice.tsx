"use client";
import { getOrder } from "@/app/api/controllers/dashboard/orders";
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

const InvoiceModal = ({
  isOpenInvoice,
  singleOrder,
  toggleInvoiceModal,
}: any) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState([]);

  const invoiceRef = useRef(null);

  const getOrderDetails = async () => {
    setIsLoading(true);
    const data = await getOrder(singleOrder.id);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      setOrder(data?.data?.data);
    } else if (data?.data?.error) {
    }
  };

  useEffect(() => {
    if (singleOrder?.id) {
      getOrderDetails();
    }
  }, [singleOrder?.id]);

  return (
    <Modal
    
      isDismissable={false}
      isOpen={isOpenInvoice}
      onOpenChange={toggleInvoiceModal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="flex justify-center" ref={invoiceRef}>
              <h3 className="font-[600] text-center text-lg text-black mt-6 mb-3">
                {businessInformation[0]?.businessName}
              </h3>
              <p className="flex justify-end font-semibold text-sm text-black">
                BILL TO
              </p>
              <div className="flex justify-between gap-3">
                <div className="text-sm text-grey500">
                  <p>{businessInformation[0]?.businessAddress}</p>
                  <p>
                    {businessInformation[0]?.city},{" "}
                    {businessInformation[0]?.state}
                  </p>
                  <p>{businessInformation[0]?.businessContactNumber}</p>
                </div>
                <div className="text-sm text-grey500 text-right">
                  <p className="">{singleOrder.placedByName}</p>
                  <p>{singleOrder.placedByPhoneNumber}</p>
                  <p>
                    {moment(singleOrder.dateCreated).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    )}
                  </p>
                </div>
              </div>
              <Divider />
              <div className="flex justify-between text-sm gap-3 font-semibold text-black">
                <p>{singleOrder.qrReference}</p>
                <p>
                  Served by{" "}
                  <span className="text-grey500 font-[400]">
                    {userInformation.firstName} {userInformation.lastName}
                  </span>
                </p>
              </div>

              <Divider />
              {isLoading ? (
                <div className={`flex flex-col items-center my-5`}>
                  <Spinner size="sm" />
                  <p className="text-center mt-1 text-[13px] text-grey400">
                    Fetching order details...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between gap-3  text-sm text-black">
                    <p>ITEM</p>
                    <p>PRICE</p>
                  </div>

                  <div>
                    {order.orderDetails?.map((item: any) => {
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between items-center gap-3 text-sm space-y-3 text-black"
                        >
                          <div className="text-grey500">
                            <p>
                              {item.itemName}{" "}
                              <span className="text-black">
                                {item.unit && `(${item.unit})`}
                              </span>{" "}
                              x {item.quantity}{" "}
                            </p>
                          </div>
                          <div className="font-bold  text-end">
                            <p>{formatPrice(item.totalPrice)}</p>

                            <p
                              className={`text-xs ${
                                item.packingCost ? "block" : "hidden"
                              } text-grey500 font-normal`}
                            >
                              Pack cost: {formatPrice(item.packingCost)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Divider />
                  <div className="text-sm text-black font-bold">
                    <div className="flex justify-between gap-3 ">
                      <p>Subtotal</p>
                      <p>{formatPrice(order.subTotalAmount)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-black font-bold gap-3">
                      <p>VAT (7.5%) </p>
                      <p>{formatPrice(order.vatAmount)}</p>
                    </div>

                    <div
                      className={`${
                        order.additionalCost ? "flex" : "hidden"
                      } justify-between text-sm text-black font-bold gap-3`}
                    >
                      <p>{order.additionalCostName || "Additional Cost"} </p>
                      <p>{formatPrice(order.additionalCost)}</p>
                    </div>

                    <div className="flex text-lg justify-between gap-3 ">
                      <p>Total</p>
                      <p>{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                  <Divider />
                </>
              )}
            </ModalBody>
            <Spacer y={1} />
            {!isLoading && (
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
            )}
            <Spacer y={2} />
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;
