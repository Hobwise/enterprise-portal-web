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
    '/dashboard/orders',
    '/dashboard/qr-code',
    '/dashboard/qr-code/create-qr',
    '/dashboard/reports',
    '/dashboard/reservation',
    '/dashboard/settings',
    '/auth/business-information',
    '/auth/select-business',
  ],
};
