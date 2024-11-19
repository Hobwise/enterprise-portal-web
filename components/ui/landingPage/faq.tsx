'use client';
import { cn, notify } from '@/lib/utils';
import { ArrowDown2, ArrowUp, FaqIcon } from '@/public/assets/svg';
import { Transition } from './transition';
import React, { useEffect, useState } from 'react';
import { getFAQItems } from '@/app/api/controllers/landingPage';

export default function FAQs({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState<{ question: string; answer: string; collapse: boolean }[]>([]);

  const getFaqs = async (loading = true) => {
    setIsLoading(loading);
    const data = await getFAQItems();
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      setFaqs([...data?.data?.data, { collapse: true }]);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
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
    <section className={cn('bg-white py-8 lg:py-16 font-satoshi space-y-2 px-6 lg:px-12', className)}>
      <div className="flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs shadow-custom-inset">
        <FaqIcon />
        <p className="font-normal">FAQ</p>
      </div>
      <div className="w-[100%] text-left">
        <h2 className="text-[24px] lg:text-[40px] text-[#161618] lg:leading-[64px] font-bricolage_grotesque">Your Top Questions About Hobink</h2>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          ''
        ) : (
          <React.Fragment>
            {faqs.map((each, index) => (
              <Transition key={each.question}>
                {each.question && (
                  <div className="bg-[#F6F5FE] px-4 lg:px-8 py-6 rounded-2xl border border-[#5F35D24D] flex items-start justify-between font-bricolage_grotesque">
                    <div className="space-y-2 text-left w-[80%]">
                      <p className="text-[#252525] font-medium text-base lg:text-[20px]" onClick={() => handleCollapse(index)}>
                        {each.question}
                      </p>
                      {each.collapse && (
                        <Transition>
                          <p className="text-[#677182] font-satoshi text-sm lg:text-base">{each.answer}</p>
                        </Transition>
                      )}
                    </div>
                    <div
                      className="border border-[#5F35D2] bg-[#EAE8FD] rounded-full lg:h-10 lg:w-10 w-6 h-6 flex items-center justify-center"
                      role="button"
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
