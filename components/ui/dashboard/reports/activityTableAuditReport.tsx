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

const INITIAL_VISIBLE_COLUMNS = [
  'userName',
  'emailAddress',
  'activity',
  'ipAddress',

  'isSuccessful',
  'dateCreated',
];

const column = [
  { name: 'Username', uid: 'userName', sortable: true },
  { name: 'Email Address', uid: 'emailAddress', sortable: true },
  { name: 'IP Address', uid: 'ipAddress', sortable: true },

  { name: 'Activity', uid: 'activity', sortable: true },
  { name: 'Date', uid: 'dateCreated', sortable: true },
  { name: 'Status', uid: 'isSuccessful', sortable: true },
];

const ActivityTableAudit = ({
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
    if (reportType === 11) {
      return {
        data: data?.auditLogs || [],
        column: column,
        visibleColumn: INITIAL_VISIBLE_COLUMNS,
      };
    }
  }, [reportType, data]);

  const [showMore, setShowMore] = useState(false);
  const [isOpenDownload, setIsOpenDownload] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'dateCreated',
    direction: 'ascending',
  });

  const toggleDownloadReport = () => {
    setIsOpenDownload(!isOpenDownload);
  };
  const toggleMoreFilters = () => {
    setShowMore(!showMore);
  };

  const renderCell = useCallback((audit, columnKey) => {
    const cellValue = audit[columnKey];

    switch (columnKey) {
      case 'firstName':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>
              {audit.firstName} {audit.lastName}
            </span>
          </div>
        );
      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(audit.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'isSuccessful':
        return (
          <Chip
            className='capitalize'
            color={audit.isSuccessful ? 'success' : 'danger'}
            size='sm'
            variant='bordered'
          >
            {audit.isSuccessful ? 'Successful' : 'Failed'}
          </Chip>
        );

      default:
        return cellValue;
    }
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    let filteredData = [...columns?.data];

    filteredData = filteredData.filter(
      (item) =>
        item.activity.toLowerCase().includes(searchQuery) ||
        item.emailAddress.toLowerCase().includes(searchQuery) ||
        item.ipAddress.toLowerCase().includes(searchQuery) ||
        item.userName.toLowerCase().includes(searchQuery) ||
        item.dateCreated.toLowerCase().includes(searchQuery)
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

  const reportRef = useRef(null);

  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    selectedKeys,

    classNames,
  } = usePagination(filteredItems, columns?.column, columns?.visibleColumn);

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
          aria-label='list of audit reports'
          bottomContent={
            isLoading ? (
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
          sortDescriptor={sortDescriptor}
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

export default ActivityTableAudit;
