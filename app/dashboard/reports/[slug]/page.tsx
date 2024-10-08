'use client';
import Error from '@/components/error';
import ActivityTable from '@/components/ui/dashboard/reports/activityTable';
import ActivityTableAudit from '@/components/ui/dashboard/reports/activityTableAuditReport';
import ActivityTableBooking from '@/components/ui/dashboard/reports/activityTableBooking';
import ActivityTablePayment from '@/components/ui/dashboard/reports/activityTablePayment';
import useReportFilter from '@/hooks/cachedEndpoints/useReportFilter';
import {
  formatDateTimeForPayload2,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import { getLocalTimeZone, today } from '@internationalized/date';
import {
  Button,
  DateRangePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Activity = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const reportFilter = getJsonItemFromLocalStorage('reportFilter');
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const router = useRouter();
  // const toggleDownloadReport = () => {
  //   setIsOpenDownload(!isOpenDownload);
  // };
  const [value, setValue] = useState({
    start: null,
    end: null,
  });
  const [selectedKeys, setSelectedKeys] = useState(new Set(['Today']));
  const [previousSelectedValue, setPreviousSelectedValue] = useState('Today');
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );
  const [selectedKeysDynamic, setSelectedKeysDynamic] = useState(
    new Set(['All'])
  );
  const selectedValueDynamic = useMemo(
    () => Array.from(selectedKeysDynamic).join(', ').replaceAll('_', ' '),
    [selectedKeysDynamic]
  );
  const [showMore, setShowMore] = useState(false);
  const toggleMoreFilters = () => {
    setShowMore(!showMore);
  };
  const status = ['All', 'upcoming'];
  const channel = ['All'];

  const logIndexForSelectedKey = (key: string) => {
    switch (key) {
      case 'Today':
        return 0;
      case 'This week':
        return 1;
      case 'This year':
        return 2;
      case 'Custom date':
        return 3;
      default:
        console.log('Unknown key');
        return -1;
    }
  };

  const checkValue = () => {
    return value.start !== null && value.end !== null;
  };

  const shouldFetchReport =
    selectedValue !== 'Custom date' ||
    (selectedValue === 'Custom date' && checkValue());

  const effectiveSelectedValue = shouldFetchReport
    ? selectedValue
    : previousSelectedValue;

  const startDate = value.start
    ? `${formatDateTimeForPayload2(value.start)}Z`
    : undefined;
  const endDate = value.end
    ? `${formatDateTimeForPayload2(value.end)}Z`
    : undefined;
  const { data, isError, refetch, isLoading } = useReportFilter(
    logIndexForSelectedKey(effectiveSelectedValue),
    startDate,
    endDate,
    reportFilter?.reportType,
    userInformation?.email,
    reportFilter?.reportName,
    { enabled: true }
  );
  console.log(data, 'dataaaaaaaaaaaaa');
  useEffect(() => {
    if (shouldFetchReport && selectedValue !== 'Custom date') {
      setPreviousSelectedValue(selectedValue);
    }
  }, [shouldFetchReport, selectedValue]);

  const handleDateChange = (newValue: any) => {
    setValue(newValue);
    if (newValue.start && newValue.end) {
      onClose();
    }
  };

  if (isError) {
    return <Error onClick={() => refetch()} />;
  }

  return (
    <main>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            <span>Reports</span>
          </div>
          <div className='flex gap-2 flex-wrap'>
            <div className='flex gap-2 items-center'>
              <p className='text-sm  text-grey600  '>A summary of activities</p>
              <Dropdown isDisabled={isLoading}>
                <DropdownTrigger>
                  <Button
                    endContent={<MdKeyboardArrowDown />}
                    disableRipple
                    className='font-[600] bg-background/30 p-0 capitalize text-black'
                  >
                    {selectedValue}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label='Single selection example'
                  variant='flat'
                  disallowEmptySelection
                  selectionMode='single'
                  className='text-black'
                  selectedKeys={selectedKeys}
                  onSelectionChange={setSelectedKeys}
                >
                  <DropdownItem key='Today'>Today</DropdownItem>
                  <DropdownItem key='This week'>This week</DropdownItem>
                  <DropdownItem key='This year'>This year</DropdownItem>

                  <DropdownItem onClick={() => onOpen()} key='Custom date'>
                    Custom date
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            {/* <div className='flex gap-2 items-center'>
              <p className='text-sm  text-grey600  '>Status</p>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    endContent={<MdKeyboardArrowDown />}
                    disableRipple
                    className='font-[600] bg-background/30 p-0 capitalize text-black'
                  >
                    {selectedValueDynamic}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label='Single selection example'
                  variant='flat'
                  disallowEmptySelection
                  selectionMode='single'
                  className='text-black'
                  selectedKeys={selectedKeysDynamic}
                  onSelectionChange={setSelectedKeysDynamic}
                >
                  {status.map((item) => (
                    <DropdownItem key={item}>{item}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div> */}
            {/* <div className='flex gap-2 items-center'>
              <p className='text-sm  text-grey600  '>Channel</p>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    endContent={<MdKeyboardArrowDown />}
                    disableRipple
                    className='font-[600] bg-background/30 p-0 capitalize text-black'
                  >
                    {selectedValueDynamic}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label='Single selection example'
                  variant='flat'
                  disallowEmptySelection
                  selectionMode='single'
                  className='text-black'
                  selectedKeys={selectedKeysDynamic}
                  onSelectionChange={setSelectedKeysDynamic}
                >
                  {channel.map((item) => (
                    <DropdownItem key={item}>{item}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div> */}
          </div>
          {/* {showMore && (
            <div className='flex gap-2 flex-wrap'>
              <div className='flex gap-2 items-center'>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      endContent={<MdKeyboardArrowDown />}
                      disableRipple
                      className='font-[600] bg-background/30 p-0 capitalize text-black'
                    >
                      {selectedValue}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label='Single selection example'
                    variant='flat'
                    disallowEmptySelection
                    selectionMode='single'
                    className='text-black'
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                  >
                    <DropdownItem key='Today'>Today</DropdownItem>
                    <DropdownItem key='This week'>This week</DropdownItem>
                    <DropdownItem key='This year'>This year</DropdownItem>

                    <DropdownItem onClick={() => onOpen()} key='Custom date'>
                      Custom date
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className='flex gap-2 items-center'>
                <p className='text-sm  text-grey600  '>Status</p>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      endContent={<MdKeyboardArrowDown />}
                      disableRipple
                      className='font-[600] bg-background/30 p-0 capitalize text-black'
                    >
                      {selectedValueDynamic}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label='Single selection example'
                    variant='flat'
                    disallowEmptySelection
                    selectionMode='single'
                    className='text-black'
                    selectedKeys={selectedKeysDynamic}
                    onSelectionChange={setSelectedKeysDynamic}
                  >
                    {status.map((item) => (
                      <DropdownItem key={item}>{item}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className='flex gap-2 items-center'>
                <p className='text-sm  text-grey600  '>Channel</p>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      endContent={<MdKeyboardArrowDown />}
                      disableRipple
                      className='font-[600] bg-background/30 p-0 capitalize text-black'
                    >
                      {selectedValueDynamic}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label='Single selection example'
                    variant='flat'
                    disallowEmptySelection
                    selectionMode='single'
                    className='text-black'
                    selectedKeys={selectedKeysDynamic}
                    onSelectionChange={setSelectedKeysDynamic}
                  >
                    {channel.map((item) => (
                      <DropdownItem key={item}>{item}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          )} */}
        </div>
        <Button
          onClick={() => router.back()}
          className='flex text-grey600 bg-white'
        >
          <IoIosArrowRoundBack className='text-[22px]' />

          <p>Go back</p>
        </Button>
        {/* <div className='flex flex-col mt-10 text-primaryColor cursor-pointer'>
          {showMore ? (
            <div
              onClick={() => toggleMoreFilters()}
              className='flex gap-1 items-center'
            >
              <FaMinus />
              <p className='text-sm'>Show less filters</p>
            </div>
          ) : (
            <div
              className='flex gap-1 items-center'
              onClick={() => toggleMoreFilters()}
            >
              <FaPlus />
              <p className='text-sm'>Show more filters</p>
            </div>
          )}
        </div> */}
      </div>
      {/* 
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
          //   onClick={toggleMultipleMenu}
          className='py-2 px-4 md:mb-0 text-black mb-4 '
          backgroundColor='bg-white'
        >
          <div className='flex gap-2 items-center justify-center'>
            <BsPrinter className='text-[22px]' />

            <p>Print</p>
          </div>
        </CustomButton>
      </div> */}
      {reportFilter?.reportName === 'orders' && (
        <ActivityTable
          data={data}
          reportName={reportFilter?.reportName}
          isLoading={isLoading}
          reportType={reportFilter?.reportType}
          selectedValue={selectedValue}
          value={value}
        />
      )}
      {reportFilter?.reportName === 'booking' && (
        <ActivityTableBooking
          reportName={reportFilter?.reportName}
          data={data}
          reportType={reportFilter?.reportType}
          isLoading={isLoading}
          selectedValue={selectedValue}
          value={value}
        />
      )}
      {reportFilter?.reportName === 'payment' && (
        <ActivityTablePayment
          reportName={reportFilter?.reportName}
          data={data}
          reportType={reportFilter?.reportType}
          isLoading={isLoading}
          selectedValue={selectedValue}
          value={value}
        />
      )}
      {reportFilter?.reportName === 'audit-logs' && (
        <ActivityTableAudit
          reportName={reportFilter?.reportName}
          data={data}
          reportType={reportFilter?.reportType}
          isLoading={isLoading}
          selectedValue={selectedValue}
          value={value}
        />
      )}

      <Modal
        isDismissable={false}
        classNames={{
          base: 'absolute top-12',
        }}
        size='sm'
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className='px-4 py-6'>
                <DateRangePicker
                  radius='sm'
                  maxValue={today(getLocalTimeZone())}
                  value={value}
                  onChange={handleDateChange}
                  visibleMonths={2}
                  variant='faded'
                  pageBehavior='single'
                  label='Select date range'
                  showMonthAndYearPickers
                  labelPlacement='outside'
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* <Modal
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
                <div className='flex justify-between items-center cursor-pointer px-3 py-4 hover:bg-primaryGrey rounded-md'>
                  <div className='flex gap-2'>
                    <Image src={PDF} alt='pdf icon' />
                    <p>Export as PDF</p>
                  </div>
                  <IoIosArrowForward className='text-grey600' />
                </div>
                <div className='flex justify-between items-center cursor-pointer px-3 py-4 hover:bg-primaryGrey rounded-md'>
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
      </Modal> */}
    </main>
  );
};

export default Activity;
