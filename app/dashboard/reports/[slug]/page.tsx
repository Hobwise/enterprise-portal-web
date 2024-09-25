'use client';
import { CustomButton } from '@/components/customButton';
import ActivityTable from '@/components/ui/dashboard/reports/activityTable';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { BsPrinter } from 'react-icons/bs';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';
import { MdKeyboardArrowDown, MdOutlineFileDownload } from 'react-icons/md';
import CSV from '../../../../public/assets/icons/csv-icon.png';
import PDF from '../../../../public/assets/icons/pdf-icon.png';

const Activity = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const toggleDownloadReport = () => {
    setIsOpenDownload(!isOpenDownload);
  };
  const [value, setValue] = useState({
    start: null,
    end: null,
  });
  const [selectedKeys, setSelectedKeys] = useState(new Set(['Last 7 days']));
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
                  <DropdownItem key='Last 7 days'>Last 7 days</DropdownItem>
                  <DropdownItem key='Last 30 days'>Last 30 days</DropdownItem>
                  <DropdownItem key='This month'>This month</DropdownItem>
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
          {showMore && (
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
                    <DropdownItem key='Last 7 days'>Last 7 days</DropdownItem>
                    <DropdownItem key='Last 30 days'>Last 30 days</DropdownItem>
                    <DropdownItem key='This month'>This month</DropdownItem>
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
          )}
        </div>
        <div className='flex flex-col mt-10 text-primaryColor cursor-pointer'>
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
        </div>
      </div>

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
      </div>
      <ActivityTable />

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
      </Modal>
    </main>
  );
};

export default Activity;
