import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/menu',
    '/dashboard/menu/add-menu-item',
    '/dashboard/menu/preview-menu',
    '/dashboard/orders/place-order',
    '/dashboard/payments',
    '/dashboard/campaigns',
    '/dashboard/campaigns/create-campaign',
    '/dashboard/campaigns/edit-campaign',
    '/dashboard/campaigns/preview-campaign',
    '/dashboard/orders',
    '/dashboard/quick-response',
    '/dashboard/quick-response/create-qr',
    '/dashboard/notifications',
    '/dashboard/reports',
    '/dashboard/reservation',
    '/dashboard/bookings',
    '/dashboard/reservation/create-reservation',
    '/dashboard/settings/personal-information',
    '/dashboard/reports',
    '/dashboard/reports/booking',
    '/dashboard/reports/orders',
    '/dashboard/reports/audit-log',
    '/dashboard/reports/payment',
    '/auth/business-information',
    '/auth/select-business',
  ],
};
