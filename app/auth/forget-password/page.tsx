import BackButton from "@/components/backButton";
import EntryPoint from "@/components/ui/auth/forget-password/EntryPoint";
import { companyInfo } from "../../../lib/companyInfo";
import Image from "next/image";
import Link from "next/link";
import OnboardingImage from "@/public/assets/images/onboarding-image.png";
import { HOME_URL } from "@/utilities/routes";

export const metadata = {
  title: `${companyInfo.name} | Forget Password`,
  description: "Streamline your business processes",
};
type SearchParams = Promise<{ [key: string]: any }>;

const ForgetPassword = async ({
  searchParams,
}: {
  searchParams?: SearchParams;
}) => {
  const query = await searchParams;
  const loginBgColor = "bg-[#160051]";
  const textColor = "text-white";

  return (
    <main
      className={`flex min-h-screen font-bricolage_grotesque ${loginBgColor} ${textColor}`}
    >
      {/* Left side - Image Section */}
      <div className="hidden lg:flex lg:w-1/3 relative p-0">
        <div className="relative w-full h-[86%] z-20">
          <Image
            src={OnboardingImage}
            fill
            style={{ objectFit: "cover" }}
            alt="Bartender preparing a drink"
            priority
          />
        </div>
        <div className="absolute top-16 left-16 w-full h-[86%] bg-[#160161]" />
        <div className="absolute bottom-12 mx-auto left-0 right-0 text-center px-4 z-20">
          <Link
            href={HOME_URL}
            className="bg-white/10 backdrop-blur-md text-secondaryColor xl:px-16 px-8 py-4 rounded-xl font-semibold
                       hover:bg-white/20 transition-all border border-white/20 text-sm shadow-lg text-nowrap"
          >
            Continue Exploring our website here
          </Link>
        </div>
      </div>

      {/* Right side - Form Section */}
      <div className="w-full lg:w-2/3 flex items-center justify-center py-12 px-4 sm:px-8 relative">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <div className="flex justify-center mb-8 lg:mb-12">
            <Link className="block" href={HOME_URL}>
              <Image
                src="/assets/icons/hobwise-icon.png"
                height={60}
                width={60}
                className="bg-contain rounded-full"
                alt="Hobwise logo"
              />
            </Link>
          </div>

          {/* Form */}
          <EntryPoint
            userEmail={query?.email}
            screenNumber={Number(query?.screen)}
            isForced={query?.forced === "true"}
          />
        </div>
      </div>
    </main>
  );
};

export default ForgetPassword;
