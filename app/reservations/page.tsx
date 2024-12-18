'use client';
import { CustomInput } from '@/components/CustomInput';
import { ArrowRight } from '@/public/assets/svg';
import React, { useEffect, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { CustomButton } from '@/components/customButton';
import Footer from '@/components/ui/landingPage/footer';
import { getReservations } from '../api/controllers/landingPage';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import ReservationCard from '@/components/ui/landingPage/reservationCard';
import { LoadingReservations } from '@/components/ui/landingPage/skeleton-loading';
import { Select, SelectItem } from '@nextui-org/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CustomPagination from '@/components/ui/customPagination';
import Image from 'next/image';
import EmptyIcon from '@/public/assets/images/empty-image.png';
import { useQuery } from 'react-query';

export default function Reservations() {
  const searchParams = useSearchParams();
  const pageSize = searchParams.get('page_size') || '10';
  const currentPage = searchParams.get('page') || '1';
  const searchKeyWord = searchParams.get('q') || '';
  const [searchKey, setSearchKey] = useState<string>('');
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleChangeParams = (term: string, key: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set(key, term);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data, isLoading, error } = useQuery({
    queryFn: () => getReservations(Number(currentPage), pageSize, searchKeyWord),
    queryKey: ['reservations', pageSize, currentPage, searchKeyWord],
  });

  const sizes: string[] = ['10', '20', '50', '100'];

  useEffect(() => {
    if (!searchKey) {
      handleChangeParams(searchKey, 'q');
    }
  }, [searchKey]);

  if (error) return null;

  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';
  return (
    <div className="bg-white">
      <div className="w-full bg-white h-full">
        <main className="lg:gap-3 relative text-center bg-white overflow-x-hidden main-section px-6 lg:px-0 lg:h-[500px] h-[400px]">
          <section className="w-full lg:w-[50%] mx-auto space-y-4 lg:space-y-6 font-satoshi pt-12 lg:pt-24">
            <div className={sectionHeaderClass}>
              <p className="font-normal">Reserve Your Perfect Spot</p>
              {/* <ArrowRight /> */}
            </div>
            <h1 className="text-[24px] lg:text-[50px] lg:leading-[50px] text-[#161618] font-bricolage_grotesque">Reserve Your Perfect Spot</h1>
            <p className="font-normal text-dark">
              From exclusive dining to luxury stays, secure your reservations effortlessly and start creating unforgettable moments.
            </p>

            <div className="flex space-x-4 justify-center mx-6 lg:mx-36">
              <CustomInput
                classnames={'w-full'}
                label=""
                size="md"
                isRequired={false}
                startContent={<IoSearchOutline />}
                type="search"
                placeholder="Search by reservation name ..."
                value={searchKey}
                defaultValue={searchKey}
                onChange={({ target }: any) => setSearchKey(target.value)}
              />
              <CustomButton
                className="before:ease relative h-[40px] overflow-hidden border border-[#FFFFFF26] px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40"
                onClick={() => handleChangeParams(searchKey, 'q')}
                loading={isLoading}
                disabled={!searchKey}
              >
                Search
              </CustomButton>
            </div>
          </section>
        </main>

        <React.Fragment>
          {error ? null : (
            <React.Fragment>
              {isLoading ? (
                <LoadingReservations />
              ) : (
                <div className="px-6 lg:px-24 py-6 lg:py-16">
                  {data?.data.data.reservations.length === 0 ? (
                    <div className="flex justify-center text-center">
                      <div className="w-1/2 lg:w-[30%] mx-auto">
                        <Image src={EmptyIcon} alt="empty" width={120} height={120} className="mx-auto" />
                        <p className="font-light font-satoshi text-sm">
                          No matches found! Try using different keywords or adjusting the filters to see more results.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <React.Fragment>
                      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {data?.data.data.reservations.map((each: any, index: number) => (
                          <ReservationCard key={each.id + index} {...each} each={each} />
                        ))}
                      </section>

                      <div className="lg:flex justify-between mt-10 text-[#3D424A]">
                        <div className="hidden lg:flex space-x-2 font-satoshi text-sm font-light items-center">
                          <p className="">Items per page</p>
                          <Select
                            label=""
                            className="w-[100px]"
                            variant="bordered"
                            size="sm"
                            labelPlacement="inside"
                            onChange={({ target }) => handleChangeParams(target.value, 'page_size')}
                            placeholder={pageSize}
                          >
                            {sizes.map((size) => (
                              <SelectItem key={size}>{size}</SelectItem>
                            ))}
                          </Select>
                          <p>
                            Showing {pageSize} of {data?.data?.data.totalCount} reservations
                          </p>
                        </div>
                        <div>
                          <CustomPagination totalPage={data?.data?.data.totalPages} initialPage={Number(currentPage)} />
                        </div>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
        <JoinCommunity className="text-center" />
        <Footer />
      </div>
    </div>
  );
}
