'use client';

import { CustomButton } from '@/components/customButton';
import AssignPermission from '@/components/ui/dashboard/settings/rolesAndPrivileges/assignPermission';
import useRoleCount from '@/hooks/cachedEndpoints/useRoleCount';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { SmallLoader, getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { TbEdit } from 'react-icons/tb';

const RolesPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data, isLoading } = useRoleCount();
  const { userRolePermissions, role, isLoading: isPermissionsLoading } = usePermission();
  const router = useRouter();
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
          <div className="inline-flex p-0.5 gap-2 border border-primaryGrey rounded-md ">
            {/* <Dropdown aria-label='drop down'> */}
            {/* <DropdownTrigger aria-label='actions'> */}
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <HiOutlineDotsVertical />
            </span>
            {/* </DropdownTrigger> */}
            {/* <DropdownMenu className='text-black inline-flex'>
                <DropdownItem aria-label='View role'>
                  <div className={` flex gap-2  items-center text-grey500`}>
                    <GrFormView className='text-[20px]' />
                    <p>View </p>
                  </div>
                </DropdownItem>
              </DropdownMenu> */}
            {/* </Dropdown> */}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  // Check permissions before rendering
  useEffect(() => {
    if (!isPermissionsLoading && role !== 0 && !userRolePermissions?.canViewUser) {
      router.push('/dashboard/unauthorized');
    }
  }, [isPermissionsLoading, role, userRolePermissions, router]);

  // Check if user has permission to view users/staff
  if (role !== 0 && !userRolePermissions?.canViewUser) {
    return null; // Will redirect via useEffect
  }

  return (
    <section>
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">Roles</h1>
          <p className="text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4">
            Update your roles and permission.
          </p>
        </div>
        {userInformation.role === 0 && (
          <CustomButton
            onClick={onOpen}
            className="py-2 px-4 md:mb-0 mb-4 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-1 items-center justify-center">
              <span>
                <TbEdit className="text-[18px]" />
              </span>
              <span> Update permission</span>
            </div>
          </CustomButton>
        )}
      </div>

      {isLoading && !data ? (
        <div className="grid mt-3 place-content-center">
          <SmallLoader />
        </div>
      ) : (
        <div className="border border-primaryGrey flex flex-col gap-2 rounded-lg">
          <Table removeWrapper={true} shadow="none" aria-label="Roles table">
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
              items={data || []}
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
        </div>
      )}
      <AssignPermission isOpen={isOpen} onOpenChange={onOpenChange} />
    </section>
  );
};

export default RolesPage;
