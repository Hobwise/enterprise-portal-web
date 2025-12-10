import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Hobwise. Email us at hello@hobwise.com or visit our office at Bouvardia Court, Ikate Lekki, Lagos. We are here to answer your questions.',
  openGraph: {
    title: 'Contact Hobwise - Get in Touch',
    description:
      'Questions about our restaurant management platform? Contact our team at hello@hobwise.com',
    url: 'https://hobwise.com/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Hobwise - Get in Touch',
    description:
      'Questions about our restaurant management platform? Contact our team.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
