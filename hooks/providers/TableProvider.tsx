'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

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

// Helper functions for sessionStorage
const getStoredValue = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from sessionStorage:`, error);
    return defaultValue;
  }
};

const setStoredValue = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to sessionStorage:`, error);
  }
};

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from sessionStorage
  const [page, setPageState] = useState<number>(() => getStoredValue('table_page', 1));
  const [rowsPerPage, setRowsPerPageState] = useState<number>(() => getStoredValue('table_rowsPerPage', 10));
  const [tableStatus, setTableStatusState] = useState<string>(() => getStoredValue('table_status', 'All'));

  // Wrapped setters that persist to sessionStorage
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    setStoredValue('table_page', newPage);
  }, []);

  const setRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPageState(newRowsPerPage);
    setStoredValue('table_rowsPerPage', newRowsPerPage);
  }, []);

  const setTableStatus = useCallback((newStatus: string) => {
    setTableStatusState(newStatus);
    setStoredValue('table_status', newStatus);
  }, []);

  // Memoized callback to reset pagination
  const resetPagination = useCallback(() => {
    setPage(1);
    setRowsPerPage(10);
    setTableStatus('All');
  }, [setPage, setRowsPerPage, setTableStatus]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    tableStatus,
    setTableStatus,
    resetPagination,
  }), [page, setPage, rowsPerPage, setRowsPerPage, tableStatus, setTableStatus, resetPagination]);

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