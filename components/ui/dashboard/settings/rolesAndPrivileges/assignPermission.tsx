'use client';
import { getRoleByBusiness } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
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
import { useCallback, useState } from 'react';
import {
  campaignOption,
  columns,
  menuOption,
  reservationsOption,
} from '../data';

const AssignPermission = ({ isOpen, onOpenChange }: any) => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isLoading, setIsLoading] = useState(false);
  const [menuRoleSetting, setMenuRoleSettings] = useState({
    manager: false,
    staff: false,
  });
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
  const handleManagerChangeMenu = (label, e) => {
    setMenuRoleSettings((prevSettings) => ({
      ...prevSettings,
      manager: e.target.checked,
    }));
    console.log(
      `Manager ${e.target.checked ? 'enabled' : 'disabled'} for: ${label}`
    );
  };
  const handleStaffChangeMenu = (label, e) => {
    setMenuRoleSettings((prevSettings) => ({
      ...prevSettings,
      staff: e.target.checked,
    }));
    console.log(
      `Staff ${e.target.checked ? 'enabled' : 'disabled'} for: ${label}`
    );
  };
  const renderCellMenu = useCallback((permission, columnKey) => {
    const cellValue = permission[columnKey];
    switch (columnKey) {
      case 'manager':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox
                size='sm'
                isSelected={menuRoleSetting.manager}
                onChange={(e) => handleManagerChangeMenu(cellValue, e)}
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
                isSelected={menuRoleSetting.staff}
                onChange={(e) => handleStaffChangeMenu(cellValue, e)}
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
  const renderCellCampaigns = useCallback((permission, columnKey) => {
    const cellValue = permission[columnKey];
    switch (columnKey) {
      case 'manager':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox size='sm' className='rounded-md' color='primary' />
            </span>
          </div>
        );
      case 'staff':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox size='sm' className='rounded-md' color='primary' />
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
  const renderCellReservations = useCallback((permission, columnKey) => {
    const cellValue = permission[columnKey];
    switch (columnKey) {
      case 'manager':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <Checkbox size='sm' className='rounded-md' color='primary' />
            </span>
          </div>
        );
      case 'staff':
        return (
          <div className='grid place-content-center gap-2'>
            <span className='text-lg text-default-400  cursor-pointer active:opacity-50'>
              <Checkbox size='sm' className='rounded-md' color='primary' />
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
                                {renderCellMenu(item, columnKey)}
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
                                {renderCellCampaigns(item, columnKey)}
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
                                {renderCellReservations(item, columnKey)}
                              </TableCell>
                            )}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              </ScrollShadow>
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AssignPermission;
