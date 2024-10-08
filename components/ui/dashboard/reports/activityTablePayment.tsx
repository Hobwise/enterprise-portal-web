import { CustomButton } from '@/components/customButton';
import usePagination from '@/hooks/usePagination';
import { downloadCSV } from '@/lib/downloadToExcel';
import {
  SmallLoader,
  formatDateTimeForPayload3,
  formatPrice,
  getJsonItemFromLocalStorage,
  printPDF,
  saveAsPDF,
} from '@/lib/utils';
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import moment from 'moment';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { BsPrinter } from 'react-icons/bs';
import { IoIosArrowForward } from 'react-icons/io';
import { MdOutlineFileDownload } from 'react-icons/md';
import CSV from '../../../../public/assets/icons/csv-icon.png';
import PDF from '../../../../public/assets/icons/pdf-icon.png';
import { statusColorMap, statusDataMap } from '../orders/data';
import { paymentMethodMap } from '../payments/data';

const INITIAL_VISIBLE_COLUMNS4 = [
  'customer',
  'treatedBy',
  'totalAmount',
  'reference',
  'paymentMethod',
  'status',
];
const INITIAL_VISIBLE_COLUMNS5 = [
  'lastRecordDateTime',
  'paymentCount',
  'paymentMethod',
  'totalAmount',
];

const INITIAL_VISIBLE_COLUMNS6 = [
  'confirmedAmount',
  'dateUpdated',
  'numberOfOrders',
  'pendingAmount',
  'qrName',
  'totalAmount',
];

const columns4 = [
  { name: 'Customer Name', uid: 'customer' },
  { name: 'Treated By', uid: 'treatedBy' },
  { name: 'Total Amount', uid: 'totalAmount' },
  { name: 'Reference', uid: 'reference' },
  { name: 'Payment Method', uid: 'paymentMethod' },
  { name: 'Status', uid: 'status' },
];

const columns5 = [
  { name: 'Payment Method', uid: 'paymentMethod' },
  { name: 'Payment Count', uid: 'paymentCount' },
  { name: 'Amount', uid: 'totalAmount' },
  { name: 'Date Updated', uid: 'lastRecordDateTime' },
];
const columns6 = [
  { name: 'QR', uid: 'qrName' },
  { name: 'Pending Payment', uid: 'pendingAmount' },
  { name: 'Total Payment', uid: 'totalAmount' },
  { name: 'Total Order Count', uid: 'numberOfOrders' },
  { name: 'Confirmed Payment', uid: 'confirmedAmount' },
];

