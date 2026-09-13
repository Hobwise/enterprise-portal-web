import EntryPoint from "@/components/ui/auth/forget-password/EntryPoint";
import AuthLeftPanel from "@/components/ui/auth/AuthLeftPanel";
import { companyInfo } from "../../../lib/companyInfo";
import Image from "next/image";

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

  return (
    <main className="flex min-h-screen font-bricolage_grotesque">
      <AuthLeftPanel variant="long" />

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
