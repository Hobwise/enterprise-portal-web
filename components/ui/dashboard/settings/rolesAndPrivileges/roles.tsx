'use client';

import { CustomButton } from '@/components/customButton';
import useRoleCount from '@/hooks/cachedEndpoints/useRoleCount';
import { SmallLoader, getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react';
import { useCallback } from 'react';
import { GrFormView } from 'react-icons/gr';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { TbEdit } from 'react-icons/tb';
import AssignPermission from './assignPermission';

const Roles = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data, isLoading } = useRoleCount();
  const userInformation = getJsonItemFromLocalStorage('userInformation') || [];

  const columns = [
    { name: 'Role', uid: 'role' },
    { name: 'Members', uid: 'count' },
    { name: '', uid: 'actions' },
  ];
  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case 'actions':
        return (
          <div className='inline-flex p-0.5 gap-2 border border-primaryGrey rounded-md '>
            <Dropdown aria-label='drop down'>
              <DropdownTrigger aria-label='actions'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                  <HiOutlineDotsVertical />
                </span>
              </DropdownTrigger>
              <DropdownMenu className='text-black inline-flex'>
                <DropdownItem aria-label='View role'>
                  <div className={` flex gap-2  items-center text-grey500`}>
                    <GrFormView className='text-[20px]' />
                    <p>View </p>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {/* <Tooltip className='text-black text-xs' content='View'>
              <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                <HiOutlineDotsVertical />
              </span>
            </Tooltip> */}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  return (
    <section>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start'>
        <div>
          <h1 className='text-[16px] leading-8 font-semibold'>Roles</h1>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Update your roles and permission.
          </p>
        </div>
        {userInformation.role === 0 && (
          <CustomButton
            onClick={onOpen}
            className='py-2 px-4 md:mb-0 mb-4 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-1 items-center justify-center'>
              <span>
                <TbEdit className='text-[18px]' />
              </span>
              <span> Update permission</span>
            </div>
          </CustomButton>
        )}
      </div>

      {isLoading && !data ? (
        <div className='grid mt-3 place-content-center'>
          <SmallLoader />
        </div>
      ) : (
        <Table aria-label='Roles table'>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                align={column.uid === 'actions' ? 'center' : 'start'}
                key={column.uid}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            loadingContent={<SmallLoader />}
            emptyContent={'No data to display.'}
            items={data}
          >
            {(item) => (
              <TableRow key={item?.role}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <AssignPermission isOpen={isOpen} onOpenChange={onOpenChange} />
    </section>
  );
};

export default Roles;
