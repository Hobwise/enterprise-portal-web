'use client';

import React, { useState, useMemo } from 'react';
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
  SortDescriptor,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { BsCalendar2Check } from 'react-icons/bs';
import { FaRegEdit } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { TbFileInvoice } from 'react-icons/tb';
import { LiaTimesSolid } from 'react-icons/lia';
import { FaCommentDots } from 'react-icons/fa6';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { formatPrice, getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import moment from 'moment';
import CustomPagination from './CustomPagination';
import CancelOrderModal from './cancelOrder';
import Comment from './comment';
import ConfirmOrderModal from './confirmOrder';
import InvoiceModal from './invoice';
import UpdateOrderModal from './UpdateOrderModal';
import {
  availableOptions,
  columns,
  statusColorMap,
  statusDataMap,
} from './data';
import Filters from './filters';

// Type definitions
interface OrderItem {
  id: string;
  placedByName: string;
  placedByPhoneNumber: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  qrReference: string;
  paymentMethod: number;
  paymentReference: string;
  status: 0 | 1 | 2 | 3;
  dateCreated: string;
  comment?: string;
}

interface OrderCategory {
  name: string;
  totalCount: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface NewOrdersListProps {
  orders: OrderItem[];
  categories: OrderCategory[];
  selectedCategory: string;
  pagination: PaginationState;
  onCategoryChange: (category: string) => void;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  filterType?: number;
  startDate?: string;
  endDate?: string;
}

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "amount",
  "qrReference",
  "orderID",
  "status",
  "actions",
];

const NewOrdersList: React.FC<NewOrdersListProps> = ({
  orders,
  categories,
  selectedCategory,
  pagination,
  onCategoryChange,
  onPageChange,
  onNextPage,
  onPreviousPage,
  searchQuery,
  refetch,
  isLoading = false,
}) => {
  const router = useRouter();
  const { userRolePermissions, role } = usePermission();
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  // Modal states
  const [singleOrder, setSingleOrder] = useState<OrderItem | null>(null);
  const [isOpenInvoice, setIsOpenInvoice] = useState<boolean>(false);
  const [isOpenCancelOrder, setIsOpenCancelOrder] = useState<boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] = useState<boolean>(false);
  const [isOpenComment, setIsOpenComment] = useState<boolean>(false);
  const [isOpenUpdateOrder, setIsOpenUpdateOrder] = useState<boolean>(false);

  // Table state
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "dateCreated",
    direction: "descending",
  });

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;

    return orders.filter((order) =>
      order.placedByName.toLowerCase().includes(searchQuery) ||
      order.reference.toLowerCase().includes(searchQuery) ||
      order.qrReference.toLowerCase().includes(searchQuery) ||
      order.placedByPhoneNumber.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a: OrderItem, b: OrderItem) => {
      const first = a[sortDescriptor.column as keyof OrderItem];
      const second = b[sortDescriptor.column as keyof OrderItem];

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredOrders, sortDescriptor]);

  // Modal handlers
  const toggleInvoiceModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenInvoice(!isOpenInvoice);
  };

  const toggleCancelModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenCancelOrder(!isOpenCancelOrder);
  };

  const toggleConfirmModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenConfirmOrder(!isOpenConfirmOrder);
  };

  const toggleCommentModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenComment(!isOpenComment);
  };

  const toggleUpdateOrderModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenUpdateOrder(!isOpenUpdateOrder);
  };

  // Render cell content
  const renderCell = (order: OrderItem, columnKey: string) => {
    const cellValue = order[columnKey as keyof OrderItem];

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-default-400">
              {order.placedByName}
            </p>
            <p className="text-bold text-tiny capitalize text-default-400">
              {order.placedByPhoneNumber}
            </p>
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        );
      case "qrReference":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{order.qrReference}</p>
          </div>
        );
      case "orderID":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{order.reference}</p>
            <p className="text-bold text-tiny capitalize text-default-400">
              {moment(order.dateCreated).format("MMM Do, h:mm A")}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[order.status]}
            size="sm"
            variant="flat"
          >
            {statusDataMap[order.status]}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <button className="bg-transparent border-0 outline-none">
                  <HiOutlineDotsVertical className="text-default-300" />
                </button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownSection title="Actions">
                  <DropdownItem
                    startContent={<TbFileInvoice />}
                    onClick={() => toggleInvoiceModal(order)}
                  >
                    View Invoice
                  </DropdownItem>

                  {order.status === 0 && (role === 0 || userRolePermissions?.canConfirmOrder) && (
                    <DropdownItem
                      startContent={<BsCalendar2Check />}
                      onClick={() => toggleConfirmModal(order)}
                    >
                      Confirm Order
                    </DropdownItem>
                  )}

                  {(order.status === 0 || order.status === 1) && (role === 0 || userRolePermissions?.canCancelOrder) && (
                    <DropdownItem
                      startContent={<LiaTimesSolid />}
                      onClick={() => toggleCancelModal(order)}
                    >
                      Cancel Order
                    </DropdownItem>
                  )}

                  {order.status !== 2 && (
                    <DropdownItem
                      startContent={<FaCommentDots />}
                      onClick={() => toggleCommentModal(order)}
                    >
                      Comment
                    </DropdownItem>
                  )}

                  {order.status === 0 && (role === 0 || userRolePermissions?.canUpdateOrder) && (
                    <DropdownItem
                      startContent={<FaRegEdit />}
                      onClick={() => toggleUpdateOrderModal(order)}
                    >
                      Edit Order
                    </DropdownItem>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  };

  // Top content with filters
  const topContent = (
    <Filters
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      availableOptions={availableOptions}
    />
  );

  return (
    <section className='border border-primaryGrey rounded-lg overflow-hidden'>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        aria-label='Orders table'
        classNames={{
          wrapper: ['max-h-[382px]'],
          th: [
            'text-default-500',
            'text-sm',
            'border-b',
            'border-divider',
            'py-4',
            'rounded-none',
            'bg-grey300',
          ],
          tr: 'border-b border-divider rounded-none',
          td: [
            'py-3',
            'text-textGrey',
          ],
        }}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columns.filter(col => INITIAL_VISIBLE_COLUMNS.includes(col.uid))}>
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
          emptyContent={isLoading ? <SpinnerLoader size="md" /> : 'No orders found'}
          items={sortedOrders}
          isLoading={isLoading}
          loadingContent={<SpinnerLoader size="md" />}
        >
          {(order: OrderItem) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {(columnKey) => (
                <TableCell>{renderCell(order, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Custom Pagination */}
      <CustomPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        hasNext={pagination.hasNext}
        hasPrevious={pagination.hasPrevious}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        onPageChange={onPageChange}
        onNext={onNextPage}
        onPrevious={onPreviousPage}
        isLoading={isLoading}
      />

      {/* Modals */}
      <InvoiceModal
        isOpenInvoice={isOpenInvoice}
        singleOrder={singleOrder}
        toggleInvoiceModal={() => setIsOpenInvoice(!isOpenInvoice)}
      />

      <CancelOrderModal
        isOpenCancelOrder={isOpenCancelOrder}
        singleOrder={singleOrder}
        toggleCancelModal={() => setIsOpenCancelOrder(!isOpenCancelOrder)}
        refetch={refetch}
      />

      <ConfirmOrderModal
        singleOrder={singleOrder}
        isOpenConfirmOrder={isOpenConfirmOrder}
        toggleConfirmModal={() => setIsOpenConfirmOrder(!isOpenConfirmOrder)}
        refetch={refetch}
      />

      <Comment
        isOpenComment={isOpenComment}
        singleOrder={singleOrder}
        toggleCommentModal={() => setIsOpenComment(!isOpenComment)}
        refetch={refetch}
      />

      <UpdateOrderModal
        isOpenUpdateOrder={isOpenUpdateOrder}
        singleOrder={singleOrder}
        toggleUpdateOrderModal={() => setIsOpenUpdateOrder(!isOpenUpdateOrder)}
        refetch={refetch}
      />
    </section>
  );
};

export default NewOrdersList;