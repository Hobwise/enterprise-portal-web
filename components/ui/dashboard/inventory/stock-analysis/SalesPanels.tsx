'use client';

import React, { useState } from 'react';
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import {
  BarList,
  BreakdownList,
  DonutChart,
  StatCards,
} from './SharedPanels';
import { BarRow, StatCard } from './types';

const DAILY_ORDER_BARS: BarRow[] = [
  { label: 'Mon 09', value: 850, suffix: ' Orders' },
  { label: 'Tue 10', value: 824, suffix: ' Orders' },
  { label: 'Wed 11', value: 844, suffix: ' Orders' },
  { label: 'Thur 12', value: 760, suffix: ' Orders' },
  { label: 'Fri 13', value: 844, suffix: ' Orders' },
  { label: 'Sat 14', value: 1026, suffix: ' Orders' },
  { label: 'Sun 15', value: 1136, suffix: ' Orders' },
];

const OVERVIEW_STATS: StatCard[] = [
  {
    label: 'Total Orders',
    value: '415',
    delta: '+3% from yesterday',
    direction: 'up',
  },
  {
    label: 'Gross Revenue',
    value: '₦8,896,000',
    delta: '+3% from yesterday value',
    direction: 'up',
  },
  {
    label: 'Average Order Amount',
    value: '₦28,000',
    delta: '-3% from yesterday value',
    direction: 'down',
  },
  {
    label: 'Unique Customers',
    value: '₦186',
    delta: '+2% from yesterday',
    direction: 'up',
  },
];

const ORDER_STATUS_ROWS = [
  { label: 'Open', value: 841 },
  { label: 'Closed', value: 811 },
  { label: 'Awaiting confirmation', value: 20 },
  { label: 'Cancellation', value: 6 },
  { label: 'Pick Day', value: 'Sun 15, (1136)' },
  { label: 'Refunds', value: 4 },
];

export const SalesOverviewPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={OVERVIEW_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Daily Orders"
          rows={DAILY_ORDER_BARS}
          className="lg:col-span-3"
        />
        <BreakdownList
          title="Order Status Breakdown"
          rows={ORDER_STATUS_ROWS}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
};

const VOLUME_STATS: StatCard[] = [
  {
    label: 'Total Orders',
    value: '415',
    delta: '+3% from yesterday',
    direction: 'up',
  },
  {
    label: 'Open Orders',
    value: '25',
    delta: '+3% from yesterday value',
    direction: 'up',
  },
  {
    label: 'Closed Orders',
    value: '370',
    delta: '-3% from yesterday value',
    direction: 'down',
  },
  {
    label: 'Cancelled Orders',
    value: '20',
    delta: '+2% from yesterday',
    direction: 'up',
  },
];

type VolumeSubTab = 'all' | 'pending' | 'confirmed';

const VOLUME_TABS: { id: VolumeSubTab; label: string; count: number }[] = [
  { id: 'all', label: 'All payments', count: 18 },
  { id: 'pending', label: 'Pending', count: 2 },
  { id: 'confirmed', label: 'Confirmed', count: 3 },
];

interface VolumeRow {
  date: string;
  totalOrders: number;
  open: number;
  closed: number;
  cancelled: number;
  grossRevenue: string;
  avgValue: string;
  uniqueCustomers: number;
}

const VOLUME_ROWS: VolumeRow[] = [
  {
    date: 'April 15',
    totalOrders: 850,
    open: 20,
    closed: 816,
    cancelled: 14,
    grossRevenue: '2,500,000',
    avgValue: '2,500,000',
    uniqueCustomers: 850,
  },
  {
    date: 'April 14',
    totalOrders: 712,
    open: 22,
    closed: 670,
    cancelled: 20,
    grossRevenue: '2,500,000',
    avgValue: '2,500,000',
    uniqueCustomers: 850,
  },
  {
    date: 'April 13',
    totalOrders: 966,
    open: 11,
    closed: 946,
    cancelled: 9,
    grossRevenue: '2,500,000',
    avgValue: '2,500,000',
    uniqueCustomers: 850,
  },
  {
    date: 'April 12',
    totalOrders: 920,
    open: 23,
    closed: 880,
    cancelled: 17,
    grossRevenue: '2,500,000',
    avgValue: '2,500,000',
    uniqueCustomers: 850,
  },
  {
    date: 'April 11',
    totalOrders: 1016,
    open: 15,
    closed: 996,
    cancelled: 5,
    grossRevenue: '2,500,000',
    avgValue: '2,500,000',
    uniqueCustomers: 850,
  },
];

