'use client';
import Error from '@/components/error';
import useUserByBusiness from '@/hooks/cachedEndpoints/useUserByBusiness';
import { SmallLoader } from '@/lib/utils';
import EmptyPage from './emptyPage';
import Users from './users';

const Teams = ({ setActiveScreen }: any) => {
  const { data, isLoading, isError, refetch } = useUserByBusiness();

  if (isLoading) {
    return (
      <>
        <div className='w-[220px]'>
          <h1 className='text-[16px] leading-8 font-semibold'>Team members</h1>
          <p className='text-sm  text-grey600 md:mb-10 mb-4'>
            Invite your colleagues to work faster and collaborate together
          </p>
        </div>
        <div className='grid mt-5 place-content-center'>
          <SmallLoader />
        </div>
      </>
    );
  }
  if (isError) {
    return <Error onClick={() => refetch()} />;
  }
  return (
    <section>
      {data?.length > 0 ? (
        <Users data={data} refetch={refetch} />
      ) : (
        <EmptyPage />
      )}
    </section>
  );
};

export default Teams;
