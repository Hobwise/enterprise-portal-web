import QRform from '@/components/ui/dashboard/qrCode/QRform';

export const metadata = {
  title: 'Create Quick Response',
  description: ' Create Quick Response',
};
const CreateQrPage = () => {
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
