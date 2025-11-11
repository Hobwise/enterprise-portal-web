import { CustomInput } from '@/components/CustomInput';
import usePagination from '@/hooks/usePagination';
import {
  SmallLoader,
  formatDateTimeForPayload3,
  getJsonItemFromLocalStorage,
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
import { useCallback, useMemo, useRef, useState } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { IoSearchOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';
import CSV from '../../../../public/assets/icons/csv-icon.png';
import PDF from '../../../../public/assets/icons/pdf-icon.png';
import { PaginationComponent } from './data';




export const statusBookingMap: Record<
  number,
  'warning' | 'success' | 'danger' | 'secondary'
> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
  3: 'secondary',
};

// Local color mapping for booking statuses coming as strings from reports API
const bookingStatusColorMap: Record<
  string,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  pending: 'warning',
  confirmed: 'success',
  admitted: 'default',
  cancelled: 'danger',
  completed: 'success',
  failed: 'danger',
  expired: 'secondary',
};

const getBookingStatusColor = (
  status: string | number
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
  if (typeof status === 'number') {
    // Align with reservation status color mapping
    switch (status) {
      case 0:
        return 'warning'; // pending
      case 1:
        return 'success'; // confirmed
      case 2:
        return 'default'; // admitted
      case 3:
        return 'danger'; // cancelled
      case 4:
        return 'success'; // completed
      case 5:
        return 'danger'; // failed
      case 6:
        return 'secondary'; // expired
      default:
        return 'default';
    }
  }
  if (typeof status === 'string') {
    const key = status.trim().toLowerCase();
    return bookingStatusColorMap[key] || 'default';
  }
  return 'default';
};

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
  'emailAddress',
  'minimumSpend',
  'bookingStatus',
  'bookingFee',
];
const columns7 = [
  { name: 'Customer name', uid: 'firstName' },
  { name: 'Customer Phone Number ', uid: 'phoneNumber' },
  { name: 'Customer Email Address', uid: 'emailAddress' },
    { name: 'Booking Fee', uid: 'bookingFee' },
  { name: 'Booking date', uid: 'bookingDateTime' },
    { name: 'Status', uid: 'bookingStatus' },
];

const columns8 = [
  { name: "RESERVATION NAME", uid: "reservationName" },
  { name: "Total Booking Amount", uid: "totalBookingFee" },
  { name: "Total Bookings", uid: "totalBookings" },
  { name: "Date Updated", uid: "dateUpdated" },
];

const columns9 = [
  { name: 'Customer name', uid: 'firstName' },
  { name: 'Customer Phone Number', uid: 'phoneNumber' },
  { name: 'Customer Email Address', uid: 'emailAddress' },
  { name: 'Total Booking Fee', uid: 'totalBookingFee' },
  { name: 'Total Bookings', uid: 'totalBookings' },
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
  { name: "RESERVATION NAME", uid: "reservationName" },
  { name: "Quantity", uid: "reservationCapacity" },
  { name: "Occupancy Rate", uid: "occupancyRate" },
  { name: "Total Bookings", uid: "totalBookings" },
  { name: "Average Daily Utilization", uid: "averageDailyUtilization" },
];

