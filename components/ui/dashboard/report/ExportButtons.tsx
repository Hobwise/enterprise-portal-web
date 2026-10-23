'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { BsFiletypeXlsx, BsFiletypePdf } from 'react-icons/bs';
import { ExportType, ExportTypeValue } from './exportHelpers';

interface ExportButtonsProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  exportingType?: ExportTypeValue | null;
  size?: 'sm' | 'md';
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPdf,
  exportingType,
  size = 'sm',
}) => {
  const isExcelLoading = exportingType === ExportType.Excel;
  const isPdfLoading = exportingType === ExportType.Pdf;
  const sizing = size === 'md' ? 'text-sm h-10 px-4' : 'text-xs h-9';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="bordered"
        onPress={onExportExcel}
        isLoading={isExcelLoading}
        isDisabled={exportingType !== null && !isExcelLoading}
        startContent={isExcelLoading ? null : <BsFiletypeXlsx size={16} className="text-[#1D6F42]" />}
        className={`border border-gray-200 text-gray-700 bg-white rounded-lg ${sizing}`}
      >
        Export Excel
      </Button>
      <Button
        onPress={onExportPdf}
        isLoading={isPdfLoading}
        isDisabled={exportingType !== null && !isPdfLoading}
        startContent={isPdfLoading ? null : <BsFiletypePdf size={16} />}
        className={`bg-primaryColor text-white rounded-lg ${sizing}`}
      >
        Export PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
