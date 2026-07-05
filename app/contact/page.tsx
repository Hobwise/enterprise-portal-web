"use client";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
import { CustomTextArea } from "@/components/customTextArea";
import FAQs from "@/components/ui/landingPage/faq";
import JoinCommunity from "@/components/ui/landingPage/joinCommunity";
import LandingFooter from "@/components/ui/landingPage/v2/footer";
import LandingNav from "@/components/ui/landingPage/v2/nav";
import Campaigns from "@/components/ui/landingPage/campaigns";
import { notify, validateEmail } from "@/lib/utils";
import Hobwise from "@/public/assets/images/hobwise.png";
import ContactBanner from "@/public/assets/images/contact-banner.png";
import ContactBannerMobile from "@/public/assets/images/contact-banner-mobile.png";
import { ContactIcon } from "@/public/assets/svg";
import Image from "next/image";
import { useState } from "react";
import { ContactUs } from "../api/controllers/landingPage";
import { toast } from "sonner";
import { PRIVACY_POLICY } from "@/utilities/routes";
import Link from "next/link";

export default function Contact() {
  const defaultErrorValue = { name: "", email: "", message: "" };
  const [contactInfo, setContactInfo] = useState<{
    name: string;
    email: string;
    message: string;
  }>({ name: "", email: "", message: "" });
  const [error, setError] = useState(defaultErrorValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sectionHeaderClass: string =
    "flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset";

  const submitFormData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!contactInfo.name) {
      setError((prev) => ({ ...prev, name: "Name is compulsory" }));
    }
    if (!contactInfo.email || !validateEmail(contactInfo.email)) {
      setError((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
    }
    if (!contactInfo.message) {
      setError((prev) => ({ ...prev, message: "Question is compulsory" }));
    }
    if (
      contactInfo.name &&
      contactInfo.email &&
      validateEmail(contactInfo.email) &&
      contactInfo.message
    ) {
      setIsLoading(true);
      const data: any = await ContactUs(contactInfo);

      setIsLoading(false);

      if (data?.data?.isSuccessful) {
        setContactInfo({ name: "", email: "", message: "" });
        toast.success("You're successfully added to our waitlist");
      } else if (data?.data?.error) {
        notify({
          title: "Error!",
          text: data?.data?.error,
          type: "error",
        });
      }
    }
  };

  return (
    <div className="w-full bg-white">
      <LandingNav />
      <main>
        <section className="font-satoshi bg-white w-full pt-28 lg:pt-32 pb-8 space-y-8 lg:space-y-10 px-6 lg:px-12">
          <div className={sectionHeaderClass}>
            <ContactIcon className="text-[#5F35D2]" />
            <p className="font-normal">Contact</p>
          </div>
          <div className="w-full text-center">
            <h2 className="text-[32px] lg:text-[44px] text-[#1D2939] lg:leading-[52px] font-bricolage_grotesque font-bold">
              Talk to us
            </h2>
          </div>

          <div className="rounded-3xl overflow-hidden w-full lg:w-[80%] mx-auto bg-[#EAE3FB]">
            <div className="bg-[#F4E1DC] p-4 lg:p-6">
              <Image
                src={ContactBanner}
                alt="Talk to us"
                priority
                className="hidden lg:block w-full h-[240px] object-cover rounded-2xl"
              />
              <Image
                src={ContactBannerMobile}
                alt="Talk to us"
                priority
                className="lg:hidden w-full h-[180px] object-cover rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 px-6 lg:px-10 py-8 lg:py-10">
              <form autoComplete="off" className="space-y-6">
                <CustomInput
                  type="text"
                  name="name"
                  label="What’s your name?"
                  placeholder="yourname"
                  classnames="font-light"
                  value={contactInfo.name}
                  defaultValue=""
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, name: "" }));
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
                    setError((prev) => ({ ...prev, email: "" }));
                    setContactInfo((prev) => ({
                      ...prev,
                      email: target.value,
                    }));
                  }}
                  errorMessage={error.email}
                />
                <div className="relative h-[136px]">
                  <CustomTextArea
                    name="question"
                    label="What’s your question?"
                    placeholder="Describe your questions here.."
                    classnames="font-light"
                    defaultValue=""
                    value={contactInfo.message}
                    onChange={({ target }: any) => {
                      setError((prev) => ({ ...prev, message: "" }));
                      target.value.length <= 100
                        ? setContactInfo((prev) => ({
                            ...prev,
                            message: target.value,
                          }))
                        : setError((prev) => ({
                            ...prev,
                            message:
                              "Question should be less than 100 characters",
                          }));
                    }}
                    errorMessage={error.message}
                  />
                </div>
                <div>
                  <CustomButton
                    className="h-11 w-full text-white -mt-6"
                    type="button"
                    onClick={submitFormData}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Submit
                  </CustomButton>
                </div>
              </form>

              <div className="font-satoshi space-y-6">
                <Image src={Hobwise} alt="Hobwise" width={150} />
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque font-bold text-[18px] lg:text-[20px] text-[#1D2939]">
                    Prefer email?
                  </h4>
                  <a
                    href="mailto:hello@hobwise.com"
                    target="_blank"
                    className="text-primaryColor underline font-medium"
                  >
                    hello@hobwise.com
                  </a>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque font-bold text-[18px] lg:text-[20px] text-[#1D2939]">
                    Call Us
                  </h4>
                  <a
                    href="tel:+2348123456789"
                    className="text-primaryColor underline font-medium"
                  >
                    +234 812 345 6789
                  </a>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque font-bold text-[18px] lg:text-[20px] text-[#1D2939]">
                    Prefer docs?
                  </h4>
                  <p className="text-[#475467]">
                    Check out our{" "}
                    <Link
                      href={`${PRIVACY_POLICY}`}
                      className="text-primaryColor underline"
                    >
                      documentation
                    </Link>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bricolage_grotesque font-bold text-[18px] lg:text-[20px] text-[#1D2939]">
                    Office Headquarters
                  </h4>
                  <p className="text-[#475467]">
                    Bouvardia Court Ota Iku Street Off Gbangbala Street Ikate
                    Lekki
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Campaigns />

        <FAQs />

        <JoinCommunity className="text-center" />
      </main>
      <LandingFooter />
    </div>
  );
}
