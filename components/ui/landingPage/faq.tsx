'use client';
import { getFAQItems } from '@/app/api/controllers/landingPage';
import { cn } from '@/lib/utils';
import { ArrowDown2, ArrowUp, FaqIcon } from '@/public/assets/svg';
import React, { useEffect, useState } from 'react';
import { Transition } from './transition';

const DEFAULT_FAQS = [
  {
    question: 'How secure is my data on Hobwise?',
    answer:
      'Security is our top priority. Hobwise uses industry-standard encryption and regular security audits to ensure your business and customer data are always protected.',
    collapse: true,
  },
  {
    question: 'Can I manage multiple locations with Hobwise?',
    answer:
      'Yes. Hobwise lets you manage multiple branches or outlets from a single account, with separate insights and controls for each location.',
    collapse: false,
  },
  {
    question: 'Does Hobwise offer real-time data and reporting?',
    answer:
      'Absolutely. Sales, orders, inventory, and payments update in real time, and you can export detailed reports across every module whenever you need them.',
    collapse: false,
  },
  {
    question: 'Is Hobwise available on mobile devices?',
    answer:
      'Yes. Hobwise is fully responsive and works on any modern browser, so you can manage your business from your phone, tablet, or desktop.',
    collapse: false,
  },
  {
    question: 'What types of businesses benefit from Hobwise?',
    answer:
      'Hobwise is built for the hospitality industry — restaurants, hotels, cafés, bars, lounges, and clubs of any size.',
    collapse: false,
  },
];

export default function FAQs({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState<
    { question: string; answer: string; collapse: boolean }[]
  >([]);

  const getFaqs = async (loading = true) => {
    setIsLoading(loading);
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

  const handleCollapse = (index: number) => {
    const copyFaqs = [...faqs];
    if (copyFaqs[index].collapse) {
      copyFaqs[index].collapse = false;
    } else {
      copyFaqs[index].collapse = true;
    }
    setFaqs(copyFaqs);
  };

  return (
    <section
      id='faq'
      className={cn(
        'scroll-mt-28 bg-white py-8 lg:py-16 font-satoshi space-y-2 px-6 lg:px-12',
        className
      )}
    >
      <div className='flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs shadow-custom-inset'>
        <FaqIcon />
        <p className='font-normal'>FAQ</p>
      </div>
      <div className='w-[100%] text-left'>
        <h2 className='text-[28px] lg:text-[44px] text-[#1D2939] lg:leading-[52px] font-bricolage_grotesque font-bold'>
          Your Top Questions About Hobwise
        </h2>
      </div>

      <div className='space-y-6'>
        {isLoading ? (
          ''
        ) : (
          <React.Fragment>
            {faqs.map((each, index) => (
              <Transition key={each.question || index}>
                {each.question && (
                  <div className='bg-[#F6F5FE] px-4 lg:px-8 py-6 rounded-2xl border border-[#5F35D24D] flex items-start justify-between font-bricolage_grotesque'>
                    <div className='space-y-2 text-left w-[80%]'>
                      <p
                        className='text-[#252525] font-medium text-base lg:text-[20px]'
                        onClick={() => handleCollapse(index)}
                      >
                        {each.question}
                      </p>
                      {each.collapse && (
                        <Transition>
                          <p className='text-[#677182] font-satoshi text-sm lg:text-base'>
                            {each.answer}
                          </p>
                        </Transition>
                      )}
                    </div>
                    <div
                      className='border border-[#5F35D2] bg-[#EAE8FD] rounded-full lg:h-10 lg:w-10 w-6 h-6 flex items-center justify-center'
                      role='button'
                      onClick={() => handleCollapse(index)}
                    >
                      {each.collapse ? <ArrowUp /> : <ArrowDown2 />}
                    </div>
                  </div>
                )}
              </Transition>
            ))}
          </React.Fragment>
        )}
      </div>
    </section>
  );
}
