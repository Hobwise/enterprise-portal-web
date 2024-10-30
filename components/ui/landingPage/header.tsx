'use client';
import { cn } from '@/lib/utils';

export default function LandingPageHeader() {
  const promo: { class: string; title: string }[] = [
    { class: 'item1', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item2', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item3', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item4', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item5', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item6', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item7', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
    { class: 'item8', title: 'PROMO! PROMO!! PROMO!!! 🔥' },
  ];
  return (
    <div className="wrapper bg-primaryColor text-white">
      {promo.map((each) => (
        <p className={cn('itemLeft font-satoshi font-light', each.class)} key={each.class}>
          {each.title}
        </p>
      ))}
    </div>
  );
}
