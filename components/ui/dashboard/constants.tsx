'use client';
import { SideNavItem } from './types';
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
  report: {
    title: 'Reports',
    icon: <ReportSidebar />,
  },
};
