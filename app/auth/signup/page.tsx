import SignupForm from '@/components/ui/auth/signupForm';
import { companyInfo } from "@/lib/companyInfo";
import Image from "next/image";
import Link from "next/link";
import OnboardingImage from "@/public/assets/images/onboarding-image.png";
import { HOME_URL } from "@/utilities/routes";

export const metadata = {
  title: `${companyInfo.name}| Create account`,
  description: "Streamline your business processes",
};

export default function Signup() {
  const loginBgColor = "bg-[#160051]";
  const textColor = "text-white";
  const linkColor = "text-secondaryColor hover:text-secondaryColor/80";

  return (
    <main
      className={`flex min-h-screen font-bricolage_grotesque ${loginBgColor} ${textColor}`}
    >
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
      <div className="w-full lg:w-2/3 flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <div className="flex justify-center mb-8 lg:mb-12">
            <Image
              src="/assets/icons/hobwise-icon.png"
              height={60}
              width={60}
              className="bg-contain rounded-full"
              alt="Hobwise logo"
            />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold mb-3">Create Account</h1>
            <p className={`text-base text-gray-400`}>
              Already have an account?{" "}
              <Link href="/auth/login" className={`font-semibold ${linkColor}`}>
                Log In
              </Link>
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
