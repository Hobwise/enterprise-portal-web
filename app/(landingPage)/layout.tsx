import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Hobwise is the all-in-one restaurant and hospitality management platform. Simplify operations with our menu management, reservation system, QR ordering, POS, and campaign tools.',
  openGraph: {
    title: 'Hobwise - Transform Your Restaurant & Hospitality Business',
    description:
      'All-in-one platform for managing your restaurant operations. From menus to payments, reservations to campaigns - we have got you covered.',
    url: 'https://hobwise.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hobwise - Transform Your Restaurant & Hospitality Business',
    description:
      'All-in-one platform for managing your restaurant operations seamlessly',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
