'use client';

import React, { useEffect } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { formatPrice } from '@/lib/utils';
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
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import noImage from '../../../../public/assets/images/no-image.svg';
import { columns } from './data';
// import DeleteQRModal from './deleteModal';
// import EditQrModal from './editQrModal';
// import ViewQrModal from './viewQrModal';

const INITIAL_VISIBLE_COLUMNS = [
  'reservationName',
  'reservationDescription',
  'reservationFee',
  'quantity',
  'minimumSpend',
  'actions',
];

const ReservationList = ({ reservation, searchQuery, data }: any) => {
  const router = useRouter();

  const [singleOrder, setSingleOrder] = React.useState('');

  const [isOpenDelete, setIsOpenDelete] = React.useState<Boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = React.useState<Boolean>(false);
  const [isOpenView, setIsOpenView] = React.useState<Boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] =
    React.useState<Boolean>(false);
  const [filteredReservation, setFilteredReservation] = React.useState(
    data?.reservations
  );

  const toggleReservationModalModal = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleReservationModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };
  const toggleReservationModalView = () => {
    setIsOpenView(!isOpenView);
  };

  useEffect(() => {
    if (reservation && searchQuery) {
      const filteredData = reservation
        ?.filter(
          (item) =>
            item?.reservationName?.toLowerCase().includes(searchQuery) ||
            String(item?.reservationFee)?.toLowerCase().includes(searchQuery) ||
            String(item?.minimumSpend)?.toLowerCase().includes(searchQuery) ||
            String(item?.quantity)?.toLowerCase().includes(searchQuery) ||
            item?.reservationDescription?.toLowerCase().includes(searchQuery)
        )
        .filter((item) => Object.keys(item).length > 0);
      setFilteredReservation(filteredData.length > 0 ? filteredData : []);
    } else {
      setFilteredReservation(reservation);
    }
  }, [searchQuery, reservation]);

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

  const toggleCancelModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenCancelOrder(!isOpenCancelOrder);
  };
  const toggleConfirmModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenConfirmOrder(!isOpenConfirmOrder);
  };

  const renderCell = React.useCallback((reservation, columnKey) => {
    const cellValue = reservation[columnKey];

    switch (columnKey) {
      case 'reservationName':
        return (
          //   <div className='flex text-textGrey text-sm'>{reservation.name}</div>
          <div className='flex '>
            <Image
              className='h-[60px] w-[60px] bg-cover rounded-lg'
              width={60}
              height={60}
              alt='menu'
              unoptimized
              aria-label='menu'
              src={
                reservation.image
                  ? `data:image/jpeg;base64,${reservation.image}`
                  : noImage
              }
            />

            <div className='ml-5 gap-1 grid place-content-center'>
              <p className='font-bold text-sm mb-1'>
                {reservation.reservationName}
              </p>

              <div>
                <p className=' text-sm'>Reservation Fee</p>
                <p className='font-bold text-sm'>
                  {formatPrice(reservation.reservationFee)}
                </p>
              </div>

              {/* {reservation.minimumSpend > 0 && (
                <div>
                  <p className='text-sm'>Minimum Spend</p>
                  <p className='font-bold text-sm'>
                    {formatPrice(reservation.minimumSpend)}
                  </p>
                </div>
              )} */}
            </div>
          </div>
        );

      case 'quantity':
        return (
          <div className='text-textGrey text-sm'>{reservation.quantity}</div>
        );
      case 'reservationDescription':
        return (
          <div className='text-textGrey text-sm'>
            {reservation.reservationDescription}
          </div>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2'>
            <Dropdown aria-label='drop down' className=''>
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                <DropdownItem aria-label='view'>
                  <Link
                    className='flex w-full'
                    href={{
                      pathname: `/dashboard/reservation/${reservation.reservationName}`,
                      query: {
                        reservationId: reservation.id,
                      },
                    }}
                  >
                    View reservation
                  </Link>
                </DropdownItem>

                {/* <DropdownItem
                  onClick={() => {
                    toggleReservationModalModal();
                    saveJsonItemToLocalStorage('reservation', reservation);
                  }}
                  aria-label='delete reservation'
                >
                  <div className={` text-danger-500 flex  items-center gap-3 `}>
                    <RiDeleteBin6Line />

                    <p>Delete Reservation</p>
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
    <section className='border border-primaryGrey rounded-lg'>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        allowsSorting
        aria-label='list of reservations'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={classNames}
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
        <TableBody
          emptyContent={'No reservation found'}
          items={filteredReservation}
        >
          {(item) => (
            <TableRow key={item?.name}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* <DeleteQRModal
        isOpenDelete={isOpenDelete}
        setIsOpenDelete={setIsOpenDelete}
        toggleQRmodalModal={toggleQRmodalModal}
      />
      <EditQrModal
        isOpenEdit={isOpenEdit}
        setIsOpenEdit={setIsOpenEdit}
        toggleQRmodalEdit={toggleQRmodalEdit}
      />
      <ViewQrModal
        isOpenView={isOpenView}
        setIsOpenView={setIsOpenView}
        toggleQRmodalView={toggleQRmodalView}
      /> */}
    </section>
  );
};

export default ReservationList;