export const OrdersVolumesPanel: React.FC = () => {
  const [tab, setTab] = useState<VolumeSubTab>('all');
  const [page, setPage] = useState<number>(3);
  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={VOLUME_STATS} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <PillTabs
          tabs={VOLUME_TABS.map((t) => ({
            id: t.id,
            label: t.label,
            count: t.count,
          }))}
          active={tab}
          onChange={(v) => setTab(v as VolumeSubTab)}
        />
        <div className="px-2 md:px-4 py-4">
          <Table
            removeWrapper
            aria-label="Orders volume breakdown"
            classNames={{
              th: [
                'bg-transparent',
                'text-xs',
                'font-semibold',
                'text-gray-500',
                'uppercase',
                'tracking-wider',
                'py-3',
              ],
              td: ['py-4', 'text-sm', 'text-gray-700'],
              tr: 'border-b border-gray-100 last:border-b-0',
            }}
          >
            <TableHeader>
              <TableColumn>Date</TableColumn>
              <TableColumn>Total Orders</TableColumn>
              <TableColumn>Open</TableColumn>
              <TableColumn>Closed</TableColumn>
              <TableColumn>Cancelled</TableColumn>
              <TableColumn>Gross Revenue</TableColumn>
              <TableColumn>Average Value Order</TableColumn>
              <TableColumn>Unique Customers</TableColumn>
            </TableHeader>
            <TableBody>
              {VOLUME_ROWS.map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.totalOrders}</TableCell>
                  <TableCell>{row.open}</TableCell>
                  <TableCell>{row.closed}</TableCell>
                  <TableCell>{row.cancelled}</TableCell>
                  <TableCell>{row.grossRevenue}</TableCell>
                  <TableCell>{row.avgValue}</TableCell>
                  <TableCell>{row.uniqueCustomers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={page}
          totalPages={30}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

const POPULAR_STATS: StatCard[] = [
  {
    label: 'Total Items Tracked',
    value: '64',
    delta: '+3% from yesterday',
    direction: 'up',
  },
  {
    label: 'Top Seller',
    value: 'Peppered Wings',
    footer: 'Previously Pork Ribs',
    footerTone: 'success',
  },
  {
    label: 'Gross Net Sales',
    value: '₦3,740,000',
    delta: '-3% from yesterday value',
    direction: 'down',
  },
  {
    label: 'Pending Revenue',
    value: '₦124,500',
    delta: '+2% from yesterday',
    direction: 'up',
  },
];

const TOP_SELLER_ROWS: BarRow[] = [
  { label: 'Peppered Wings', value: 4100 },
  { label: 'Pork Ribs', value: 3450 },
  { label: 'BBQ Chicken', value: 3000 },
  { label: 'Carnivora Platter', value: 2600 },
  { label: 'Stir Fried Pasta', value: 2400 },
  { label: 'Grilled Catfish', value: 2100 },
];

const DAILY_REVENUE_ROWS: BarRow[] = [
  { label: 'Peppered Wings', value: 820000 },
  { label: 'Pork Ribs', value: 740000 },
  { label: 'BBQ Chicken', value: 620000 },
  { label: 'Carnivora Platter', value: 580000 },
  { label: 'Stir Fried Pasta', value: 450000 },
  { label: 'Grilled Catfish', value: 410000 },
];

interface PopularItemRow {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  price: number;
  grossRevenue: string;
  netSales: string;
  packagingCost: number;
}

const POPULAR_ITEM_ROWS: PopularItemRow[] = [
  {
    id: '45412IV',
    name: 'Peppered Wings',
    category: 'Kitchen - Proteins',
    quantitySold: 816,
    price: 850,
    grossRevenue: '2,500,000',
    netSales: '850',
    packagingCost: 850,
  },
  {
    id: '45412IV',
    name: 'Pork Ribs',
    category: 'Kitchen - Grills',
    quantitySold: 670,
    price: 850,
    grossRevenue: '2,500,000',
    netSales: '850',
    packagingCost: 850,
  },
  {
    id: '45412IV',
    name: 'BBQ Chicken',
    category: 'Kitchen - Grills',
    quantitySold: 946,
    price: 850,
    grossRevenue: '2,500,000',
    netSales: '850',
    packagingCost: 850,
  },
  {
    id: '45412IV',
    name: 'Carnivora Platter',
    category: 'Kitchen - Grills',
    quantitySold: 880,
    price: 850,
    grossRevenue: '2,500,000',
    netSales: '850',
    packagingCost: 850,
  },
  {
    id: '45412IV',
    name: 'Grilled Catfish',
    category: 'Kitchen - Grills',
    quantitySold: 996,
    price: 850,
    grossRevenue: '2,500,000',
    netSales: '850',
    packagingCost: 850,
  },
];

export const PopularItemsPanel: React.FC = () => {
  const [page, setPage] = useState<number>(3);
  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={POPULAR_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarList
          title="Daily Top Seller"
          rows={TOP_SELLER_ROWS}
          valueFormatter={(r) => `${r.value.toLocaleString()} sold`}
        />
        <BarList
          title="Daily Revenue"
          rows={DAILY_REVENUE_ROWS}
          valueFormatter={(r) => `₦${r.value.toLocaleString()}`}
        />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="px-2 md:px-4 py-4">
          <Table
            removeWrapper
            aria-label="Popular items table"
            classNames={{
              th: [
                'bg-transparent',
                'text-xs',
                'font-semibold',
                'text-gray-500',
                'uppercase',
                'tracking-wider',
                'py-3',
              ],
              td: ['py-4', 'text-sm', 'text-gray-700'],
              tr: 'border-b border-gray-100 last:border-b-0',
            }}
          >
            <TableHeader>
              <TableColumn>Item ID</TableColumn>
              <TableColumn>Item Name</TableColumn>
              <TableColumn>Category</TableColumn>
              <TableColumn>Quantity Sold</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Gross Revenue</TableColumn>
              <TableColumn>Net Sales</TableColumn>
              <TableColumn>Packaging Cost</TableColumn>
            </TableHeader>
            <TableBody>
              {POPULAR_ITEM_ROWS.map((row, i) => (
                <TableRow key={`${row.id}-${i}`}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.quantitySold}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.grossRevenue}</TableCell>
                  <TableCell>{row.netSales}</TableCell>
                  <TableCell>{row.packagingCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={page}
          totalPages={30}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

const EMPLOYEE_STATS: StatCard[] = [
  {
    label: 'Staffs Handling Orders',
    value: '41',
    footer: 'Active Staffs',
    footerTone: 'success',
  },
  {
    label: 'Top Performer',
    value: 'Jennifer O.',
    footer: 'previously Nathan',
    footerTone: 'success',
  },
  {
    label: 'Total Sales Processed',
    value: '₦8,896,000',
    delta: '-3% from previous',
    direction: 'down',
  },
  {
    label: 'Number of Orders',
    value: '186',
    delta: '+2% from previous',
    direction: 'up',
  },
];

interface EmployeeRow {
  id: string;
  staff: string;
  email: string;
  station: string;
  orders: number;
  totalSales: string;
  confirmed: string;
  pending: number;
  refunds: number;
}

const EMPLOYEE_ROWS: EmployeeRow[] = [
  {
    id: '45412IV',
    staff: 'Emma',
    email: 'emma@gmail.com',
    station: 'Kitchen',
    orders: 816,
    totalSales: '2,500,000',
    confirmed: '2,500,000',
    pending: 850,
    refunds: 850,
  },
  {
    id: '45412IV',
    staff: 'Emma',
    email: 'emma@gmail.com',
    station: 'Grills',
    orders: 670,
    totalSales: '2,500,000',
    confirmed: '2,500,000',
    pending: 850,
    refunds: 850,
  },
  {
    id: '45412IV',
    staff: 'Emma',
    email: 'emma@gmail.com',
    station: 'Bar',
    orders: 946,
    totalSales: '2,500,000',
    confirmed: '2,500,000',
    pending: 850,
    refunds: 850,
  },
  {
    id: '45412IV',
    staff: 'Emma',
    email: 'emma@gmail.com',
    station: 'POS',
    orders: 880,
    totalSales: '2,500,000',
    confirmed: '2,500,000',
    pending: 850,
    refunds: 850,
  },
  {
    id: '45412IV',
    staff: 'Emma',
    email: 'emma@gmail.com',
    station: 'POS',
    orders: 996,
    totalSales: '2,500,000',
    confirmed: '2,500,000',
    pending: 850,
    refunds: 850,
  },
];

export const EmployeePerformancePanel: React.FC = () => {
  const [page, setPage] = useState<number>(3);
  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={EMPLOYEE_STATS} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="px-2 md:px-4 py-4">
          <Table
            removeWrapper
            aria-label="Employee performance table"
            classNames={{
              th: [
                'bg-gray-50',
                'text-xs',
                'font-semibold',
                'text-gray-500',
                'py-3',
              ],
              td: ['py-4', 'text-sm', 'text-gray-700'],
              tr: 'border-b border-gray-100 last:border-b-0',
            }}
          >
            <TableHeader>
              <TableColumn>Employee ID</TableColumn>
              <TableColumn>Staff</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Station</TableColumn>
              <TableColumn>Orders</TableColumn>
              <TableColumn>Total Sales</TableColumn>
              <TableColumn>Confirmed</TableColumn>
              <TableColumn>Pending</TableColumn>
              <TableColumn>Refunds</TableColumn>
            </TableHeader>
            <TableBody>
              {EMPLOYEE_ROWS.map((row, i) => (
                <TableRow key={`${row.id}-${i}`}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.staff}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.station}</TableCell>
                  <TableCell>{row.orders}</TableCell>
                  <TableCell>{row.totalSales}</TableCell>
                  <TableCell>{row.confirmed}</TableCell>
                  <TableCell>{row.pending}</TableCell>
                  <TableCell>{row.refunds}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={page}
          totalPages={30}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

const CATEGORY_STATS: StatCard[] = [
  {
    label: 'Categories',
    value: '6',
    footer: 'Active categories',
    footerTone: 'success',
  },
  {
    label: 'Top Category',
    value: 'Grills',
    footer: 'Previously Bar',
    footerTone: 'success',
  },
  {
    label: 'Total Sales',
    value: '₦5,728,000',
    delta: '-3% from yesterday value',
    direction: 'down',
  },
  {
    label: 'Orders Processed',
    value: '186',
    delta: '+2% from yesterday',
    direction: 'up',
  },
];

const CATEGORY_BAR_ROWS: BarRow[] = [
  { label: 'Grills', value: 850, suffix: ' Orders' },
  { label: 'Bar', value: 824, suffix: ' Orders' },
  { label: 'Kitchen', value: 844, suffix: ' Orders' },
  { label: 'Sweets', value: 760, suffix: ' Orders' },
];

const CATEGORY_SHARE_ROWS: BarRow[] = [
  { label: 'Grills', value: 45 },
  { label: 'Bar', value: 22 },
  { label: 'Kitchen', value: 17 },
  { label: 'Sweets', value: 16 },
];

interface CategoryRow {
  category: string;
  orders: number;
  itemsSold: number;
  revenue: string;
  percentage: string;
}

const CATEGORY_ROWS: CategoryRow[] = [
  {
    category: 'Kitchen',
    orders: 816,
    itemsSold: 850,
    revenue: '2,500,000',
    percentage: '17%',
  },
  {
    category: 'Grills',
    orders: 670,
    itemsSold: 850,
    revenue: '2,500,000',
    percentage: '45%',
  },
  {
    category: 'Bar',
    orders: 946,
    itemsSold: 850,
    revenue: '2,500,000',
    percentage: '22%',
  },
  {
    category: 'POS',
    orders: 880,
    itemsSold: 850,
    revenue: '2,500,000',
    percentage: '16%',
  },
];

export const CategoryPerformancePanel: React.FC = () => {
  const [page, setPage] = useState<number>(3);
  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={CATEGORY_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarList title="Daily Orders" rows={CATEGORY_BAR_ROWS} />
        <BarList
          title="Share of Sales"
          rows={CATEGORY_SHARE_ROWS}
          valueFormatter={(r) => `${r.value}%`}
          max={100}
        />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="px-2 md:px-4 py-4">
          <Table
            removeWrapper
            aria-label="Category performance table"
            classNames={{
              th: [
                'bg-gray-50',
                'text-xs',
                'font-semibold',
                'text-gray-500',
                'py-3',
              ],
              td: ['py-4', 'text-sm', 'text-gray-700'],
              tr: 'border-b border-gray-100 last:border-b-0',
            }}
          >
            <TableHeader>
              <TableColumn>Categories</TableColumn>
              <TableColumn>Orders</TableColumn>
              <TableColumn>Items Sold</TableColumn>
              <TableColumn>Total Sales Revenue</TableColumn>
              <TableColumn>Percentage</TableColumn>
            </TableHeader>
            <TableBody>
              {CATEGORY_ROWS.map((row, i) => (
                <TableRow key={`${row.category}-${i}`}>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.orders}</TableCell>
                  <TableCell>{row.itemsSold}</TableCell>
                  <TableCell>{row.revenue}</TableCell>
                  <TableCell>{row.percentage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={page}
          totalPages={30}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

const PAYMENT_STATS: StatCard[] = [
  {
    label: 'All Payments',
    value: '₦18,654,170',
    delta: '+3% from yesterday',
    direction: 'up',
  },
  {
    label: 'Full Payments',
    value: '₦14,604,000',
    delta: '+3% from yesterday value',
    direction: 'up',
  },
  {
    label: 'Partial Payments',
    value: '₦4,000,000',
    delta: '-3% from yesterday value',
    direction: 'down',
  },
  {
    label: 'Refund Payments',
    value: '₦50,170',
    delta: '+2% from yesterday',
    direction: 'up',
  },
];

const PAYMENT_DAILY_ROWS: BarRow[] = [
  { label: 'Mon 09', value: 850 },
  { label: 'Tue 10', value: 824 },
  { label: 'Wed 11', value: 844 },
  { label: 'Thur 12', value: 760 },
  { label: 'Fri 13', value: 844 },
  { label: 'Sat 14', value: 1026 },
  { label: 'Sun 15', value: 1136 },
];

const PAYMENT_DONUT_SEGMENTS = [
  { label: 'Full Payments', value: 45, color: '#5F35D2' },
  { label: 'Partial Payments', value: 25, color: '#E35AC5' },
  { label: 'Refund Payments', value: 15, color: '#B8A6F2' },
];

type PaymentTab = 'all' | 'full' | 'partial' | 'refunds';

const PAYMENT_TABS: { id: PaymentTab; label: string; count: number }[] = [
  { id: 'all', label: 'All payments', count: 18 },
  { id: 'full', label: 'Full Payments', count: 10 },
  { id: 'partial', label: 'Partial Payments', count: 5 },
  { id: 'refunds', label: 'Refunds', count: 3 },
];

interface PaymentOrderRow {
  time: string;
  paymentRef: string;
  amount: string;
  orderId: string;
  method: string;
  staff: string;
  customer: string;
  status: 'Completed' | 'Pending' | 'Refund';
}

const PAYMENT_ORDER_ROWS: PaymentOrderRow[] = [
  {
    time: '02/03/2025 09:19PM',
    paymentRef: 'PTPK2345A',
    amount: '2,500,000',
    orderId: 'ORD12345A',
    method: 'Cash',
    staff: 'Emma',
    customer: 'Stephanie',
    status: 'Completed',
  },
  {
    time: '02/03/2025 09:19PM',
    paymentRef: 'PTPK2345A',
    amount: '2,500,000',
    orderId: 'ORD12345A',
    method: 'Transfer',
    staff: 'Emma',
    customer: 'Anonymous',
    status: 'Pending',
  },
  {
    time: '02/03/2025 09:19PM',
    paymentRef: 'PTPK2345A',
    amount: '2,500,000',
    orderId: 'ORD12345A',
    method: 'Cash',
    staff: 'Emma',
    customer: 'Anonymous',
    status: 'Refund',
  },
  {
    time: '02/03/2025 09:19PM',
    paymentRef: 'PTPK2345A',
    amount: '2,500,000',
    orderId: 'ORD12345A',
    method: 'Transfer',
    staff: 'Emma',
    customer: 'Anonymous',
    status: 'Completed',
  },
  {
    time: '02/03/2025 09:19PM',
    paymentRef: 'PTPK2345A',
    amount: '2,500,000',
    orderId: 'ORD12345A',
    method: 'Cash',
    staff: 'Emma',
    customer: 'Big Ray',
    status: 'Refund',
  },
];

const statusClass = (status: PaymentOrderRow['status']): string => {
  switch (status) {
    case 'Completed':
      return 'text-emerald-600';
    case 'Pending':
      return 'text-amber-600';
    case 'Refund':
    default:
      return 'text-red-500';
  }
};

export const OrderPaymentSummaryPanel: React.FC = () => {
  const [tab, setTab] = useState<PaymentTab>('all');
  const [page, setPage] = useState<number>(3);
  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={PAYMENT_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <BarList
          title="Daily Orders"
          rows={PAYMENT_DAILY_ROWS}
          className="lg:col-span-2"
          valueFormatter={(r) => `${r.value.toLocaleString()}`}
        />
        <DonutChart title="Payment Status" segments={PAYMENT_DONUT_SEGMENTS} />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <PillTabs
          tabs={PAYMENT_TABS.map((t) => ({
            id: t.id,
            label: t.label,
            count: t.count,
          }))}
          active={tab}
          onChange={(v) => setTab(v as PaymentTab)}
        />
        <div className="px-2 md:px-4 py-4">
          <Table
            removeWrapper
            aria-label="Order payment summary table"
            classNames={{
              th: [
                'bg-gray-50',
                'text-xs',
                'font-semibold',
                'text-gray-500',
                'py-3',
              ],
              td: ['py-4', 'text-sm', 'text-gray-700'],
              tr: 'border-b border-gray-100 last:border-b-0',
            }}
          >
            <TableHeader>
              <TableColumn>Time</TableColumn>
              <TableColumn>Payment Ref</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn>Order ID</TableColumn>
              <TableColumn>Method</TableColumn>
              <TableColumn>Staff</TableColumn>
              <TableColumn>Customer</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {PAYMENT_ORDER_ROWS.map((row, i) => (
                <TableRow key={`${row.paymentRef}-${i}`}>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.paymentRef}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.orderId}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>{row.staff}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium text-sm ${statusClass(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={page}
          totalPages={30}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

interface PillTabsProps {
  tabs: { id: string; label: string; count: number }[];
  active: string;
  onChange: (id: string) => void;
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  active,
  onChange,
}) => {
  return (
    <div className="px-4 md:px-6 pt-4 border-b border-gray-100">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-primaryColor border-primaryColor'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <Chip
                size="sm"
                classNames={{
                  base: `h-5 min-w-5 px-2 ${
                    isActive
                      ? 'bg-pink200 text-primaryColor'
                      : 'bg-gray-100 text-gray-500'
                  }`,
                  content: 'text-[11px] font-semibold px-0',
                }}
              >
                {tab.count}
              </Chip>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
}) => {
  const pageNumbers: (number | string)[] = (() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        2,
        3,
        '...',
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  })();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 px-4 md:px-6 py-4 border-t border-gray-100">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-400 text-sm"
              >
                ...
              </span>
            );
          }
          const num = page as number;
          const isActive = num === currentPage;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-pink200 text-primaryColor'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentPage <= 1}
          onPress={() => onChange(Math.max(1, currentPage - 1))}
          startContent={<IoIosArrowBack />}
          className="border border-gray-200 text-gray-700 rounded-lg"
        >
          Previous
        </Button>
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentPage >= totalPages}
          onPress={() => onChange(Math.min(totalPages, currentPage + 1))}
          endContent={<IoIosArrowForward />}
          className="border border-gray-200 text-gray-700 rounded-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
