'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface TableContextType {
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  tableStatus: string;
  setTableStatus: (status: string) => void;
  resetPagination: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [tableStatus, setTableStatus] = useState<string>('All');

  // Memoized callback to reset pagination
  const resetPagination = useCallback(() => {
    setPage(1);
    setRowsPerPage(10);
    setTableStatus('All');
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    tableStatus,
    setTableStatus,
    resetPagination,
  }), [page, rowsPerPage, tableStatus, resetPagination]);

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
};

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};