'use client';
import useGetRoleByBusiness from '@/hooks/cachedEndpoints/useGetRoleBusiness';
import { SmallLoader, getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import {
  campaignOption,
  columns,
  menuOption,
  reservationsOption,
} from '../data';

const AssignPermission = ({ isOpen, onOpenChange }: any) => {
  const { data, isLoading: roleLoading } = useGetRoleByBusiness();

  const businessInformation = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const [isLoading, setIsLoading] = useState(false);
  const [menuRoleSetting, setMenuRoleSettings] = useState({
    userRole: {
      cooperateId: userInformation.cooperateID,
      businessId: businessInformation[0].businessId,
      canViewMenu: false,
      canCreateMenu: false,
      canEditMenu: false,
      canDeleteMenu: false,
      canViewCampaign: false,
      canCreateCampaign: false,
      canEditCampaign: false,
      canViewReservation: false,
      canCreateReservation: false,
      canEditReservation: false,
      canDeleteReservation: false,
      canCreateUser: false,
      canViewUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canCreateBusiness: false,
      canViewBusiness: false,
      canEditBusiness: false,
      canDeleteBusiness: false,
      canViewMessages: false,
    },
    managerRole: {
      cooperateId: userInformation.cooperateID,
      businessId: businessInformation[0].businessId,
      canViewMenu: true,
      canCreateMenu: true,
      canEditMenu: true,
      canDeleteMenu: true,
      canViewCampaign: true,
      canCreateCampaign: true,
      canEditCampaign: true,
      canViewReservation: true,
      canCreateReservation: true,
      canEditReservation: true,
      canDeleteReservation: true,
      canCreateUser: true,
      canViewUser: true,
      canEditUser: true,
      canDeleteUser: true,
      canCreateBusiness: true,
      canViewBusiness: true,
      canEditBusiness: true,
      canDeleteBusiness: true,
      canViewMessages: true,
    },
  });

  useEffect(() => {
    if (data) {
      setMenuRoleSettings({
        userRole: {
          ...menuRoleSetting.userRole,
          ...data.userRole,
        },
        managerRole: {
          ...menuRoleSetting.managerRole,
          ...data.managerRole,
        },
      });
    }
  }, [data]);

  const handleCheckboxChange = (role, key, value) => {
    setMenuRoleSettings((prevSettings) => ({
      ...prevSettings,
      [role]: {
        ...prevSettings[role],
        [key]: value,
      },
    }));
  };

  console.log(menuRoleSetting, 'data by business');
  const renderCell = useCallback((role, permission, columnKey) => {
    const cellValue = permission[columnKey];
    const isChecked = menuRoleSetting[role][cellValue];

    console.log(isChecked, 'isChecked');
    switch (columnKey) {
      case 'manager':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox
                size='sm'
                isSelected={isChecked}
                onChange={(e) =>
                  handleCheckboxChange(role, cellValue, e.target.checked)
                }
                className='rounded-md'
                color='primary'
              />
            </span>
          </div>
        );
      case 'staff':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox
                isSelected={isChecked}
                onChange={(e) =>
                  handleCheckboxChange(role, cellValue, e.target.checked)
                }
                size='sm'
                className='rounded-md'
                color='primary'
              />
            </span>
          </div>
        );
      case 'actions':
        return (
          <div className='w-[230px] flex items-center gap-2'>
            <span className='text-sm text-[#5F6D7E] cursor-pointer active:opacity-50'>
              {permission.actions}
            </span>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <Modal
      size='2xl'
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={() => onOpenChange()}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className='text-[24px] leading-3 mt-8 text-black font-semibold'>
                Permissions
              </h2>
              <p className='text-sm  text-grey600'>
                Assign the necessary permissions to access specific resources
              </p>
              {roleLoading ? (
                <div className='grid place-content-center'>
                  <SmallLoader />
                </div>
              ) : (
                <ScrollShadow className='w-full h-[400px]'>
                  <>
                    <span className='text-[#5F35D2] font-[700] -mb-3 px-3 text-[13px]'>
                      MENU
                    </span>
                    <div className='border border-primaryGrey flex flex-col gap-2 rounded-lg'>
                      <Table
                        radius='none'
                        shadow='none'
                        removeWrapper={true}
                        classNames={{
                          td: 'px-3 py-2 border-b border-b-primaryGrey',
                          table: 'p-0 border-none',
                        }}
                        aria-label='Menu table'
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === 'actions' ? 'start' : 'center'
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody
                          isLoading={isLoading}
                          loadingContent={<Spinner label='Loading...' />}
                          items={menuOption}
                        >
                          {(item) => (
                            <TableRow className='text-[#5F6D7E]' key={item.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item.role === 'manager'
                                      ? 'managerRole'
                                      : 'userRole',
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <span className='text-[#5F35D2] px-3 font-[700] text-[13px] '>
                        CAMPAIGNS
                      </span>
                      <Table
                        radius='none'
                        shadow='none'
                        removeWrapper={true}
                        classNames={{
                          td: 'px-3 py-2 border-y border-y-primaryGrey',
                          table: 'p-0 border-none',
                        }}
                        aria-label='Campaign table'
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === 'actions' ? 'start' : 'center'
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody
                          isLoading={isLoading}
                          loadingContent={<Spinner label='Loading...' />}
                          items={campaignOption}
                        >
                          {(item) => (
                            <TableRow className='text-[#5F6D7E]' key={item.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item.role === 'manager'
                                      ? 'managerRole'
                                      : 'userRole',
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <p className='text-[#5F35D2] px-3 font-[700] text-[13px] '>
                        RESERVATIONS
                      </p>
                      <Table
                        radius='none'
                        shadow='none'
                        removeWrapper={true}
                        classNames={{
                          td: 'px-3 py-2 border-y border-y-primaryGrey',
                          table: 'p-0 border-none',
                        }}
                        aria-label='Reservation table'
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === 'actions' ? 'start' : 'center'
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody
                          isLoading={isLoading}
                          loadingContent={<Spinner label='Loading...' />}
                          items={reservationsOption}
                        >
                          {(item) => (
                            <TableRow className='text-[#5F6D7E]' key={item.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item.role === 'manager'
                                      ? 'managerRole'
                                      : 'userRole',
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                </ScrollShadow>
              )}
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AssignPermission;
