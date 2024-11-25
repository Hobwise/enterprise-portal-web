import React from 'react';

import { getJsonItemFromLocalStorage } from '@/lib/utils';
import moment from 'moment';
import { SubscriptionHistory } from './Interfaces';

interface invoiceDetails {
  data: SubscriptionHistory | null;
}
const InvoiceSection: React.FC<invoiceDetails> = ({ data }) => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const business = userInformation?.businesses[0];

  // [
  //     {
  //         "businessId": "79254411-a3b6-47d2-a0ae-f1916fe5bf1f",
  //         "businessAddress": "Sanusi, VI",
  //         "state": "Lagos",
  //         "city": "Eti Osa",
  //         "businessName": "Jide plc",
  //         "primaryColor": "",
  //         "secondaryColor": "",
  //         "businessContactEmail": "olajvde@gmail.com",
  //         "businessContactNumber": "08168731977"
  //     }
  // ]

  // {
  //     "cooperateID": "9467e040-39ae-44c8-80ae-be79c403d0f1",
  //     "businessID": "79254411-a3b6-47d2-a0ae-f1916fe5bf1f",
  //     "subcribedByID": "39a6dd90-f7af-41fb-ae39-eed63fb05442",
  //     "plan": 1,
  //     "paymentPeriod": 0,
  //     "subscriptionStartDate": "2024-11-17T20:15:39.2134922",
  //     "subscriptionEndDate": "2024-12-17T20:15:39.2134922",
  //     "isActive": false,
  //     "isExpired": true,
  //     "subcriptionCode": "SUB_fgsktmo64nkmeoy",
  //     "status": 2,
  //     "subcriptionCustomerCode": "",
  //     "subcriptionPlanCode": "PLN_nitboxcoo7fvf3k",
  //     "subcriptionEmailToken": "olajvde@gmail.com",
  //     "reference": "13bc3f3349e3d2af713f547c669485359d094f4756d6c460",
  //     "subcribedByName": "Alex Jide",
  //     "totalAmount": 3000,
  //     "perAmount": 0,
  //     "id": "32f524b7-a918-4821-8d60-0a20d90fecb1"
  // }

  return (
    <section className='bg-gray-100 py-20'>
      <div className='max-w-2xl mx-auto py-0 md:py-16'>
        <article className='shadow-none md:shadow-md md:rounded-md overflow-hidden'>
          <div className='md:rounded-b-md bg-white'>
            <div className='p-9 border-b border-gray-200'>
              <div className='space-y-6'>
                <div className='flex justify-between items-top'>
                  <div className='space-y-4'>
                    <div>
                      <img
                        className='h-6 object-cover mb-4'
                        src='https://cdn.mjwebs.com/sites/mjwebs/mjwebs-logo.png'
                        alt='MJWebs Logo'
                      />
                      <p className='font-bold text-lg'>Invoice</p>
                      <p>Hobwise</p>
                    </div>
                    <div>
                      <p className='font-medium text-sm text-gray-400'>
                        Billed To
                      </p>
                      <p>{business?.businessName}</p>
                      <p>{business?.businessContactEmail}</p>
                      <p>{business?.businessContactNumber}</p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div>
                      <p className='font-medium text-sm text-gray-400'>
                        Invoice Number
                      </p>
                      <p>{data?.subscriptionPlanCode}</p>
                    </div>
                    <div>
                      <p className='font-medium text-sm text-gray-400'>
                        Invoice Date
                      </p>
                      <p>
                        {moment(data?.subscriptionStartDate).format(
                          'DD/MM/YYYY'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className='font-medium text-sm text-gray-400'>ABN</p>
                      <p>57 630 182 446</p>
                    </div>
                    <div>
                      <a
                        href='#'
                        target='_blank'
                        className='inline-flex items-center text-sm font-medium text-blue-500 hover:opacity-75'
                        rel='noreferrer'
                      >
                        Download PDF
                        <svg
                          className='ml-0.5 h-4 w-4 fill-current'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                          aria-hidden='true'
                        >
                          <path d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'></path>
                          <path d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'></path>
                        </svg>
                      </a>
                    </div>
                    <div>
                      <a
                        href='#'
                        target='_blank'
                        className='inline-flex items-center text-sm font-medium text-blue-500 hover:opacity-75'
                        rel='noreferrer'
                      >
                        Pay Balance
                        <svg
                          className='ml-0.5 h-4 w-4 fill-current'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                          aria-hidden='true'
                        >
                          <path d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'></path>
                          <path d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='p-9 border-b border-gray-200'>
              <p className='font-medium text-sm text-gray-400'>Note</p>
              <p className='text-sm'>Thank you for your order.</p>
            </div>
            <table className='w-full divide-y divide-gray-200 text-sm'>
              <thead>
                <tr>
                  <th className='px-9 py-4 text-left font-semibold text-gray-400'>
                    Item
                  </th>
                  <th className='py-3 text-left font-semibold text-gray-400'></th>
                  <th className='py-3 text-left font-semibold text-gray-400'>
                    Amount
                  </th>
                  <th className='py-3 text-left font-semibold text-gray-400'>
                    Discount
                  </th>
                  <th className='py-3 text-left font-semibold text-gray-400'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                <tr>
                  <td className='px-9 py-5 whitespace-nowrap space-x-1 flex items-center'>
                    <div>
                      <p>Jericho III (YA-4)</p>
                      <p className='text-sm text-gray-400'>
                        Nuclear-armed ICBM
                      </p>
                    </div>
                  </td>
                  <td className='whitespace-nowrap text-gray-600 truncate'></td>
                  <td className='whitespace-nowrap text-gray-600 truncate'>
                    $380,000.00
                  </td>
                  <td className='whitespace-nowrap text-gray-600 truncate'>
                    0%
                  </td>
                </tr>
                <tr>
                  <td className='px-9 py-5 whitespace-nowrap space-x-1 flex items-center'>
                    <div>
                      <p>Pym Particles (Pack of 10,000)</p>
                      <p className='text-sm text-gray-400'>
                        Redacted Description
                      </p>
                    </div>
                  </td>
                  <td className='whitespace-nowrap text-gray-600 truncate'></td>
                  <td className='whitespace-nowrap text-gray-600 truncate'>
                    $280,000.00
                  </td>
                  <td className='whitespace-nowrap text-gray-600 truncate'>
                    0%
                  </td>
                </tr>
              </tbody>
            </table>
            <div className='p-9 border-b border-gray-200'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <div>
                    <p className='text-gray-500 text-sm'>Subtotal</p>
                  </div>
                  <p className='text-gray-500 text-sm'>$660,000.00</p>
                </div>
                <div className='flex justify-between'>
                  <div>
                    <p className='text-gray-500 text-sm'>Tax</p>
                  </div>
                  <p className='text-gray-500 text-sm'>$0.00</p>
                </div>
                <div className='flex justify-between'>
                  <div>
                    <p className='text-gray-500 text-sm'>Total</p>
                  </div>
                  <p className='text-gray-500 text-sm'>$660,000.00</p>
                </div>
              </div>
            </div>
            <div className='p-9 border-b border-gray-200'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <div>
                    <p className='font-bold text-black text-lg'>Amount Due</p>
                  </div>
                  <p className='font-bold text-black text-lg'>$360.00</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default InvoiceSection;
