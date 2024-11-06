'use client';
import Navbar from '@/components/ui/landingPage/navBar';
import { ContactIcon } from '@/public/assets/svg';
import ContactUsBg from '@/public/assets/images/contact-us-bg.png';
import DashboardImage from '@/public/assets/images/dashboard-image-2.png';
import HobinkLogo from '@/public/assets/icons/hobink-iconpng.png';
import Image from 'next/image';
import { CustomInput } from '@/components/CustomInput';
import { CustomTextArea } from '@/components/customTextArea';
import { CustomButton } from '@/components/customButton';
import FAQs from '@/components/ui/landingPage/faq';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import { Transition } from '@/components/ui/landingPage/transition';
import Footer from '@/components/ui/landingPage/footer';

export default function Contact() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };
  return (
    <div className="w-full bg-white">
      <header className="z-[100] backdrop-filter backdrop-blur-md fixed w-full">
        <Navbar type="default" />
      </header>
      <main>
        <section className="font-satoshi bg-white w-full pt-32 space-y-12">
          <div className={sectionHeaderClass}>
            <ContactIcon className="text-[#5F35D2]" />
            <p className="font-normal">Content</p>
          </div>
          <div className="w-[65%] mx-auto text-center">
            <h2 className="text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque">Talk to us</h2>
          </div>

          <div className="bg-[#5F35D2] rounded-xl relative w-[80%] mx-auto">
            <Image src={ContactUsBg} alt="" className="absolute top-0" priority />
            <div className="flex">
              <Image src={DashboardImage} alt="Dashboard image" className="mx-auto w-[85%] z-50 mt-10 mr-12" />
            </div>

            <Transition>
              <div className="grid grid-cols-2 gap-12 bg-[#DDD1FF] px-8 py-10 rounded-b-xl">
                <form onSubmit={submitFormData} autoComplete="off" className="space-y-8">
                  <CustomInput type="text" name="name" label="What’s your name?" placeholder="yourname" classnames="font-light" />

                  <CustomInput type="email" name="email" label="Email Address" placeholder="yourname@gmail.com" classnames="font-light mt-4" />

                  <CustomTextArea name="question" label="What’s your question?" placeholder="Describe your questions here.." classnames="font-light -pt-6" />
                  <div>
                    <CustomButton className="h-10 w-full text-white -mt-6">Submit</CustomButton>
                  </div>
                </form>

                <div className="font-satoshi space-y-8 w-[55%]">
                  <Image src={HobinkLogo} alt="hobink logo" width={50} height={50} />
                  <div className="space-y-6">
                    <h4 className="font-bricolage_grotesque text-[20px] text-[#252525]">Prefer email?</h4>
                    <a href="mailto: hello@hobink.com" target="_blank" className="text-primaryColor underline font-medium">
                      hello@hobink.com
                    </a>
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-bricolage_grotesque text-[20px] text-[#252525]">Prefer docs?</h4>
                    <p className="text-[#252525]">
                      Check out our{' '}
                      <span>
                        <a href="#" target="_blank" className="text-primaryColor underline">
                          documentation
                        </a>
                      </span>
                    </p>
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-bricolage_grotesque text-[20px] text-[#252525]">Office Headquarters</h4>
                    <p className="text-[#252525]">San Francisco, West Coast Headquarter Suite 3241</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </section>

        <section className="pt-20">
          <FAQs />
        </section>

        <JoinCommunity className="text-center" />
      </main>
      <Footer />
    </div>
  );
}
