'use client';
import { CustomButton } from '@/components/customButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomTextArea } from '@/components/customTextArea';
import FAQs from '@/components/ui/landingPage/faq';
import Footer from '@/components/ui/landingPage/footer';
import Navbar from '@/components/ui/landingPage/navBar';
import { notify, phoneNumberPattern, validateEmail } from '@/lib/utils';
import HobwiseIcon from '@/public/assets/icons/hobwise-icon.png';
import ContactUsBg from '@/public/assets/images/contact-us-bg.png';
import DashboardImage from '@/public/assets/images/dashboard-image-2.png';
import { ContactIcon } from '@/public/assets/svg';
import Image from 'next/image';
import { useState } from 'react';
import { BookDemo } from '../api/controllers/landingPage';
import { toast } from 'sonner';
import { PRIVACY_POLICY } from '@/utilities/routes';
import Link from 'next/link';
import moment from 'moment';

export default function Contact() {
  const defaultValue = {
    name: '',
    email: '',
    notes: '',
    preferredDateTime: '',
    phoneNumber: '',
  };
  const [contactInfo, setContactInfo] = useState(defaultValue);
  const [error, setError] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';

  const submitFormData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!contactInfo.name) {
      setError((prev) => ({ ...prev, name: 'Name is compulsory' }));
    }
    if (!contactInfo.email || !validateEmail(contactInfo.email)) {
      setError((prev) => ({
        ...prev,
        email: 'Please enter a valid email address.',
      }));
    }
    if (!contactInfo.phoneNumber) {
      setError((prev) => ({
        ...prev,
        phoneNumber: 'Phone number is compulsory',
      }));
    }
    if (!contactInfo.preferredDateTime) {
      setError((prev) => ({
        ...prev,
        preferredDateTime: 'Preferred date and time is compulsory',
      }));
    }
    if (contactInfo.name && contactInfo.phoneNumber && contactInfo.email && validateEmail(contactInfo.email) && contactInfo.preferredDateTime) {
      setIsLoading(true);
      const updateContactInfo = {
        ...contactInfo,
        preferredDateTime: moment(contactInfo.preferredDateTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      };

      const data: any = await BookDemo(updateContactInfo);

      setIsLoading(false);

      if (data?.data?.isSuccessful) {
        setContactInfo(defaultValue);
        toast.success('Demo booked successully. Calendar invites has been sent to your email');
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
    <div className="w-full bg-white">
      <header className="z-[100] backdrop-filter backdrop-blur-md fixed w-full">
        <Navbar type="default" />
      </header>
      <main>
        <section className="font-satoshi bg-white w-full pt-28 space-y-8">
          <div className={sectionHeaderClass}>
            <ContactIcon className="text-[#5F35D2]" />
            <p className="font-normal">Requests</p>
          </div>
          <div className="w-[65%] mx-auto text-center">
            <h2 className="text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque">Book a demo</h2>
          </div>

          <div className="bg-[#5F35D2] rounded-xl relative w-[80%] mx-auto">
            <Image src={ContactUsBg} alt="" className="absolute top-0" priority />
            <div className="flex">
              <Image src={DashboardImage} alt="Dashboard image" className="mx-auto w-[75%] lg:w-[85%] z-50 mt-10 lg:mr-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white lg:bg-[#DDD1FF] px-8 py-10 rounded-b-xl">
              <form autoComplete="off" className="space-y-8">
                <CustomInput
                  type="text"
                  name="name"
                  label="What’s your name?"
                  placeholder="yourname"
                  classnames="font-light"
                  value={contactInfo.name}
                  defaultValue=""
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, name: '' }));
                    setContactInfo((prev) => ({ ...prev, name: target.value }));
                  }}
                  errorMessage={error.name}
                />
                <CustomInput
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="yourname@gmail.com"
                  defaultValue=""
                  classnames="font-light mt-4"
                  value={contactInfo.email}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, email: '' }));
                    setContactInfo((prev) => ({
                      ...prev,
                      email: target.value,
                    }));
                  }}
                  errorMessage={error.email}
                />
                <CustomInput
                  type="tel"
                  onChange={({ target }: any) => {
                    const { value } = target;

                    // Validate phone number against the pattern
                    if (!phoneNumberPattern.test(value)) {
                      setError((prev) => ({
                        ...prev,
                        phoneNumber: 'Invalid phone number format',
                      }));
                    } else {
                      setError((prev) => ({ ...prev, phoneNumber: '' }));
                    }

                    setContactInfo((prev) => ({
                      ...prev,
                      phoneNumber: value,
                    }));
                  }}
                  value={contactInfo.phoneNumber}
                  defaultValue=""
                  name="phoneNumber"
                  classnames="mt-4"
                  label="Phone number"
                  placeholder="Enter phone number"
                  errorMessage={error.phoneNumber}
                />
                <CustomInput
                  type="datetime-local"
                  name="preferredDateTime"
                  label="Preferred Date"
                  placeholder="Preferred date"
                  defaultValue=""
                  classnames="font-light mt-4"
                  value={contactInfo.preferredDateTime}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, preferredDateTime: '' }));
                    setContactInfo((prev) => ({
                      ...prev,
                      preferredDateTime: target.value,
                    }));
                  }}
                  errorMessage={error.preferredDateTime}
                />
                <CustomTextArea
                  name="question"
                  label="What’s your question?"
                  placeholder="Describe your questions here.."
                  classnames="font-light -pt-8"
                  defaultValue=""
                  value={contactInfo.notes}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, notes: '' }));
                    setContactInfo((prev) => ({
                      ...prev,
                      notes: target.value,
                    }));
                  }}
                  errorMessage={error.notes}
                />
                <div>
                  <CustomButton className="h-10 w-full text-white -mt-6" type="button" onClick={submitFormData} loading={isLoading} disabled={isLoading}>
                    Submit
                  </CustomButton>
                </div>
              </form>

              <div className="font-satoshi space-y-4 w-[55%]">
                <Image src={HobwiseIcon} alt="hobwise logo" width={50} height={50} />
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque text-[20px] text-[#252525]">Prefer email?</h4>
                  <a href="mailto: hello@hobwise.com" target="_blank" className="text-primaryColor underline font-medium">
                    hello@hobwise.com
                  </a>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque text-[20px] text-[#252525]">Prefer docs?</h4>
                  <p className="text-[#252525]">
                    Check out our{' '}
                    <span>
                      <Link href={`${PRIVACY_POLICY}`} className="text-primaryColor underline">
                        documentation
                      </Link>
                    </span>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque text-[20px] text-[#252525]">Office Headquarters</h4>

                  <p className="text-[#252525]">Bouvardia Court Ota Iku Street Off Gbangbala Street Ikate Lekki</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-20">
          <FAQs />
        </section>
      </main>
      <Footer />
    </div>
  );
}
