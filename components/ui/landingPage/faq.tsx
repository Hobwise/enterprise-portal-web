'use client';
import { getFAQItems } from '@/app/api/controllers/landingPage';
import { cn } from '@/lib/utils';
import FaqPhoto from '@/public/assets/images/landing-v2/faq-photo.jpg';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { Transition } from './transition';

const DEFAULT_FAQS = [
  {
    question: 'How long does setup take?',
    answer:
      'Most restaurants can get started within 24–72 hours, depending on the size of your operations. Our team helps you set up menus, staff accounts, payments, and other essentials so you can start running smoothly as quickly as possible.',
  },
  {
    question: 'Will my staff need training?',
    answer:
      "Yes — but we've designed Hobwise to be simple and easy to use. Most staff members learn the basics within a short time, and we provide onboarding guidance to help your team get comfortable quickly.",
  },
  {
    question: 'Can Hobwise work across multiple branches?',
    answer:
      'Absolutely. Hobwise lets you manage multiple restaurant locations from one dashboard, giving you visibility into sales, operations, staff activity, and performance across all branches.',
  },
  {
    question: 'What happens if internet connectivity drops?',
    answer:
      'Hobwise is built with real operational environments in mind. Some features can continue working during temporary internet interruptions, and data syncs once connectivity is restored.',
  },
  {
    question: 'Can I migrate from another POS system?',
    answer:
      'Yes. We can help you migrate important business data such as menus, products, and operational information from your current system to Hobwise with minimal disruption.',
  },
  {
    question: 'Do you offer onboarding support?',
    answer:
      'Yes. Our team provides onboarding assistance to help you set up your restaurant, configure workflows, and get your staff ready to use Hobwise confidently.',
  },
  {
    question: 'Is support available on WhatsApp?',
    answer:
      'Yes. We offer WhatsApp support so you can quickly reach our team whenever you need help or have questions about your operations.',
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQs({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const getFaqs = async () => {
    setIsLoading(true);
    const data = await getFAQItems();
    setIsLoading(false);

    if (data?.data?.isSuccessful && data?.data?.data?.length) {
      setFaqs(data.data.data);
    } else {
      setFaqs(DEFAULT_FAQS);
    }
  };

  useEffect(() => {
    getFaqs();
  }, []);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id='faq'
      className={cn(
        'scroll-mt-24 bg-white py-16 lg:py-24 font-satoshi px-6 lg:px-16',
        className
      )}
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start'>
        <div className='space-y-10'>
          <div className='text-center space-y-3'>
            <h2 className='font-bricolage_grotesque font-medium text-[#161618] text-[30px] leading-[38px] lg:text-[44px] lg:leading-[52px]'>
              Frequently
              <br /> Asked Questions
            </h2>
            <p className='text-[#667085] text-sm lg:text-base'>Your top questions, answered.</p>
          </div>

          {!isLoading && (
            <div className='space-y-2 text-left'>
              {faqs.map((each, index) => {
                if (!each.question) return null;
                const isOpen = openIndex === index;

                return (
                  <Transition key={each.question}>
                    <div className='py-1'>
                      <button
                        type='button'
                        aria-expanded={isOpen}
                        onClick={() => handleToggle(index)}
                        className={cn(
                          'w-full flex items-center gap-4 text-left px-4 py-4 transition-colors',
                          isOpen
                            ? 'bg-[#F4F4F6] border-l-4 border-primaryColor text-primaryColor'
                            : 'text-[#3F3F46]'
                        )}
                      >
                        <span className='shrink-0 text-lg'>
                          {isOpen ? <FiMinus /> : <FiPlus />}
                        </span>
                        <span className='font-bricolage_grotesque text-base lg:text-lg'>
                          {each.question}
                        </span>
                      </button>
                      {isOpen && (
                        <Transition>
                          <p className='bg-white shadow-[0_8px_24px_rgba(16,24,40,0.06)] px-5 py-5 text-[#677182] text-sm lg:text-base'>
                            {each.answer}
                          </p>
                        </Transition>
                      )}
                    </div>
                  </Transition>
                );
              })}
            </div>
          )}
        </div>

        <Image
          src={FaqPhoto}
          alt='Warm, modern restaurant interior'
          className='hidden lg:block w-full h-auto object-cover'
        />
      </div>
    </section>
  );
}
