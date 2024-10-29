'use client';
import StarRating from '@/components/ui/starRating';
import ZapierLogo from '@/public/assets/icons/zapier_logo.png';
import Image from 'next/image';
import Map from '@/public/assets/images/map.png';
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Bottle from '@/public/assets/images/bottle.png';
import { menus } from './data';
import { Footer } from '@/components/ui/landingPage/footer';

export default function EachBusiness() {
  const tabs: string[] = ['Menu', 'Reservations'];
  const filter: { title: string; value: string }[] = [
    { title: 'All', value: '16' },
    { title: 'Drinks', value: '16' },
    { title: 'Desert', value: '16' },
    { title: 'Breakfast', value: '16' },
  ];
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || tabs[0].toLowerCase();
  const defaultFilter = searchParams.get('filter') || filter[0].title.toLowerCase();
  const { replace, push } = useRouter();
  const pathname = usePathname();

  const handleChangeTab = useDebouncedCallback((term: string, key?: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set(key || 'q', term);
    } else {
      params.delete(key || 'q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 200);

  console.log(pathname);

  return (
    <div className="space-y-12">
      <div className="flex justify-between space-x-36 items-center">
        <div className="space-y-6 w-1/2 ">
          <div className="flex space-x-4 items-center space-y-1 text-[#3D424A]">
            <Image src={ZapierLogo} alt="Zapier logo" width={74} height={74} />
            <div>
              <h3 className="font-bricolage_grotesque text-3xl">Zapier</h3>
              <div className="flex items-center space-x-2">
                <p>520 Customers Reviews</p>
                <StarRating size="4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 text-[#677182]">
            <div className="space-y-2.5">
              <p className="text-sm text-[#161618] font-medium">Contacts</p>
              <p className="text-sm font-light">
                Manager: <span>Jerome Bell</span>
              </p>
              <p className="text-sm font-light">info@zapier.com</p>
              <p className="text-sm font-light">
                Phone: <span>+0123 456 7890</span>
              </p>
            </div>
            <div className="space-y-2.5">
              <p className="text-sm text-[#161618] font-medium">Address</p>
              <p className="text-sm font-light">
                Country: <span>California</span>
              </p>
              <p className="text-sm font-light">
                Address: <span>1440 Aston Lane Street</span>
              </p>
              <p className="text-sm font-light">
                Post Code: <span>35400</span>
              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2">
          <Image src={Map} alt="map" className="" />
        </div>
      </div>

      <div>
        <div role="tab" className="">
          <Tabs defaultValue={query} className="w-fit space-y-6" onValueChange={(value) => handleChangeTab(value)}>
            <TabsList className="border-b border-[#afb7c5]">
              {tabs.map((each) => (
                <TabsTrigger
                  className={cn(
                    'px-4 rounded-none',
                    query === each.toLowerCase() ? 'text-primaryColor border-b-2 border-b-primaryColor pb-2 font-bold' : 'text-[#848E9F]'
                  )}
                  role="button"
                  value={each.toLowerCase()}
                >
                  {each}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="menu">
              <div className="space-y-8">
                <div className="flex items-center spaxe-x-8 text-sm text-[#677182]">
                  {filter.map((each, index) => (
                    <div
                      key={each.title + index + 'menu'}
                      className="flex items-center pr-8 space-x-2 cursor-pointer"
                      role="button"
                      onClick={() => handleChangeTab(each.title.toLowerCase(), 'filter')}
                    >
                      <p className={cn(defaultFilter === each.title.toLowerCase() ? 'text-primaryColor font-bold' : '')}>{each.title}</p>
                      <div className="bg-[#F3EFFF] rounded-full text-[10px] text-primaryColor font-light h5 w-5 flex items-center justify-center">
                        {each.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-8">
                  {menus.map((each, index) => (
                    <div className="bg-white rounded-xl shadow-custom" key={each.name + index + 'bottle'} onClick={() => push(`${pathname}/book-reservation`)}>
                      <div className="bg-[#E8E8E8] rounded-xl">
                        <Image src={Bottle} alt="bottle" />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="bg-[#C1C1C126] border border-[#CBCBCB4D] rounded-full w-fit px-2 py-1 text-[#4C4C4C] text-xs">{each.type}</div>
                        <p className="text-[#161618]">{each.name}</p>
                        <p className="text-[#161618] font-bold">${each.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reservations">Change your password here.</TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
