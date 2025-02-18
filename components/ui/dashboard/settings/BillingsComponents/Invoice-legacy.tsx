import React, { useEffect, useRef } from "react";
import { SubscriptionHistory } from "./Interfaces";
import { addCommasToNumber, getJsonItemFromLocalStorage } from "@/lib/utils";
import moment from "moment";
import CompanyLogo from "@/components/logo";
import hobinkLogo from "../../../../../public/assets/images/hobink-logo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { log } from "console";

interface InvoiceDetails {
  data: SubscriptionHistory | null;
  download: boolean;
  setDownloadClickedInvoice: React.Dispatch<React.SetStateAction<boolean>>;
}

const InvoiceSection: React.FC<InvoiceDetails> = ({
  data,
  download,
  setDownloadClickedInvoice,
}) => {
  // console.log("DOWNLOAD", download)

  useEffect(() => {
    console.log("data", data);
    // alert(data);
    console.log("download", download);
    console.log("setDownloadClickedInvoice", setDownloadClickedInvoice);
  }, []);

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const business = userInformation?.businesses[0];
  const invoiceRef = useRef<HTMLDivElement>(null);

  const mapPlan = (plan: number) => {
    return (
      ["Unknown", "Premium Plan", "Professional Plan", "Basic Plan"][plan] ||
      "Unknown"
    );
  };
  const mapAmount = (amount: number) => `₦${addCommasToNumber(amount)}`;

  useEffect(() => {
    // console.log("BUSINESS", business)

    if (download) {
      generatePDF();
    }
  }, [download]);

  let isGenerating = false;

  const generatePDF = async () => {
    // console.log("FUNCTION called");

    if (isGenerating) return; // Prevent duplicate calls
    isGenerating = true;

    try {
      if (invoiceRef.current) {
        console.log("REF TINGZ", invoiceRef.current);
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4", true);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("HobinkInvoice.pdf");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      isGenerating = false;
      setDownloadClickedInvoice(false); // Reset state
    }
  };

  return (
    <section>
      <div className="max-w-2xl mx-auto py-0 md:py-16">
        <article
          className="shadow-none md:shadow-md md:rounded-md overflow-hidden"
          ref={invoiceRef}
        >
          <div className="md:rounded-b-md bg-white">
            <div className="p-9 border-b border-gray-200">
              <div className="space-y-6">
                <div className="flex justify-between items-top">
                  <div className="space-y-4">
                    <div>
                      <CompanyLogo
                        textColor="text-black font-lexend text-[28px] font-[600]"
                        containerClass="flex gap-2 items-center "
                      />
                      <p className="font-bold text-lg">Invoice</p>
                      <p>Hobink</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-black">
                        Billed To
                      </p>
                      <p className="font-medium text-black">
                        {business?.businessName}
                      </p>
                      <p className="font-medium text-sm text-dark">
                        {business?.businessContactEmail}
                      </p>
                      <p className="font-medium text-sm text-dark">
                        {business?.businessContactNumber}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm text-dark">
                        Invoice Number
                      </p>
                      <p className="font-medium text-sm text-black">
                        {data?.subscriptionPlanCode}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-dark">
                        Invoice Date
                      </p>
                      <p className="font-medium text-sm text-black">
                        {moment(data?.subscriptionStartDate).format(
                          "DD/MM/YYYY"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-9 border-b border-dark">
              <p className="font-medium text-sm text-dark">Note</p>
              <p className="text-sm text-dark">Thank you for your order.</p>
            </div>
            <table className="w-full divide-y divide-dark text-sm">
              <thead>
                <tr>
                  <th className="px-9 py-4 text-left font-semibold text-dark">
                    Item
                  </th>
                  <th className="py-3 text-left font-semibold text-dark"></th>
                  <th className="py-3 text-left font-semibold text-dark">
                    Amount
                  </th>

                  <th className="py-3 text-left font-semibold text-dark"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark">
                <tr>
                  <td className="px-9 py-5 whitespace-nowrap text-black space-x-1 flex items-center">
                    <div>
                      <p>{mapPlan(data?.plan!)}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-black truncate"></td>
                  <td className="whitespace-nowrap text-black truncate">
                    {mapAmount(data?.totalAmount!)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-9 border-b border-dark">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-dark text-sm">Subtotal</p>
                  </div>
                  <p className="text-black text-sm">
                    {mapAmount(data?.totalAmount!)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-dark text-sm">Tax</p>
                  </div>
                  <p className="text-black text-sm">₦0.00</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-dark text-sm">Total</p>
                  </div>
                  <p className="text-black text-sm">
                    {mapAmount(data?.totalAmount!)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-9 border-b border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-black text-lg">Amount Paid</p>
                  </div>
                  <p className="font-bold text-black text-lg">
                    {mapAmount(data?.totalAmount!)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default InvoiceSection;
