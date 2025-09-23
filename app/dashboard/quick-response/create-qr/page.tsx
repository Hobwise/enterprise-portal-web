'use client';
import QRform from '@/components/ui/dashboard/qrCode/QRform';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CreateQrPage = () => {
  const { userRolePermissions, role, isLoading: isPermissionsLoading } = usePermission();
  const router = useRouter();

  // Check permissions before rendering
  useEffect(() => {
    if (!isPermissionsLoading && role !== 0 && !userRolePermissions?.canCreateQR) {
      router.push('/dashboard/unauthorized');
    }
  }, [isPermissionsLoading, role, userRolePermissions, router]);

  // Check if user has permission to create QR codes
  if (role !== 0 && !userRolePermissions?.canCreateQR) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <main className=' flex flex-col justify-center items-center'>
        <section className='max-w-[448px] w-full'>
          <div>
            <h2 className='text-[24px] leading-8 font-semibold'>
              Create Quick Response
            </h2>
            <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
              Add an item to your menu
            </p>
          </div>
          <QRform />
        </section>
      </main>
    </>
  );
};

export default CreateQrPage;
