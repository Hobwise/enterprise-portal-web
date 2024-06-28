import Booking from '../../../public/assets/icons/bookings.png';
import Campaigns from '../../../public/assets/icons/campaigns.png';
import Dashboard from '../../../public/assets/icons/dashboard.png';
import Menu from '../../../public/assets/icons/menu.png';
import Orders from '../../../public/assets/icons/order.png';
import Payments from '../../../public/assets/icons/payment.png';
import QRCode from '../../../public/assets/icons/qr-code.png';
import Report from '../../../public/assets/icons/reports.png';
import Reservation from '../../../public/assets/icons/reservation.png';
import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Dashboard,
  },
  {
    title: 'Menu',
    path: '/dashboard/menu',
    icon: Menu,
  },
  {
    title: 'Orders',
    path: '/dashboard/orders',
    icon: Orders,
  },
  {
    title: 'QR Code',
    path: '/dashboard/qr-code',
    icon: QRCode,
  },
  {
    title: 'Campaigns',
    path: '/dashboard/campaigns',
    icon: Campaigns,
  },
  {
    title: 'Reservation',
    path: '/dashboard/reservation',
    icon: Reservation,
  },
  {
    title: 'Bookings',
    path: '/dashboard/bookings',
    icon: Booking,
  },
  {
    title: 'Payments',
    path: '/dashboard/payments',
    icon: Payments,
  },
  {
    title: 'Reports',
    path: '/dashboard/reports',
    icon: Report,
  },
];
