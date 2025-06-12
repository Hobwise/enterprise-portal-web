import LoginForm from "@/components/ui/auth/loginForm";
import { companyInfo } from "@/lib/companyInfo";
import { HOME_URL } from "@/utilities/routes";
import { Spacer } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { LampContainer } from "@/components/ui/lampEffect";
import { FlipWords } from "@/components/ui/flipword";

export const metadata = {
  title: `${companyInfo.name} | Log in to ${companyInfo.name}`,
  description: "Streamline your business processes",
};

const words = ["bookings", "orders", "campaigns", "payments"];

const LoginPage = () => {
  return (
    <main className="flex min-h-screen bg-white text-black">
      <div className="hidden lg:block lg:fixed inset-y-0 left-0 w-1/2 m-3">
        <LampContainer>
          <h1 className="mx-auto">
            Manage
            <FlipWords className="text-white" words={words} /> <br />
            <span className="text-2xl">
              Ensuring smooth business operation.
            </span>
          </h1>
        </LampContainer>
      </div>

      <div className="w-full lg:w-1/2 lg:ml-[50%]">
        <div className="min-h-screen flex flex-col">
          <div className="pt-8 px-8 lg:pt-16 lg:px-16">
            <div className="flex justify-center">
              <Link className="block" href={HOME_URL}>
                <Image
                  src={companyInfo.logo}
                  height={150}
                  width={150}
                  style={{ objectFit: "cover" }}
                  alt="company logo"
                />
              </Link>
            </div>
          </div>

          <div className="flex-1 flex lg:items-center mt-8 items-start lg:mt-0 justify-center px-8 lg:px-16">
            <div className="w-full max-w-md">
              <h1 className="text-4xl text-center font-semibold mb-2">
                Welcome Back
              </h1>
              <p className="text-grey600 text-center">
                Enter your email and password to access your account
              </p>
              <Spacer y={10} />
              <LoginForm />

              <p className="text-center mt-8 text-sm text-grey600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primaryColor font-medium"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
