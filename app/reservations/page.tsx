'use client';
import { CustomInput } from '@/components/CustomInput';
import Navbar from '@/components/ui/landingPage/navBar';
import { ArrowDown, CompanyLogo_1, ListItemIcon } from '@/public/assets/svg';
import React, { useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { columns } from './columns';
import { allReservations, companyFilter } from './data';
import Image from 'next/image';
import { CustomButton } from '@/components/customButton';
import { Footer } from '@/components/ui/landingPage/footer';
import { Popover, PopoverTrigger, PopoverContent, Button, Slider } from '@nextui-org/react';
import { CheckboxGroup, Checkbox } from '@nextui-org/react';
import StarRating from '@/components/ui/starRating';
import { Transition } from '@/components/ui/landingPage/transition';

export default function Reservations() {
  const [value, setValue] = React.useState<any>([100, 300]);
  const [open, setOpen] = useState<boolean>(false);
  const btnClassName =
    'before:ease relative h-[40px] mt-4 overflow-hidden w-full border border-[#FFFFFF26] px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';

  return (
    <React.Fragment>
      <div className="w-full bg-white">
        <header className="z-[50] backdrop-filter backdrop-blur-md fixed w-full">
          <Navbar />
        </header>
      </div>
      <section className="bg-white pt-32 px-12 pb-10 text-[#161618] space-y-10 font-satoshi">
        <div className="flex justify-between items-center">
          <h1 className="font-bricolage_grotesque text-3xl font-medium">All Reservations</h1>
          <div className="flex space-x-2">
            <CustomInput
              classnames={'w-[242px]'}
              label=""
              size="md"
              isRequired={false}
              startContent={<IoSearchOutline />}
              type="text"
              placeholder="Search here..."
            />

            <Popover placement="bottom-end" showArrow={true}>
              <PopoverTrigger>
                <div className="flex space-x-2 items-center border border-[#D0D5DD] rounded-lg px-2 text-sm" role="button">
                  <ListItemIcon />
                  <p>Filter</p>
                </div>
              </PopoverTrigger>
              <PopoverContent className="px-0 text-left w-[300px] justify-start flex font-satoshi overflow-y-auto h-[75vh]">
                <div className="text-left w-full">
                  <h1 className="text-xl font-medium px-4 py-2">Filters</h1>
                  <div className="border-[0.5px] border-[#E4E7EC]" />

                  <div className="px-4 py-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-lg">Customers</p>
                      <ArrowDown className="text-dark" />
                    </div>

                    <div className="space-y-4">
                      <CustomInput
                        classnames={'w-full'}
                        label=""
                        size="md"
                        isRequired={false}
                        startContent={<IoSearchOutline />}
                        type="text"
                        placeholder="Search here..."
                      />

                      <CheckboxGroup label="" color="secondary" defaultValue={[companyFilter[0].name]}>
                        {companyFilter.map((each) => (
                          <Checkbox value={each.name} className="mt-1.5">
                            <div className="flex items-center space-x-2">
                              {each.logo}
                              <p className="font-light text-sm">{each.name}</p>
                            </div>
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </div>
                  </div>
                  <div className="border-[0.5px] border-[#E4E7EC] mt-6" />

                  <div className="px-4 pt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-lg">Customers rating</p>
                      <ArrowDown className="text-dark" />
                    </div>

                    <CheckboxGroup label="" color="secondary" defaultValue={[companyFilter[0].name]}>
                      {Array.from({ length: Number(5) }, (_, index) => Number(index + 1).toString()).map((each) => (
                        <Checkbox value={each} className="mt-1.5">
                          <StarRating size={each} />
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </div>

                  <div className="border-[0.5px] border-[#E4E7EC] mt-6" />
                  <div className="px-4 pt-2 space-y-2 border-e">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-lg">Price range</p>
                      <ArrowDown className="text-dark" />
                    </div>

                    <Slider
                      label=""
                      //   formatOptions={{ style: 'currency', currency: 'USD' }}
                      step={10}
                      maxValue={1000}
                      size="sm"
                      minValue={0}
                      value={value}
                      onChange={setValue}
                      color="secondary"
                      className="max-w-full h-1"
                      classNames={{
                        base: 'max-w-md gap-3 h-1',
                        track: 'border-x-[#E6E3F0] ',
                        filler: 'bg-primaryColor',
                      }}
                    />

                    <div className="flex space-x-4 mt-4">
                      <CustomInput placeholder="0" type="number" label="Min" classnames="mt-6 h-10" />
                      <CustomInput placeholder="99999" type="number" label="Max" classnames="mt-6 h-10" />
                    </div>
                  </div>

                  <div className="border-[0.5px] border-[#E4E7EC] mt-6" />

                  <div className="px-4 pb-2">
                    <CustomButton className={btnClassName}>Apply</CustomButton>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="border border-[#E4E7EC] bg-white text-[#344054] rounded-lg">
          <div className="grid grid-cols-6 gap-4 bg-[#F9FAFB] py-4 px-4 rounded-tr-lg rounded-tl-lg">
            {columns.map((each) => (
              <p key={each.name} className="font-light text-xs">
                {each.name}
              </p>
            ))}
          </div>
          <div className="bg-white">
            {allReservations.map((each, index) => (
              <Transition>
                <div
                  className="grid grid-cols-6 gap-4 py-4 text-sm px-4 rounded-tr-lg rounded-tl-lg border-b border-b-[#E4E7EC80]"
                  key={each.minimum_spend + index.toString()}
                >
                  <div className="-space-y-1">
                    <div>{each.logo}</div>
                    <p className="text-sm">{each.company_name}</p>
                  </div>

                  <div className="flex space-x-4">
                    <Image src={each.reservation.product_image} alt={each.company_name} className="object-contain h-16 w-16" />
                    <div className="space-y-2">
                      <p className="font-bold">{each.reservation.type}</p>
                      <div>
                        <p className="text-[13px] font-light">Reservation fee</p>
                        <p className="font-bold">₦{each.reservation.fee}</p>
                      </div>
                    </div>
                  </div>

                  <p className="font-bold">{each.quantity}</p>
                  <p className="font-bold">₦{each.minimum_spend}</p>
                  <p className="font-light">{each.description}</p>
                  <div className="flex justify-end">
                    <CustomButton className="border border-primaryColor bg-[#DDDCFE] text-primaryColor w-[80%]">Book Reservation</CustomButton>
                  </div>
                </div>
              </Transition>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </React.Fragment>
  );
}
