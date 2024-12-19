"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
  Chip,
  Spinner,
  Pagination,
} from "@nextui-org/react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { VscEye } from "react-icons/vsc";
import InvoiceSection from "./Invoice";
import moment from "moment";
import { addCommasToNumber } from "@/lib/utils";
import usePagination from "@/hooks/usePagination";
import CustomPagination from "./CustomPagination";

const SubscriptionTable = ({ subscriptions, searchQuery }: any) => {
  const [filteredData, setFilteredData] = useState(subscriptions);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [downloadClickedInvoice, setDownloadClickedInvoice] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 5;


  useEffect(() => {
    if (subscriptions && searchQuery) {
      const filtered = subscriptions.filter((item: any) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);

      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    } else {
      setFilteredData(subscriptions);
      setTotalPages(Math.ceil(subscriptions?.length / ITEMS_PER_PAGE));
    }
  }, [searchQuery, subscriptions]);

  const paginatedData = filteredData?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const INITIAL_VISIBLE_COLUMNS = [
    "plan",
    "billDate",
    "amount",
    "duration",
    "invoice",
  ];

  const columns = [
    { name: "ID", uid: "id" },
    { name: "Plan", uid: "plan" },
    { name: "Bill Date", uid: "billDate" },
    { name: "Amount", uid: "amount" },
    { name: "Duration", uid: "duration" },
    { name: "Invoice", uid: "invoice" },
    // { name: '', uid: 'actions' },
  ];

  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,

    selectedKeys,
    sortDescriptor,
    setSortDescriptor,

    classNames,
  } = usePagination(subscriptions, columns, INITIAL_VISIBLE_COLUMNS);


  const mapPlan = (plan: number) => {
    return ["Unknown", "Premium", "Professional", "Starter"][plan] || "Unknown";
  };

  const mapAmount = (amount: number) => `₦${addCommasToNumber(amount)}`;


  const mapPaymentPeriod = (paymentPeriod: number) =>
    paymentPeriod === 0 ? "Monthly" : "Annually";

  const renderCell = useCallback((item: any, columnKey: string) => {
    switch (columnKey) {
      case "subscriptionEndDate":
        return moment(item[columnKey]).isValid()
          ? moment(item[columnKey]).format("DD/MM/YYYY hh:mm A")
          : "N/A";
      case "isActive":
        return (
          <Chip
            className={`text-xs h-6 font-bold ${
              item[columnKey]
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {item[columnKey] ? "Active" : "Inactive"}
          </Chip>
        );
      case "invoice":
        return (
          <div className="flex flex-row gap-3">
            <button
              className="text-blue-500 flex items-center gap-1 hover:underline"
              onClick={() => openInvoiceModal(item)}
            >
              <VscEye />
              View
            </button>

            <button
              className="text-primaryColor flex items-center gap-1 hover:underline"
              onClick={() => downloadInvoice(item)}
              disabled={downloadingInvoiceId === item.id}
            >
              <AiOutlineCloudDownload />
              Download
              {downloadingInvoiceId === item.id && <Spinner size="sm" color="secondary" />}
            </button>


          </div>
        );
      case "plan":
        return mapPlan(item[columnKey]);
      case "amount":
        return mapAmount(item[columnKey]);
      case "paymentPeriod":
        return mapPaymentPeriod(item[columnKey]);
      default:
        return item[columnKey] || "N/A";
    }
  }, [downloadingInvoiceId]);


  const downloadInvoice = (details: any) => {
    setInvoiceDetails(details);
    setDownloadClickedInvoice(true);
    setDownloadingInvoiceId(details?.id); // Set the specific invoice ID being downloaded

 
    // Simulate an async operation (e.g., API call to download the invoice)
    setTimeout(() => {
      console.log("Invoice downloaded:", details?.id);
      setDownloadingInvoiceId(null); // Reset after the download completes
    }, 2000);
  };




  const openInvoiceModal = (details: any) => {
    setInvoiceDetails(details);
    onOpen();
  };

  return (
    <section className="border border-secondaryGrey rounded-lg overflow-hidden">
      <div className="overflow-x-auto">

      <Table
        aria-label="Subscription List"
        radius="lg"
        isCompact
        removeWrapper
        className="overflow-x-auto"
        allowsSorting
        bottomContentPlacement="outside"
        classNames={classNames}
        topContentPlacement="outside"
      >
        <TableHeader columns={headerColumns}>
       

          {(column) => (
            <TableColumn
              key={column.uid}
              // align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={paginatedData || []} emptyContent={"No subscriptions found"}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="text-left font-medium">
                {mapPlan(item.plan)}
              </TableCell>
              <TableCell>{renderCell(item, "subscriptionEndDate")}</TableCell>
              <TableCell>{mapPaymentPeriod(item.paymentPeriod)}</TableCell>
              <TableCell>{mapAmount(item.totalAmount)}</TableCell>
              <TableCell className="text-center">
                {renderCell(item, "invoice")}
              </TableCell>
            </TableRow>
          )}
         
        </TableBody>
      </Table>
      </div>
      
    
     <CustomPagination 
       currentPage={currentPage}
       totalPages={totalPages}
       onPageChange={handlePageChange}
       onNext={handleNext}
       onPrevious={handlePrevious}
      
      /> 

      {downloadClickedInvoice && (
        <div className="" style={{ height: 0 }}  >
        {/* <div className=""  style={{ visibility: 'hidden', height: 0, overflow: 'hidden' }}> */}
          <InvoiceSection
            data={invoiceDetails}
            download={downloadClickedInvoice}
            setDownloadClickedInvoice={setDownloadClickedInvoice}
          />
        </div>
       )} 

      {invoiceDetails && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <div className=" inset-0 z-20 flex items-center justify-center">
            <ModalContent className="w-full max-w-[90%] sm:max-w-[600px] h-auto max-h-[90%] bg-white shadow-lg rounded-lg overflow-hidden">
              <ModalBody className="p-4 overflow-y-auto max-h-[80vh]">
                <InvoiceSection
                  data={invoiceDetails}
                  download={downloadClickedInvoice}
                  setDownloadClickedInvoice={setDownloadClickedInvoice}
                />
              </ModalBody>
            </ModalContent>
          </div>
        </Modal>

      //   <Modal isOpen={isOpen} onClose={onClose}>
      //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      //     <ModalContent className="relative w- max-w-[90%] sm:max-w-[300px] bg-white shadow-lg rounded-lg overflow-hidden">
      //       <ModalBody className="p-4 overflow-y-auto max-h-[80vh]">
      //         <InvoiceSection
      //           data={invoiceDetails}
      //           download={downloadClickedInvoice}
      //           setDownloadClickedInvoice={setDownloadClickedInvoice}
      //         />
      //       </ModalBody>
      //     </ModalContent>
      //   </div>
      // </Modal>
      )}
    </section>
  );
};

export default SubscriptionTable;
