import LandingNav from '@/components/ui/landingPage/v2/nav';
import { LoadingReservations } from '@/components/ui/landingPage/skeleton-loading';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Reservations',
  description:
    'Discover and book tables at top restaurants with Hobwise. Simple, fast, and secure online reservation system for diners and restaurants.',
  openGraph: {
    title: 'Restaurant Reservations with Hobwise',
    description:
      'Book tables at your favorite restaurants instantly. Browse available slots and make reservations online.',
    url: 'https://hobwise.com/reservations',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Reservations with Hobwise',
    description: 'Book tables at your favorite restaurants instantly',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-white">
      <LandingNav />
      <Suspense fallback={<LoadingReservations />}>
        <div className="pt-20 pb-6">{children}</div>
      </Suspense>
    </div>
  );
}
