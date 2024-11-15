'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { CustomButton } from '@/components/customButton';
import { Transition } from '@/components/ui/landingPage/transition';

interface Column {
  name: string;
}

interface Reservation {
  plan: string;
  billDate: string;
  duration: string;
  amount: string;
  invoice: string;
  download: string;
  phone1: string;
  phone2: string;
}

interface TableProps {
  columns: Column[];
  allReservations: Reservation[];
}

export function Table({ columns, allReservations }: TableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  // Calculate the index of rows to display based on the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentReservations = allReservations.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(allReservations.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="border border-[#E4E7EC] bg-white text-[#344054] rounded-lg">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 bg-[#F9FAFB] py-4 px-4 rounded-tr-lg rounded-tl-lg">
        {columns.map((column) => (
          <p key={column.name} className="font-light text-xs">
            {column.name}
          </p>
        ))}
      </div>

      {/* Table Rows */}
      <div className="bg-white">
        {currentReservations.map((reservation, index) => (
          <Transition key={index}>
            <div className="grid grid-cols-6 gap-4 py-4 text-sm px-4 border-b border-b-[#E4E7EC80]">
              {/* Plan */}
              <p className="text-sm">{reservation.plan}</p>

              {/* Bill Date */}
              <p className="text-sm">{reservation.billDate}</p>

              {/* Duration */}
              <p className="text-sm">{reservation.duration}</p>

              {/* Amount */}
              <p className="text-sm">{reservation.amount}</p>

              {/* Invoice and Download Links */}
              <div className="flex space-x-2">
                <button className="text-blue-500 underline">{reservation.invoice}</button>
                <button className="text-blue-500 underline">{reservation.download}</button>
              </div>

              {/* Phone Numbers */}
              <div className="flex flex-col space-y-1">
                <p className="text-sm">{reservation.phone1}</p>
                <p className="text-sm">{reservation.phone2}</p>
              </div>
            </div>
          </Transition>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 bg-gray-200 rounded-md ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          Previous
        </button>
        <p className="text-sm">
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 bg-gray-200 rounded-md ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Table;
