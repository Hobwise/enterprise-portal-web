import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Request a Demo',
  description:
    'See Hobwise in action. Request a personalized demo of our restaurant and hospitality management platform. Learn how we can help streamline your operations.',
  openGraph: {
    title: 'Request a Hobwise Demo',
    description:
      'See how Hobwise can transform your restaurant operations. Schedule a personalized demo with our team today.',
    url: 'https://hobwise.com/request-demo',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Request a Hobwise Demo',
    description:
      'See how Hobwise can transform your restaurant operations. Schedule a demo today.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
