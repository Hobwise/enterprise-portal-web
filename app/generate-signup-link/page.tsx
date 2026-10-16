import GenerateSignupLinkForm from "@/components/ui/referrals/generateSignupLinkForm";
import { companyInfo } from "@/lib/companyInfo";
import Image from "next/image";
import Link from "next/link";
import { LuLink } from "react-icons/lu";

export const metadata = {
  title: `${companyInfo.name}| Generate signup link`,
  description: "Create your unique referral signup link to share with others.",
};

export default function GenerateSignupLink() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] font-bricolage_grotesque">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/assets/icons/hobwise-logo.png"
            height={56}
            width={56}
            className="rounded-xl"
            alt="Hobwise logo"
            priority
          />
        </div>

        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-[#475367] ring-1 ring-black/5">
            <LuLink className="text-[14px]" />
            Referral Program
          </span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-extrabold leading-tight text-[#1F2937]">
            Generate your signup link
          </h1>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Enter your referral code to create a unique link. Anyone who signs
            up through it will be linked to you.
          </p>
        </div>

        <div className="rounded-2xl border border-secondaryGrey bg-white p-5 shadow-custom_shadow sm:p-7">
          <GenerateSignupLinkForm />
        </div>

        <p className="mt-6 text-center text-[13px] text-[#6B7280]">
          Don&apos;t have a referral code yet?{" "}
          <Link
            href="/dashboard"
            className="font-semibold text-secondaryColor underline-offset-2 hover:underline"
          >
            Go to your dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
