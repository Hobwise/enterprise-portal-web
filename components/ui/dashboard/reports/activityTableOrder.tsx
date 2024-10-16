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

const INITIAL_VISIBLE_COLUMNS0 = [
  'name',
  'amount',
  'orderID',
  'placedByPhoneNumber',
  'orderStatus',
  'placedByName',
  'orderID',
];
const INITIAL_VISIBLE_COLUMNS1 = [
  'itemName',
  'menuName',
  'totalAmountSold',
  'totalQuantitySold',
  'dateCreated',
];
const INITIAL_VISIBLE_COLUMNS2 = [
  'lastOrderDateTime',
  'orderCount',
  'placedByName',
  'placedByPhoneNumber',
  'totalOrderValue',
];
const INITIAL_VISIBLE_COLUMNS3 = [
  'confirmedAmount',
  'dateUpdated',
  'emailAddress',
  'firstName',
  'numberOfOrders',
  'pendingAmount',
  'totalAmount',
];

const columns0 = [
  { name: 'ID', uid: 'menuID' },
  { name: 'Name', uid: 'name' },
  { name: 'Amount', uid: 'amount' },
  { name: 'Order ID', uid: 'orderID' },
  { name: 'Phone number', uid: 'placedByPhoneNumber' },
  { name: 'Payment', uid: 'payment' },
  { name: 'Status', uid: 'orderStatus' },
];
const columns1 = [
  { name: 'ID', uid: 'menuID' },
  { name: 'Item Name', uid: 'itemName' },
  { name: 'Menu Name', uid: 'menuName' },
  { name: 'Amount', uid: 'totalAmountSold' },
  { name: 'Quantity', uid: 'totalQuantitySold' },
  { name: 'Date Created', uid: 'dateCreated' },
];
const columns2 = [
  { name: 'Name', uid: 'placedByName' },
  { name: 'Phone Number', uid: 'placedByPhoneNumber' },
  { name: 'Order Count', uid: 'orderCount' },
  { name: 'Total Order Count', uid: 'totalOrderValue' },
  { name: 'Date Created/Updated', uid: 'lastOrderDateTime' },
];
const columns3 = [
  { name: 'Name', uid: 'firstName' },
  { name: 'Email Address', uid: 'emailAddress' },
  { name: 'Order Count', uid: 'numberOfOrder' },
  { name: 'Pending Payment', uid: 'pendingAmount' },
  { name: 'Confirmed Payment', uid: 'confirmedAmount' },
  { name: 'Total Payment', uid: 'totalAmount' },
  { name: 'Date Updated', uid: 'dateUpdated' },
];

const ActivityTableOrder = ({
  reportName,
  data,
  isLoading,
  selectedValue,
  reportType,
  value,
  exportFile,
  isLoadingExport,
}: any) => {
  const business = getJsonItemFromLocalStorage('business');
  const columns = () => {
    if (reportType === 0) {
      return {
        data: data?.orders || [],
        column: columns0,
        visibleColumn: INITIAL_VISIBLE_COLUMNS0,
      };
    }
    if (reportType === 1) {
      return {
        data: data?.items || [],
        column: columns1,
        visibleColumn: INITIAL_VISIBLE_COLUMNS1,
      };
    }
    if (reportType === 2) {
      return {
        data: data?.customers || [],
        column: columns2,
        visibleColumn: INITIAL_VISIBLE_COLUMNS2,
      };
    }
    if (reportType === 3) {
      return {
        data: data?.orders || [],
        column: columns3,
        visibleColumn: INITIAL_VISIBLE_COLUMNS3,
      };
    }
  };

  const {
    headerColumns,
    setSelectedKeys,
    selectedKeys,

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

  const statusColorMap: Record<
    string,
    'warning' | 'success' | 'danger' | 'secondary'
  > = {
    Open: 'warning',
    Closed: 'success',
    Cancelled: 'danger',
    AwaitingConfirmation: 'secondary',
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
    let filteredData = [...columns()?.data];

    filteredData = filteredData.filter(
      (item) =>
        item?.firstName?.toLowerCase().includes(searchQuery) ||
        item?.lastName?.toLowerCase().includes(searchQuery) ||
        item?.name?.toLowerCase().includes(searchQuery) ||
        item?.itemName?.toLowerCase().includes(searchQuery) ||
        item?.orderCount?.toLowerCase().includes(searchQuery) ||
        item?.lastOrderDateTime?.toLowerCase().includes(searchQuery) ||
        item?.totalOrderValue?.toLowerCase().includes(searchQuery) ||
        item?.menuName?.toLowerCase().includes(searchQuery) ||
        String(item?.totalQuantitySold)?.toLowerCase().includes(searchQuery) ||
        String(item?.numberOfOrders)?.toLowerCase().includes(searchQuery) ||
        item?.amount?.toLowerCase().includes(searchQuery) ||
        item?.dateCreated?.toLowerCase().includes(searchQuery) ||
        item?.totalAmountSold?.toLowerCase().includes(searchQuery) ||
        item?.pendingAmount?.toLowerCase().includes(searchQuery) ||
        item?.totalAmount?.toLowerCase().includes(searchQuery) ||
        item?.confirmedAmount?.toLowerCase().includes(searchQuery) ||
        item?.totalAmountSold?.toLowerCase().includes(searchQuery) ||
        item?.orderID?.toLowerCase().includes(searchQuery) ||
        item?.placedByPhoneNumber?.toLowerCase().includes(searchQuery) ||
        item?.placedByName?.toLowerCase().includes(searchQuery) ||
        item?.emailAddress?.toLowerCase().includes(searchQuery)
    );

    return filteredData;
  }, [columns()?.data, searchQuery]);
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
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>{order.placedByName}</span>
            {/* {order.comment && (
                  <div
                    title={'view comment'}
                    onClick={() => toggleCommentModal(order)}
                    className=' cursor-pointer'
                  >
                    <FaCommentDots className='text-primaryColor' />
                  </div>
                )} */}
          </div>
        );
      case 'firstName':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>
              {order.firstName} {order.lastName}
            </span>
            {/* {order.comment && (
                  <div
                    title={'view comment'}
                    onClick={() => toggleCommentModal(order)}
                    className=' cursor-pointer'
                  >
                    <FaCommentDots className='text-primaryColor' />
                  </div>
                )} */}
          </div>
        );
      case 'amount':
        return (
          <div className='text-textGrey text-sm'>
            <p>{order.totalAmount}</p>
          </div>
        );
      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'lastOrderDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.lastOrderDateTime).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'dateUpdated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.dateUpdated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'totalAmountSold':
        return (
          <div className='text-textGrey text-sm'>{order.totalAmountSold}</div>
        );
      case 'pendingAmount':
        return (
          <div className='text-textGrey text-sm'>{order.pendingAmount}</div>
        );
      case 'totalAmount':
        return <div className='text-textGrey text-sm'>{order.totalAmount}</div>;
      case 'confirmedAmount':
        return (
          <div className='text-textGrey text-sm'>{order.confirmedAmount}</div>
        );
      case 'orderID':
        return <div className='text-textGrey text-sm'>{order.reference}</div>;

      case 'orderStatus':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap[order.orderStatus]}
            size='sm'
            variant='bordered'
          >
            {cellValue}
          </Chip>
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
          aria-label='list of orders'
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

export default ActivityTableOrder;
