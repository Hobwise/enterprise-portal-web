import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Pagination,
} from '@nextui-org/react';

// Define the types for the props
interface Column {
  name: string; // Column name should be a string
}

interface Row {
  [key: string]: string | number; // Row data can have dynamic keys, with string or number values
}

interface PaginatedTableProps {
  columns: Column[]; // Array of column objects
  data: Row[]; // Array of row data objects
  rowsPerPage?: number; // Optional: number of rows per page (default is 2)
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  columns,
  data,
  rowsPerPage = 2,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Slice data based on the current page
  const currentData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <Table aria-label="Paginated table with NextUI">
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.name}>{column.name}</TableCell>
            ))}
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {currentData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.name}>{row[column.name]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PaginatedTable;
