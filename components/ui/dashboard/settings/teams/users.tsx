import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { downloadCSV } from '@/lib/downloadToExcel';
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
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
import moment from 'moment';
import React from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { MdOutlineFileDownload } from 'react-icons/md';
import noImage from '../../../../../public/assets/images/no-image.svg';
import CreateTeam from './createTeam';
export const columns = [
  { name: 'ID', uid: 'id' },
  { name: 'Name', uid: 'firstName' },
  { name: 'Date added', uid: 'dateCreated' },
  { name: 'Role', uid: 'role' },
  { name: '', uid: 'actions' },
];
const INITIAL_VISIBLE_COLUMNS = ['firstName', 'dateCreated', 'role', 'actions'];

const Users = ({ data }: any) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { page, rowsPerPage } = useGlobalContext();
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,

    selectedKeys,
    sortDescriptor,
    setSortDescriptor,

    classNames,
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS);

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case 'firstName':
        return (
          <div className='flex '>
            <Avatar
              showFallback
              name={user?.firstName}
              src={
                user.image ? `data:image/jpeg;base64,${user?.image}` : noImage
              }
            />
            <div className='ml-3 gap-1 grid place-content-center'>
              <span className='font-semibold  text-sm'>
                {user?.firstName} {user?.lastName}
              </span>
              <span className='text-grey400 text-xs'>{user?.email}</span>
            </div>
          </div>
        );

      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(user?.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'role':
        return (
          <Chip
            className='capitalize'
            color={'secondary'}
            size='sm'
            variant='flat'
          >
            {user?.role === 0 ? 'Manager' : 'User'}
          </Chip>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2'>
            <Dropdown aria-label='drop down' className=''>
              <DropdownTrigger aria-label='actions'>
                <span className='text-lg border rounded-md p-1 border-primaryGrey text-default-400 cursor-pointer active:opacity-50'>
                  <HiOutlineDotsVertical />
                </span>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                {/* <DropdownItem aria-label='view'>
                  <div className={` flex gap-2  items-center text-grey500`}>
                    <GrFormView className='text-[20px]' />
                    <p>View more</p>
                  </div>
                </DropdownItem> */}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  return (
    <section>
      <div className='flex justify-between'>
        <div className='w-[220px]'>
          <h1 className='text-[16px] leading-8 font-semibold'>Team members</h1>
          <p className='text-sm  text-grey600 md:mb-10 mb-4'>
            Invite your colleagues to work faster and collaborate together
          </p>
        </div>
        <div className=' flex gap-3 pt-5'>
          <Button
            onClick={() => downloadCSV(data)}
            className='flex text-grey600 border border-primaryGrey bg-white'
          >
            <MdOutlineFileDownload className='text-[22px]' />
            <p>Export csv</p>
          </Button>
          <Button
            onPress={onOpen}
            className='text-white bg-primaryColor rounded-lg'
          >
            Invite new member
          </Button>
        </div>
      </div>

      <Table
        radius='lg'
        isCompact
        removeWrapper
        allowsSorting
        aria-label='list of reservations'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={{
          td: 'h-[70px]',
        }}
        // classNames={classNames}
        selectedKeys={selectedKeys}
        // selectionMode='multiple'
        sortDescriptor={sortDescriptor}
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
        <TableBody emptyContent={'No reservation found'} items={data}>
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CreateTeam isOpen={isOpen} onOpenChange={onOpenChange} />
    </section>
  );
};

export default Users;
