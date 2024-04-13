'use client';

import { getRoleByBusiness } from '@/app/api/controllers/dashboard/settings';
import { CustomButton } from '@/components/customButton';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Tooltip,
  User,
  Spinner,
  Checkbox,
} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

const RolePrivileges = () => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    { name: 'Actions', uid: 'actions' },
    { name: 'Manager', uid: 'manager' },
    { name: 'Staff', uid: 'staff' },
  ];

  const users = [
    {
      id: 1,

      actions: 'Can view menu',
    },
    {
      id: 2,

      actions: 'Can create menu',
    },
    {
      id: 3,

      actions: 'Can edit menu',
    },
    {
      id: 4,

      actions: 'Can delete menu',
    },
  ];

  const getRoles = async () => {
    setIsLoading(true);

    const data = await getRoleByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);
    console.log(data?.data, 'data');

    if (data?.data?.isSuccessful) {
    } else if (data?.data?.error) {
      //   notify({
      //     title: 'Error!',
      //     text: data?.data?.error,
      //     type: 'error',
      //   });
    }
  };

  useEffect(() => {
    getRoles();
  }, []);
  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case 'manager':
        return (
          <div className='relative flex items-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox size='md' className='rounded-md' color='primary' />
            </span>
          </div>
        );
      case 'staff':
        return (
          <div className='relative flex items-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox size='md' className='rounded-md' color='primary' />
            </span>
          </div>
        );
      case 'menu':
        return (
          <div className='relative flex items-center gap-2'>
            <span className='text-lg text-[#5F6D7E] cursor-pointer active:opacity-50'>
              {cellValue.menu}
            </span>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const openAddRoleModal = async () => {};
  return (
    <div>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start'>
        <div>
          <h1 className='text-[16px] leading-8 font-semibold'>Team Members</h1>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Invite your colleagues to work faster and collaborate together.
          </p>
        </div>
        {/* <CustomButton
          onClick={openAddRoleModal}
          className='py-2 px-4 md:mb-0 mb-4 text-white'
          backgroundColor='bg-primaryColor'
        >
          Add role
        </CustomButton> */}
      </div>
      <p className='text-[#5F35D2] font-[700] text-[13px] pb-1'>MENU</p>
      <Table classNames={{}} aria-label='Example table with custom cells'>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'start' : 'center'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label='Loading...' />}
          items={users}
        >
          {(item) => (
            <TableRow className='text-[#5F6D7E]' key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RolePrivileges;
