'use client';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import { ArrowLeftIcon, ArrowRightIcon, InfoCircle, LocationIcon } from '@/public/assets/svg';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import CheckImage from '@/public/assets/images/success-image.png';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { RESERVATIONS_URL } from '@/utilities/routes';
import Footer from '@/components/ui/landingPage/footer';
import { formatNumber, getInitials2, notify, validateEmail } from '@/lib/utils';
import { BookReservationApi } from '@/app/api/controllers/landingPage';
import { IoCall } from 'react-icons/io5';
import { MdEmail } from 'react-icons/md';

interface IDetails {
  firstName: string;
  lastName: string;
  emailAddress: string;
  bookingDateTime: string;
  description: string;
}
const defaultValues = { firstName: '', lastName: '', emailAddress: '', bookingDateTime: '', description: '' };

export default function BookReservation() {
  const { back } = useRouter();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const pathnameLength = pathname.split('/').length;
  const [quantity, setQuantity] = useState<number>(1);
  const [details, setDetails] = useState<IDetails>(defaultValues);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<IDetails>(defaultValues);
  const [reservation, setReservation] = useState<any>(null);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const btnClassName =
    'before:ease relative h-[40px] mt-6 w-full overflow-hidden border border-[#FFFFFF26] px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';

  useEffect(() => {
    const reservation = typeof window !== 'undefined' && localStorage.getItem('reservation');
    if (reservation) {
      setReservation(JSON.parse(reservation));
    } else {
      redirect(RESERVATIONS_URL);
    }
    setIsClient(true);
  }, []);

  const handleBookReservation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!details.firstName) {
      setError((prev) => ({ ...prev, firstName: 'First name is compulsory' }));
    }
    if (!details.lastName) {
      setError((prev) => ({ ...prev, lastName: 'Last name is compulsory' }));
    }
    if (!details.emailAddress || !validateEmail(details.emailAddress)) {
      setError((prev) => ({ ...prev, emailAddress: 'Please enter a valid email address.' }));
    }
    if (!details.bookingDateTime) {
      setError((prev) => ({ ...prev, bookingDateTime: 'Preferred date and time is compulsory' }));
    }
    if (details.firstName && details.lastName && details.emailAddress && validateEmail(details.emailAddress) && details.bookingDateTime) {
      setIsLoading(true);
      const updateDetails = {
        ...details,
        bookingDateTime: new Date(details.bookingDateTime).toISOString(),
        reservationId: reservation?.id,
        cooperateId: reservation?.cooperateID,
        businessId: reservation?.businessID,
      };

      const data: any = await BookReservationApi(updateDetails);

      setIsLoading(false);

      if (data?.data?.isSuccessful) {
        setDetails(defaultValues);
        setOpen(true);
      } else if (data?.data?.error) {
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
      }
    }
  };

  return (
    <div className="font-satoshi px-6 lg:px-24 space-y-4 mt-8">
      <div className="flex items-center space-x-2.5 text-sm">
        <div className="bg-[#EDE7FD] border border-[#5F35D24D] rounded-md w-8 h-8 flex items-center justify-center" role="button" onClick={() => back()}>
          <ArrowLeftIcon width={20} height={20} />
        </div>

        <div className="flex items-center space-x-2.5">
          <p onClick={() => back()} role="button" className="text-[#848E9F]">
            Customer
          </p>
          <ArrowRightIcon width={20} height={20} />
        </div>
        <p className="font-bold text-[#848E9F] capitalize" role="button">
          {reservation?.businessName || ''}
        </p>
        {pathnameLength === 4 && (
          <React.Fragment>
            <ArrowRightIcon width={20} height={20} />
            <p className="font-bold text-[#161618]">Book Reservation</p>
          </React.Fragment>
        )}
      </div>

      <section className="space-y-10">
        <div className="space-y-2 text-[#161618]">
          <div className="flex items-center space-x-2">
            <h1 className="text-[32px] font-bricolage_grotesque">Book Reservation</h1>
          </div>
          <p className="text-sm">Please provide your details below to book this reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <div>
            <form autoComplete="off" className="block">
              <div className="flex space-x-8">
                <CustomInput
                  name="firstName"
                  type="text"
                  label="First name"
                  placeholder="Enter your first name"
                  defaultValue={details.firstName}
                  value={details.firstName}
                  onChange={({ target }: any) => setDetails((prev) => ({ ...prev, firstName: target.value }))}
                  errorMessage={error.firstName}
                />
                <CustomInput
                  name="lastName"
                  type="text"
                  label="Last name"
                  placeholder="Enter your last name"
                  defaultValue={details.lastName}
                  value={details.lastName}
                  onChange={({ target }: any) => setDetails((prev) => ({ ...prev, lastName: target.value }))}
                  errorMessage={error.lastName}
                />
              </div>
              <CustomInput
                name="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                classnames="mt-6"
                defaultValue={details.emailAddress}
                value={details.emailAddress}
                onChange={({ target }: any) => setDetails((prev) => ({ ...prev, emailAddress: target.value }))}
                errorMessage={error.emailAddress}
              />
              <CustomInput
                name="date"
                type="datetime-local"
                label="Reservation date"
                placeholder="DD/MM/YY, 00 : 00 AM"
                classnames="mt-6"
                defaultValue={details.bookingDateTime}
                value={details.bookingDateTime}
                onChange={({ target }: any) => setDetails((prev) => ({ ...prev, bookingDateTime: target.value }))}
                errorMessage={error.bookingDateTime}
              />
              <div className="mt-4">
                <CustomTextArea
                  name="description"
                  label="Add a description for this reservation"
                  placeholder="Describe your reservation"
                  defaultValue={details.description}
                  value={details.description}
                  onChange={({ target }: any) => setDetails((prev) => ({ ...prev, description: target.value }))}
                  errorMessage={error.description}
                />
              </div>
              <div className="lg:flex hidden">
                <CustomButton className={btnClassName} onClick={handleBookReservation} loading={isLoading}>
                  Book Reservation
                </CustomButton>
              </div>
            </form>
          </div>

          <div className="lg:space-y-6 space-y-6 lg:-mt-16">
            <div className="space-y-1.5">
              <p className="text-lg font-medium text-[#161618]">Selected Reservation</p>
              <div className="flex space-x-2 items-center text-sm text-[#161618]">
                <LocationIcon />
                <p>{reservation?.businessAddress}</p>
              </div>
            </div>
            {isClient && (
              <div className="border border-[#E4E7EC] py-4 px-5 rounded-lg space-y-6">
                <div className="flex border-b border-b-[#E4E7EC] pb-6 items-start space-x-4">
                  <div className="w-[75px] lg:w-[150px] h-fit rounded-lg">
                    {reservation?.image ? (
                      <Image
                        src={`data:image/png;base64,${reservation?.image}`}
                        alt="bottle"
                        className="rounded-lg w-full h-full object-contain"
                        width={150}
                        height={150}
                      />
                    ) : (
                      <div className="w-full h-[75px] lg:h-[150px] rounded-lg bg-[#DDDCFE] text-primaryColor font-medium text-[40px] lg:text-[80px] font-bricolage_grotesque flex items-center justify-center">
                        <p>{getInitials2(reservation?.businessName)}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-[#3D424A]">
                    <p className="font-medium">{reservation?.reservationName || ''}</p>
                    <p className="text-sm font-light">{reservation?.reservationDescription || ''}</p>
                  </div>
                </div>

                <div className="space-y-4 border-b border-b-[#E4E7EC]  pb-6">
                  <div className="text-sm flex justify-between">
                    <div className="text-[#808B9F] flex space-x-2 items-center">
                      <p>Minimum Spend</p>
                      <InfoCircle />
                    </div>
                    <p className="text-[#808B9F]">₦{formatNumber(reservation?.minimumSpend || 0)}.00</p>
                  </div>

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Reservation fee</p>
                      <InfoCircle />
                    </div>
                    <p className="text-[#404245]">₦{formatNumber(reservation?.reservationFee || 0)}.00</p>
                  </div>

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Quantity</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <button
                        className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7"
                        disabled={quantity <= 1}
                        role="button"
                        onClick={() => {
                          quantity > 1 ? setQuantity((prev) => prev - 1) : null;
                        }}
                      >
                        -
                      </button>
                      <p className="font-medium w-4 flex justify-center items-center">{quantity}</p>
                      <div
                        className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7"
                        role="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        +
                      </div>
                    </div>
                  </div>
                </div>

                <div className="font-bold flex justify-between text-[#404245]">
                  <p>Total</p>
                  <p className="opacity-20">₦{formatNumber(Number(reservation?.reservationFee || 0) * quantity)}.00</p>
                </div>

                <div className="bg-[#F0F2F4] p-4 text-[#5A5A63] flex items-baseline space-x-2 rounded-lg">
                  <InfoCircle className="mt-1" />
                  <p>The minimum spend is the amount you’re required to spend when visiting this restaurant.</p>
                </div>
              </div>
            )}
            <div className="lg:hidden flex">
              <CustomButton className={btnClassName} onClick={handleBookReservation} loading={isLoading}>
                Book Reservation
              </CustomButton>
            </div>

            <div className="text-[#161618] border border-[#E4E7EC] py-2 px-4 rounded-lg space-y-2">
              <p className="font-semibold">Locate {reservation?.businessName || '-'}</p>
              <div className="flex space-x-2 items-center">
                <LocationIcon />
                <p>{reservation?.businessAddress || '-'}</p>
              </div>
              <div className="flex space-x-2 items-center">
                <IoCall color="848E9E" />
                <p>{reservation?.businessPhoneNumber || '-'}</p>
              </div>
              <div className="flex space-x-2 items-center">
                <MdEmail color="848E9E" />
                <p>{reservation?.businessEmailAddress || '-'}</p>
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
            <CustomButton className={btnClassName} onClick={() => router.push(`/${RESERVATIONS_URL}`)}>
              Done
            </CustomButton>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
