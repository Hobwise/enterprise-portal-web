import Container from '@/components/dashboardContainer';
import Link from 'next/link';
import React from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';

import Layout from '@/components/ui/dashboard/menu/preview-menu/layout';
import Preview from '@/components/ui/dashboard/menu/preview-menu/preview';

export const metadata = {
  title: 'Hobink | Preview menu',
  description: 'Preview how the menu appear',
};
const PreviewMenu = () => {
  return (
    <Container>
      <Link
        href={'/dashboard/menu'}
        className={`cursor-pointer text-primaryColor flex gap-2 mb-3 text-sm items-center`}
      >
        <IoIosArrowRoundBack className='text-[22px]' />
        <span className='text-sm'>Back to menu</span>
      </Link>
      <section className='flex justify-between gap-10 '>
        <Layout />
        <Preview />
      </section>
    </Container>
  );
};

export default PreviewMenu;
