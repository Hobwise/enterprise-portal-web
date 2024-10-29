'use client';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import { CompanyLogo_3, InfoCircle } from '@/public/assets/svg';
import Bottle from '@/public/assets/images/bottle.png';
import Image from 'next/image';
import React, { useState } from 'react';
import { Footer } from '@/components/ui/landingPage/footer';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import CheckImage from '@/public/assets/images/success-image.png';
import { useRouter } from 'next/navigation';
import { BUSINESS_URL } from '@/utilities/routes';

export default function BookReservation() {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const btnClassName =
    'before:ease relative h-[40px] mt-6 w-full overflow-hidden border border-[#FFFFFF26] px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';
  return (
    <div>
      <section className="space-y-10">
        <div className="space-y-2 text-[#161618]">
          <div className="flex items-center space-x-2">
            <CompanyLogo_3 />
            <h1 className="text-[32px] font-bricolage_grotesque">Book Reservation</h1>
          </div>
          <p className="text-sm">Please provide your details below to book this reservation</p>
        </div>

        <div className="grid grid-cols-2 gap-20">
          <div>
            <form
              autoComplete="off"
              className="block"
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(true);
              }}
            >
              <div className="flex space-x-8">
                <CustomInput name="firstName" type="text" label="First name" placeholder="Enter your first name" />
                <CustomInput name="lastName" type="text" label="Last name" placeholder="Enter your last name" />
              </div>
              <CustomInput name="email" type="email" label="Email" placeholder="Enter your email" classnames="mt-6" />
              <CustomInput name="date" type="datetime-local" label="Reservation date" placeholder="DD/MM/YY, 00 : 00 AM" classnames="my-6" />
              <CustomTextArea name="description" label="Add a description for this reservation" placeholder="Describe your reservation" />
              <CustomButton className={btnClassName}>Book Reservation</CustomButton>
            </form>
          </div>
          <div className="space-y-6">
            <p className="text-lg font-medium text-[#161618]">Selected Reservation</p>
            <div className="border border-[#E4E7EC] py-4 px-5 rounded-lg space-y-6">
              <div className="flex border-b border-b-[#E4E7EC] pb-6">
                <div className="w-[204px] h-fit rounded-lg">
                  <Image src={Bottle} alt="bottle" className="rounded-lg w-full h-full object-contain" />
                </div>
                <div className="text-[#3D424A]">
                  <p className="font-medium">Table for 3</p>
                  <p className="text-sm font-light">
                    Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-b border-b-[#E4E7EC]  pb-6">
                <div className="text-sm flex justify-between">
                  <div className="text-[#808B9F] flex space-x-2 items-center">
                    <p>Minimum Spend</p>
                    <InfoCircle />
                  </div>
                  <p className="text-[#808B9F]">₦250,000.00</p>
                </div>

                <div className="text-sm flex justify-between">
                  <div className="text-[#404245] flex space-x-2 items-center">
                    <p>Reservation fee</p>
                    <InfoCircle />
                  </div>
                  <p className="text-[#404245]">₦250,000.00</p>
                </div>

                <div className="text-sm flex justify-between">
                  <div className="text-[#404245] flex space-x-2 items-center">
                    <p>Quantity</p>
                    <InfoCircle />
                  </div>
                  <div className="flex space-x-4 text-[#000] items-center">
                    <div className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7" role="button">
                      -
                    </div>
                    <p className="font-medium">1</p>
                    <div className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7" role="button">
                      +
                    </div>
                  </div>
                </div>
              </div>

              <div className="font-bold flex justify-between text-[#404245]">
                <p>Total</p>
                <p>₦20,000.00</p>
              </div>

              <div className="bg-[#F0F2F4] p-4 text-[#5A5A63] flex items-baseline space-x-2 rounded-lg">
                <InfoCircle className="mt-1" />
                <p>The minimum spend is the amount you’re required to spend when visiting this restaurant.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalBody className="text-center px-10 py-8">
            <Image src={CheckImage} alt="Success" width={90} height={90} className="mx-auto" />
            <h1 className="text-[#000] text-xl font-bricolage_grotesque">Reservation has been booked!</h1>
            <p className="text-[#475367] font-satoshi">You’ll get an email after details of your reservation has been confirmed.</p>
            <CustomButton className={btnClassName} onClick={() => router.push(`/${BUSINESS_URL}`)}>
              Done
            </CustomButton>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