const ActivityTablePayment = ({
  reportName,
  data,
  isLoading,
  selectedValue,
  reportType,
  value,
}: any) => {
  const business = getJsonItemFromLocalStorage('business');
  const columns = () => {
    if (reportType === 4) {
      return {
        data: data?.payments,
        column: columns4,
        visibleColumn: INITIAL_VISIBLE_COLUMNS4,
      };
    }
    if (reportType === 5) {
      return {
        data: data?.payments,
        column: columns5,
        visibleColumn: INITIAL_VISIBLE_COLUMNS5,
      };
    }
    if (reportType === 6) {
      return {
        data: data?.qrOrders,
        column: columns6,
        visibleColumn: INITIAL_VISIBLE_COLUMNS6,
      };
    }
  };

  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    selectedKeys,
    sortDescriptor,
    setSortDescriptor,

    classNames,
  } = usePagination(
    columns()?.data,
    columns()?.column,
    columns()?.visibleColumn
  );

  const [showMore, setShowMore] = useState(false);
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const toggleDownloadReport = () => {
    setIsOpenDownload(!isOpenDownload);
  };
  const toggleMoreFilters = () => {
    setShowMore(!showMore);
  };

  const renderCell = useCallback((payment, columnKey) => {
    const cellValue = payment[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>{payment.placedByName}</span>
          </div>
        );
      case 'paymentMethod':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span> {paymentMethodMap[payment.paymentMethod]}</span>
          </div>
        );

      case 'amount':
        return (
          <div className='text-textGrey text-sm'>
            <p>{formatPrice(payment.totalAmount)}</p>
          </div>
        );
      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(payment.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'lastRecordDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(payment.lastRecordDateTime).format(
              'MMMM Do YYYY, h:mm:ss a'
            )}
          </div>
        );
      case 'lastOrderDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(payment.lastOrderDateTime).format(
              'MMMM Do YYYY, h:mm:ss a'
            )}
          </div>
        );
      case 'dateUpdated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(payment.dateUpdated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );

      case 'pendingAmount':
        return (
          <div className='text-textGrey text-sm'>
            {formatPrice(payment.pendingAmount)}
          </div>
        );
      case 'totalAmount':
        return (
          <div className='text-textGrey text-sm'>
            {formatPrice(payment.totalAmount)}
          </div>
        );
      case 'confirmedAmount':
        return (
          <div className='text-textGrey text-sm'>
            {formatPrice(payment.confirmedAmount)}
          </div>
        );
      case 'orderID':
        return <div className='text-textGrey text-sm'>{payment.reference}</div>;

      case 'status':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap[payment.status]}
            size='sm'
            variant='bordered'
          >
            {statusDataMap[cellValue]}
          </Chip>
        );

      default:
        return cellValue;
    }
  }, []);

  const reportRef = useRef(null);

  return (
    <>
      <div className='w-full mt-4 flex justify-end  gap-3'>
        <CustomButton
          disableRipple={true}
          onClick={() => toggleDownloadReport()}
          className='py-2 px-4 md:mb-0 text-black  mb-4 '
          backgroundColor='bg-white'
        >
          <div className='flex gap-2 items-center justify-center'>
            <MdOutlineFileDownload className='text-[22px]' />
            <p>Download</p>
          </div>
        </CustomButton>
        <CustomButton
          disableRipple={true}
          onClick={() => printPDF(reportRef, reportName)}
          className='py-2 px-4 md:mb-0 text-black mb-4 '
          backgroundColor='bg-white'
        >
          <div className='flex gap-2 items-center justify-center'>
            <BsPrinter className='text-[22px]' />

            <p>Print</p>
          </div>
        </CustomButton>
      </div>
      <section
        ref={reportRef}
        className='border border-primaryGrey rounded-md mt-2 p-3'
      >
        <div className=' flex flex-col items-center mb-4'>
          <p className='text-xl font-bold capitalize'>All {reportName}s</p>
          <p className='text-base font-semibold'>
            {business[0]?.businessName}, {business[0]?.city}{' '}
            {business[0]?.state}
          </p>
          <p className='text-sm text-grey600'>
            {selectedValue === 'Custom date' && (
              <p className='text-default-500 text-sm'>
                {value.start &&
                  moment(formatDateTimeForPayload3(value?.start)).format(
                    'MMMM Do YYYY'
                  )}
                {' - '}
                {value.end &&
                  moment(formatDateTimeForPayload3(value?.end)).format(
                    'MMMM Do YYYY'
                  )}
              </p>
            )}
          </p>
          <p className='text-xs text-danger-500'>{data?.message}</p>
        </div>
        <Table
          radius='lg'
          isCompact
          removeWrapper
          allowsSorting
          aria-label='list of orders'
          // bottomContent={bottomContent}
          bottomContentPlacement='outside'
          classNames={classNames}
          selectedKeys={selectedKeys}
          // selectionMode='multiple'
          sortDescriptor={sortDescriptor}
          // topContent={topContent}
          topContentPlacement='outside'
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === 'actions' ? 'center' : 'start'}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            style={{
              textAlign: 'center',
            }}
            emptyContent={'No items found'}
            items={columns()?.data || []}
            isLoading={isLoading}
            loadingContent={<SmallLoader />}
          >
            {(item) => (
              <TableRow
                key={
                  item?.id || item?.lastRecordDateTime || item?.quickResponseID
                }
              >
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <Modal
        className='text-black'
        isOpen={isOpenDownload}
        onOpenChange={toggleDownloadReport}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Choose a method to export
              </ModalHeader>
              <ModalBody className='mb-6'>
                <div
                  onClick={() => saveAsPDF(reportRef, reportName)}
                  className='flex justify-between items-center cursor-pointer px-3 py-4 hover:bg-primaryGrey rounded-md'
                >
                  <div className='flex gap-2'>
                    <Image src={PDF} alt='pdf icon' />
                    <p>Export as PDF</p>
                  </div>
                  <IoIosArrowForward className='text-grey600' />
                </div>
                <div
                  onClick={() => downloadCSV(columns()?.data)}
                  className='flex justify-between items-center cursor-pointer px-3 py-4 hover:bg-primaryGrey rounded-md'
                >
                  <div className='flex gap-2'>
                    <Image src={CSV} alt='pdf icon' />
                    <p>Export as CSV</p>
                  </div>
                  <IoIosArrowForward className='text-grey600' />
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ActivityTablePayment;
