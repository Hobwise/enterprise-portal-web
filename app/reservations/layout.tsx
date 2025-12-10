import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
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
      <header className="z-[50] backdrop-filter backdrop-blur-md fixed w-full">
        <LandingPageHeader />
        <Navbar type="default" />
      </header>
      <Suspense fallback={<LoadingReservations />}>
        <div className="pt-12 pb-6">{children}</div>
      </Suspense>
    </div>
  );
}
