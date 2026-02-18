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
import Menu from '../../../public/assets/icons/menu.png';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <DashboardSidebar />,
  },
  {
    title: "Menu",
    path: "/dashboard/menu",
    icon: Menu,
  },
  {
    title: "Orders",
    path: "/dashboard/orders",
    icon: <OrderSidebar />,
  },
  {
    title: "Quick Response",
    path: "/dashboard/quick-response",
    icon: <QRcodeSidebar />,
  },
  {
    title: "Campaigns",
    path: "/dashboard/campaigns",
    icon: <CampaignSidebar />,
  },
  {
    title: "Reservation",
    path: "/dashboard/reservation",
    icon: <ReservationSidebar />,
  },
  {
    title: "Bookings",
    path: "/dashboard/bookings",
    icon: <BookingSidebar />,
  },
  {
    title: "Payments",
    path: "/dashboard/payments",
    icon: <PaymentSidebar />,
  },
  {
    title: "Reports",
    path: "/dashboard/reports",
    icon: <ReportSidebar />,
  },
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
    sectionTitle: "ORDER MANAGER",
    collapsible: true,
    defaultExpanded: true,
    items: SIDENAV_ITEMS,
  },
  {
    sectionTitle: "INVENTORY MANAGER",
    collapsible: true,
    defaultExpanded: true,
    requiredRole: 0, // Manager only (role 0)
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
    icon: Menu,
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
