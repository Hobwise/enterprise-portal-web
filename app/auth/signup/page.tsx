import SignupForm from "@/components/ui/auth/signupForm";
import AuthLeftPanel from "@/components/ui/auth/AuthLeftPanel";
import { companyInfo } from "@/lib/companyInfo";
import Image from "next/image";
import Link from "next/link";
import { LuUserPlus } from "react-icons/lu";

export const metadata = {
  title: `${companyInfo.name}| Create account`,
  description: "Streamline your business processes",
};

export default function Signup() {
  return (
    <main className="flex min-h-screen font-bricolage_grotesque">
      <AuthLeftPanel />

      <div className="relative flex min-h-screen w-full items-center justify-center bg-[#160151] px-4 py-10 sm:px-8 lg:w-1/2 lg:bg-[#F3F4F6] lg:px-10 lg:py-12">
        <div className="w-full max-w-[460px]">
          <div className="mb-6 flex justify-center lg:hidden">
            <Image
              src="/assets/icons/hobwise-logo.png"
              height={56}
              width={56}
              className="rounded-xl"
              alt="Hobwise logo"
              priority
            />
          </div>

          <div className="mb-6 hidden lg:flex">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-[#475367] ring-1 ring-black/5">
              <LuUserPlus className="text-[14px]" />
              Create Your Account
            </span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-[34px] font-extrabold leading-tight text-white lg:text-[40px] lg:text-[#1F2937]">
              Create Account
            </h1>
            <p className="mt-2 text-[15px] text-white/70 lg:text-[#6B7280]">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-secondaryColor underline-offset-2 hover:underline"
              >
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
