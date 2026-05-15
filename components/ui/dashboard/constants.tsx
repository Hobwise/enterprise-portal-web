'use client';
import { SideNavItem, SideNavSection } from './types';
import {
  DashboardSidebar,
  OrderSidebar,
  QRcodeSidebar,
  CampaignSidebar,
  ReservationSidebar,
  BookingSidebar,
  PaymentSidebar,
  ReportSidebar,
  SettingsIcon,
  InventoryDashboardIcon,
  ItemIcon,
  SupplierIcon,
  PurchaseRequestIcon,
  StockTransferIcon,
  StockAdjustmentIcon,
  InventoryCountIcon,
  HistoryIcon,
  StockAnalysisIcon,
} from "@/public/assets/svg";
import Image from 'next/image';
import Menu from '../../../public/assets/icons/menu.png';

const DASHBOARD_ITEM: SideNavItem = {
  title: "Dashboard",
  path: "/dashboard",
  icon: <DashboardSidebar />,
};

const MENU_ITEM: SideNavItem = {
  title: "Menu",
  path: "/dashboard/menu",
  icon: Menu,
};

const ORDERS_ITEM: SideNavItem = {
  title: "Orders",
  path: "/dashboard/orders",
  icon: <OrderSidebar />,
};

const QUICK_RESPONSE_ITEM: SideNavItem = {
  title: "Quick Response",
  path: "/dashboard/quick-response",
  icon: <QRcodeSidebar />,
};

const CAMPAIGNS_ITEM: SideNavItem = {
  title: "Campaigns",
  path: "/dashboard/campaigns",
  icon: <CampaignSidebar />,
};

const RESERVATION_ITEM: SideNavItem = {
  title: "Reservation",
  path: "/dashboard/reservation",
  icon: <ReservationSidebar />,
};

const BOOKINGS_ITEM: SideNavItem = {
  title: "Bookings",
  path: "/dashboard/bookings",
  icon: <BookingSidebar />,
};

const PAYMENTS_ITEM: SideNavItem = {
  title: "Payments",
  path: "/dashboard/payments",
  icon: <PaymentSidebar />,
};

const REPORTS_ITEM: SideNavItem = {
  title: "Reports",
  path: "/dashboard/reports",
  icon: <ReportSidebar />,
};

// Flat list of all primary nav items — used for permission lookups & header mapping
export const SIDENAV_ITEMS: SideNavItem[] = [
  DASHBOARD_ITEM,
  MENU_ITEM,
  ORDERS_ITEM,
  QUICK_RESPONSE_ITEM,
  CAMPAIGNS_ITEM,
  RESERVATION_ITEM,
  BOOKINGS_ITEM,
  PAYMENTS_ITEM,
  REPORTS_ITEM,
];

// Section item groupings (used in SIDENAV_CONFIG below)
const OVERVIEW_ITEMS: SideNavItem[] = [DASHBOARD_ITEM, REPORTS_ITEM];
const SALES_ITEMS: SideNavItem[] = [MENU_ITEM, ORDERS_ITEM, PAYMENTS_ITEM];
const ENGAGEMENT_ITEMS: SideNavItem[] = [
  QUICK_RESPONSE_ITEM,
  CAMPAIGNS_ITEM,
  RESERVATION_ITEM,
  BOOKINGS_ITEM,
];

// Inventory Manager navigation items
export const INVENTORY_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard/inventory",
    icon: <InventoryDashboardIcon />,
  },
  {
    title: "Item",
    path: "/dashboard/inventory/items",
    icon: <ItemIcon />,
  },
  {
    title: "Supplier",
    path: "/dashboard/inventory/suppliers",
    icon: <SupplierIcon fill='#fff' />,
  },
  {
    title: "Purchase Order",
    path: "/dashboard/inventory/purchase-order",
    icon: <PurchaseRequestIcon />,
  },
  {
    title: "Stock Transfer",
    path: "/dashboard/inventory/stock-transfer",
    icon: <StockTransferIcon />,
  },
  {
    title: "Stock Adjustment",
    path: "/dashboard/inventory/stock-adjustment",
    icon: <StockAdjustmentIcon />,
  },
  {
    title: "Inventory Count",
    path: "/dashboard/inventory/inventory-count",
    icon: <InventoryCountIcon />,
  },
  {
    title: "History",
    path: "/dashboard/inventory/history",
    icon: <HistoryIcon />,
  },
  {
    title: "Stock Analysis",
    path: "/dashboard/inventory/stock-analysis",
    icon: <StockAnalysisIcon />,
  },
];

// Section-based navigation configuration
export const SIDENAV_CONFIG: SideNavSection[] = [
  {
    sectionTitle: "OVERVIEW",
    collapsible: false,
    items: OVERVIEW_ITEMS,
  },
  {
    sectionTitle: "SALES",
    collapsible: false,
    items: SALES_ITEMS,
  },
  {
    sectionTitle: "ENGAGEMENT",
    collapsible: false,
    items: ENGAGEMENT_ITEMS,
  },
  {
    sectionTitle: "INVENTORY",
    collapsible: false,
    requiredRole: 0, // Manager only (role 0)
    requiredCapability: "canAccessInventory",
    items: INVENTORY_ITEMS,
  },
];

export const headerRouteMapping = {
  settings: {
    title: 'Settings',
    icon: <SettingsIcon />,
  },
  menu: {
    title: 'Menu',
    icon: <Image src={Menu} alt="Menu" width={20} height={20} />,
  },
  orders: {
    title: 'Orders',
    icon: <OrderSidebar />,
  },
  'quick-response': {
    title: 'Quick Response',
    icon: <QRcodeSidebar />,
  },
  reservation: {
    title: 'Reservation',
    icon: <ReservationSidebar />,
  },
  campaigns: {
    title: 'Campaigns',
    icon: <CampaignSidebar />,
  },
  'inventory/suppliers': {
    title: 'Suppliers',
    icon: <SupplierIcon fill='#494E58' />,
  },
  inventory: {
    title: 'Inventory',
    icon: <InventoryDashboardIcon />,
  },
  report: {
    title: 'Reports',
    icon: <ReportSidebar />,
  },
};
