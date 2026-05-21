import LoginForm from "@/components/ui/auth/loginForm";
import AuthLeftPanel from "@/components/ui/auth/AuthLeftPanel";
import { companyInfo } from "@/lib/companyInfo";
import Image from "next/image";
import Link from "next/link";
import { LuLock } from "react-icons/lu";

export const metadata = {
  title: `${companyInfo.name} | Log in to ${companyInfo.name}`,
  description: "Streamline your business processes",
};

const LoginPage = () => {
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
              <LuLock className="text-[14px]" />
              Secured Log In
            </span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-[34px] font-extrabold leading-tight text-white lg:text-[40px] lg:text-[#1F2937]">
              Welcome Back!
            </h1>
            <p className="mt-2 text-[15px] text-white/70 lg:text-[#6B7280]">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-secondaryColor underline-offset-2 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
