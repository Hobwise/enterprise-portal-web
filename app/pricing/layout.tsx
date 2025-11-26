import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description:
    'Simple and transparent pricing for restaurant and hospitality businesses of all sizes. Choose from our flexible plans designed to help you grow your business.',
  openGraph: {
    title: 'Hobwise Pricing - Plans for Every Business Size',
    description:
      'Simple and transparent pricing for restaurant and hospitality businesses. Find the perfect plan for your needs.',
    url: 'https://hobwise.com/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hobwise Pricing - Plans for Every Business Size',
    description:
      'Simple and transparent pricing for restaurant and hospitality businesses',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
