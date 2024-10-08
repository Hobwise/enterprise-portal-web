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

// export const statusBookingMap: Record<
//   number,
//   'warning' | 'success' | 'danger' | 'secondary'
// > = {
//   0: 'warning',
//   1: 'success',
//   2: 'danger',
//   3: 'secondary',
// };

const INITIAL_VISIBLE_COLUMNS8 = [
  'dateUpdated',

  'reservationName',
  'totalBookingFee',
  'totalBookings',
  'totalMinimumSpendValue',
];

const INITIAL_VISIBLE_COLUMNS9 = [
  'dateUpdated',
  'emailAddress',
  'firstName',
  'phoneNumber',
  'totalBookingFee',
  'totalBookings',
  'totalMinimumSpendValue',
];

const INITIAL_VISIBLE_COLUMNS7 = [
  'firstName',
  'bookingDateTime',
  'checkInDateTime',
  'checkOutDateTime',
  'emailAddress',
  'minimumSpend',
  'bookingStatus',
  'bookingFee',
];
const columns7 = [
  { name: 'Name', uid: 'firstName' },
  //   { name: 'Minimum Spend', uid: 'minimumSpend' },
  //   { name: 'Booking Fee', uid: 'bookingFee' },
  { name: 'Booking date', uid: 'bookingDateTime' },
  { name: 'Email Address', uid: 'emailAddress' },
  { name: 'CheckOut Date', uid: 'checkOutDateTime' },
  { name: 'CheckIn Date', uid: 'checkInDateTime' },
  //   { name: 'Status', uid: 'bookingStatus' },
];

const columns8 = [
  { name: 'Reservation Name', uid: 'reservationName' },
  { name: 'Total Booking Amount', uid: 'totalBookingFee' },
  { name: 'Total Bookings', uid: 'totalBookings' },
  { name: 'Date Updated', uid: 'dateUpdated' },
  { name: 'Total Minimum Spend', uid: 'totalMinimumSpendValue' },
];

const columns9 = [
  { name: 'Name', uid: 'firstName' },
  { name: 'Phone Number', uid: 'phoneNumber' },
  { name: 'Email Address', uid: 'emailAddress' },
  //   { name: 'Total Booking Fee', uid: 'totalBookingFee' },
  { name: 'Total Bookings', uid: 'totalBookings' },
  { name: 'Total Minimum Spend', uid: 'totalMinimumSpendValue' },
  { name: 'Date Updated', uid: 'dateUpdated' },
];

const INITIAL_VISIBLE_COLUMNS10 = [
  'endDate',
  'occupancyRate',
  'reservationName',
  'reservationQuantity',
  'startDate',
  'totalBookings',
];

const columns10 = [
  { name: 'Reservation Name', uid: 'reservationName' },
  { name: 'Quantity', uid: 'reservationQuantity' },
  { name: 'Occupancy Rate', uid: 'occupancyRate' },
  { name: 'Total Bookings', uid: 'totalBookings' },
  { name: 'Start Date', uid: 'startDate' },
  { name: 'End Date', uid: 'endDate' },
];

const ActivityTableBooking = ({
  reportName,
  data,
  isLoading,
  selectedValue,
  reportType,
  value,
}: any) => {
  const business = getJsonItemFromLocalStorage('business');
  const columns = () => {
    if (reportType === 7) {
      return {
        data: data?.bookings,
        column: columns7,
        visibleColumn: INITIAL_VISIBLE_COLUMNS7,
      };
    }

    if (reportType === 8) {
      return {
        data: data?.reservationBookings,
        column: columns8,
        visibleColumn: INITIAL_VISIBLE_COLUMNS8,
      };
    }
    if (reportType === 9) {
      return {
        data: data?.customerBookings,
        column: columns9,
        visibleColumn: INITIAL_VISIBLE_COLUMNS9,
      };
    }
    if (reportType === 10) {
      return {
        data: data?.dailyOccupancyUtilizations,
        column: columns10,
        visibleColumn: INITIAL_VISIBLE_COLUMNS10,
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

  const renderCell = useCallback((booking, columnKey) => {
    const cellValue = booking[columnKey];

    switch (columnKey) {
      case 'firstName':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>
              {booking.firstName} {booking.lastName}
            </span>
          </div>
        );

      case 'minimumSpend':
        return (
          <div className='text-textGrey text-sm'>
            <p>{formatPrice(booking.minimumSpend)}</p>
          </div>
        );
      case 'totalBookingFee':
        return (
          <div className='text-textGrey text-sm'>
            <p>{formatPrice(booking.totalBookingFee)}</p>
          </div>
        );

      case 'bookingFee':
        return (
          <div className='text-textGrey text-sm'>
            <p>{formatPrice(booking.bookingFee)}</p>
          </div>
        );
      case 'checkOutDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(booking.checkOutDateTime).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'endDate':
        return (
          <div className='text-textGrey text-sm'>
            {moment(booking.endDate).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'startDate':
        return (
          <div className='text-textGrey text-sm'>
            {moment(booking.startDate).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'checkInDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(booking.checkInDateTime).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'bookingDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(booking.bookingDateTime).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );

      case 'dateUpdated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(booking.dateUpdated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
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
                  item?.reservationId ||
                  item?.lastOrderDateTime ||
                  item?.dateUpdated ||
                  item?.reservationId
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

export default ActivityTableBooking;
