'use client';
import { getFAQItems } from '@/app/api/controllers/landingPage';
import { cn } from '@/lib/utils';
import FaqPhoto from '@/public/assets/images/landing-v2/faq-photo.jpg';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { Transition } from './transition';

// Mirrors the live FAQ content served by the API — used only when the
// getFAQItems() request fails or returns an empty list.
const DEFAULT_FAQS = [
  {
    question: 'What is this platform, and who is it for?',
    answer:
      'Our platform is a B2B SaaS solution tailored for the hospitality industry, including businesses like bars, restaurants, clubs, hotels, lounges etc. We simplify daily operations by offering tools to efficiently manage orders, inventory, reservations, customer interactions, and more.',
  },
  {
    question: 'What types of activities can I manage with this platform?',
    answer:
      'You can manage a wide range of activities, including digital menu, order processing, inventory tracking, reservation scheduling, customer communications, staff assignments, and sales reporting. Our platform centralizes your business operations, giving you better control and visibility.',
  },
  {
    question: 'How does your platform help improve customer experience?',
    answer:
      'By automating and streamlining tasks, our platform helps you serve customers faster, reduce errors, and personalize interactions. This leads to shorter wait times, more accurate orders, and a smooth customer experience that keeps guests coming back.',
  },
  {
    question: 'Can I use this solution to manage multiple locations?',
    answer:
      'Yes, our platform is designed to support businesses with multiple locations. You can monitor and manage each location individually allowing you to make data-driven decisions.',
  },
  {
    question: 'What reports and analytics are available?',
    answer:
      'Our platform provides detailed analytics on sales, customer preferences, peak hours, and staff performance. You can generate custom reports to gain insights into your business’s performance, helping you identify opportunities for growth.',
  },
  {
    question: 'Is the platform mobile-friendly?',
    answer:
      'Absolutely! Our platform is designed to be accessible from any device, including smartphones and tablets, allowing you to manage your business on the go.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'We prioritize data security and employ industry-standard encryption and access control measures. Your data is stored securely, and only authorized users have access to sensitive information.',
  },
  {
    question: 'How much does the platform cost?',
    answer:
      'Our pricing is based on the size of your business and the features you need. We offer flexible subscription plans, so you only pay for what you use. Contact us to get a personalized quote.',
  },
  {
    question: 'What kind of customer support do you offer?',
    answer:
      'We offer 24/7 customer support to ensure you have assistance whenever you need it. Our support team is available via email, phone, and live chat, and we also offer a knowledge base for self-service help.',
  },
  {
    question: 'How can I get started with the platform?',
    answer:
      'Getting started is easy! Sign up for a free trial on our website or contact our sales team for a personalized demo. We’ll help you onboard and set up your account to ensure you’re ready to streamline your business operations right away.',
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
