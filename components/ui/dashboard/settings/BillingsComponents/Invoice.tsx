import React, { useEffect, useRef } from 'react';
import { SubscriptionHistory } from './Interfaces';
import { addCommasToNumber, getJsonItemFromLocalStorage } from '@/lib/utils';
import moment from 'moment';
import CompanyLogo from '@/components/logo';
import hobinkLogo from '../../../../../public/assets/images/hobink-logo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { log } from 'console';

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
    console.log('data', data);
    // alert(data);
    console.log('download', download);
    console.log('setDownloadClickedInvoice', setDownloadClickedInvoice);
  }, []);

  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const business = userInformation?.businesses[0];
  const invoiceRef = useRef<HTMLDivElement>(null);

  const mapPlan = (plan: number) => {
    return (
      ['Unknown', 'Premium Plan', 'Professional Plan', 'Starter Plan'][plan] ||
      'Unknown'
    );
  };
    const mapAmount = (amount: number) => `₦${addCommasToNumber(amount)}`;
    
  const mapPeriod = (paymentPeriod: number) => {
    switch (paymentPeriod) {
      case 0:
        return 'Monthly';
      case 1:
        return 'Yearly';
      default:
        return 'Unknown';
    }
  };

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
        console.log('REF TINGZ', invoiceRef.current);
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4', true);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('HobinkInvoice.pdf');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      isGenerating = false;
      setDownloadClickedInvoice(false); // Reset state
    }
  };

  return (
    <section ref={invoiceRef} >
      <div className="mx-auto py-0 md:py-16">
        <article className="shadow-none ">
          <div className="md:rounded-b-md bg-white">
            <div className="p-3 border-b border-gray-200">
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
                    <div className="text-sm text-grey500">
                      <p className="font-semibold text-black">BILLED TO</p>
                      <p>{business?.businessName}</p>
                      <p>{business?.businessContactEmail}</p>
                      <p className="font-medium text-sm text-dark">
                        {business?.businessContactNumber}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="font-bold text-sm text-dark">
                        INVOICE NUMBER
                      </p>
                      <p className="font-medium text-xs text-black">
                        {data?.reference}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-dark">
                        INVOICE DATE
                      </p>
                      <p className="font-medium text-sm text-black">
                        {moment(data?.subscriptionStartDate).format(
                          'DD/MM/YYYY'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 border-b border-gray-200">
              <p className="font-medium text-sm text-dark">Note</p>
              <p className="text-sm text-dark">Thank you for your order.</p>
            </div>
            <div className="px-3 py-6">
              <table className="text-black">
                <thead className="text-sm border-b">
                  <tr>
                    <th className="text-left py-2">ITEM</th>
                    <th className="text-center py-2">PERIOD</th>
                    <th className="text-right py-2">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-sm">
                    <td className="text-left py-2">{mapPlan(data?.plan!)}</td>
                    <td className="text-center py-2">
                      {mapPeriod(data?.paymentPeriod!)}
                    </td>
                    <td className="text-right py-2">
                      {mapAmount(data?.totalAmount!)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 border-b border-gray-200">
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
            <div className="p-3 border-b border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-black">Amount Paid</p>
                  </div>
                  <p className="font-bold text-black">
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