const ActivityTableBooking = ({
  reportName,
  data,
  isLoading,
  selectedValue,
  reportType,
  value,
  isLoadingExport,
  exportFile,
}: any) => {
  const business = getJsonItemFromLocalStorage('business');

  const columns = useMemo(() => {
    if (reportType === 7) {
      return {
        data: data?.bookings || [],
        column: columns7,
        visibleColumn: INITIAL_VISIBLE_COLUMNS7,
      };
    }

    if (reportType === 8) {
      return {
        data: data?.reservationBookings || [],
        column: columns8,
        visibleColumn: INITIAL_VISIBLE_COLUMNS8,
      };
    }
    if (reportType === 9) {
      return {
        data: data?.customerBookings || [],
        column: columns9,
        visibleColumn: INITIAL_VISIBLE_COLUMNS9,
      };
    }
    if (reportType === 10) {
      return {
        data: data?.dailyOccupancyUtilizations || [],
        column: columns10,
        visibleColumn: INITIAL_VISIBLE_COLUMNS10,
      };
    }
  }, [reportType, data]);

  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    selectedKeys,
    classNames,
    displayData,
    isMobile,
  } = usePagination(columns?.data, columns?.column, columns?.visibleColumn);

  const [showMore, setShowMore] = useState(false);
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const toggleDownloadReport = () => {
    setIsOpenDownload(!isOpenDownload);
  };
  const toggleMoreFilters = () => {
    setShowMore(!showMore);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'dateCreated',
    direction: 'ascending',
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    let filteredData = [...columns?.data];

    filteredData = filteredData.filter(
      (item) =>
        item?.firstName?.toLowerCase().includes(searchQuery) ||
        item?.lastName?.toLowerCase().includes(searchQuery) ||
        item?.minimumSpend?.toLowerCase().includes(searchQuery) ||
        item?.totalBookingFee?.toLowerCase().includes(searchQuery) ||
        item?.bookingFee?.toLowerCase().includes(searchQuery) ||
        item?.checkOutDateTime?.toLowerCase().includes(searchQuery) ||
        item?.endDate?.toLowerCase().includes(searchQuery) ||
        item?.startDate?.toLowerCase().includes(searchQuery) ||
        item?.checkInDateTime?.toLowerCase().includes(searchQuery) ||
        item?.bookingDateTime?.toLowerCase().includes(searchQuery) ||
        item?.dateUpdated?.toLowerCase().includes(searchQuery)
    );

    return filteredData;
  }, [columns?.data, searchQuery]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const pages = Math.ceil(filteredItems?.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems?.slice(start, end);
  }, [page, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      let cmp = 0;

      if (typeof first === 'string' && typeof second === 'string') {
        cmp = first.localeCompare(second);
      } else if (typeof first === 'number' && typeof second === 'number') {
        cmp = first - second;
      } else if (first instanceof Date && second instanceof Date) {
        cmp = first.getTime() - second.getTime();
      }

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((booking, columnKey) => {
    const cellValue = booking[columnKey];

    switch (columnKey) {
      case 'firstName':
        return (
          <div className='flex text-black font-medium items-center gap-2 text-sm cursor-pointer'>
            <span>
              {booking.firstName} {booking.lastName}
            </span>
          </div>
        );

      case 'minimumSpend':
        return (
          <div className='text-textGrey text-sm'>
            <p>{booking.minimumSpend}</p>
          </div>
        );
      case 'totalBookingFee':
        return (
          <div className='text-textGrey text-sm'>
            <p>{booking.totalBookingFee}</p>
          </div>
        );
      case 'bookingStatus':
        return (
          <Chip
            className='capitalize'
            color={getBookingStatusColor(booking.bookingStatus)}
            size='sm'
            variant='bordered'
          >
            {cellValue}
          </Chip>
        );

        

      case 'bookingFee':
        return (
          <div className='text-textGrey text-sm'>
            <p>{booking.bookingFee}</p>
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
      <div className='w-full mt-4 flex justify-between  gap-3'>
        <CustomInput
          classnames={'w-[242px]'}
          label=''
          size='md'
          value={searchQuery}
          onChange={handleSearchChange}
          isRequired={false}
          startContent={<IoSearchOutline />}
          type='text'
          placeholder='Search here...'
        />

        <div className='flex gap-3'>
          <div className='flex items-center'>
            {isLoadingExport && <SmallLoader />}
            <div
              onClick={() => toggleDownloadReport()}
              className='py-2 px-2 md:mb-0 text-sm hover:text-grey600 transition-all cursor-pointer text-black  mb-4 '
            >
              <div className='flex gap-2 items-center justify-center'>
                <MdOutlineFileDownload className='text-[22px]' />
                <p>Export</p>
              </div>
            </div>
          </div>
          {/* <CustomButton
            disableRipple={true}
            // onClick={() => exportFile(0)}
            onClick={() => toggleDownloadReport()}
            className='py-2 px-4 md:mb-0 text-black mb-4 '
            backgroundColor='bg-white'
          >
            <div className='flex gap-2 items-center justify-center'>
              <BsPrinter className='text-[22px]' />

              <p>Print</p>
            </div>
          </CustomButton> */}
        </div>
      </div>
      <section
        ref={reportRef}
        className='border border-primaryGrey rounded-md mt-2 p-3'
      >
        <div className=' flex flex-col items-center mb-4'>
          <p className='text-xl font-bold capitalize'>{reportName}</p>
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
          aria-label='list of bookings'
          bottomContent={
            isLoading || items?.length === 0 ? (
              ''
            ) : (
              <PaginationComponent
                data={items}
                page={page}
                setPage={setPage}
                pages={pages}
              />
            )
          }
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
          <TableHeader columns={columns?.column}>
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
            items={sortedItems || []}
            isLoading={isLoading}
            loadingContent={<SmallLoader />}
          >
            {(item: any, index: any) => (
              <TableRow key={`row-${index}`}>
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
                  onClick={() => {
                    exportFile(0);
                    toggleDownloadReport();
                  }}
                  className='flex justify-between items-center cursor-pointer px-3 py-4 hover:bg-primaryGrey rounded-md'
                >
                  <div className='flex gap-2'>
                    <Image src={PDF} alt='pdf icon' />
                    <p>Export as PDF</p>
                  </div>
                  <IoIosArrowForward className='text-grey600' />
                </div>
                <div
                  onClick={() => {
                    toggleDownloadReport();
                    exportFile(1);
                  }}
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
