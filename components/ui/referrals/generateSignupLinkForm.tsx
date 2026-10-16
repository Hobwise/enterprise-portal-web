"use client";

import { useMemo, useState } from "react";
import { CustomButton } from "@/components/customButton";
import { CustomInput } from "@/components/CustomInput";
import { notify } from "@/lib/utils";
import { companyInfo } from "@/lib/companyInfo";
import { LuArrowRight, LuCheck, LuCopy, LuShare2 } from "react-icons/lu";

const REFERRAL_CODE_QUERY_KEY = "referral-code";
const REFERRAL_CODE_PATTERN = /^[A-Z0-9-]+$/;

const sanitizeReferralCode = (value: string) =>
  value.replace(/^[?\s]+/, "").replace(/\s+/g, "").toUpperCase();

const GenerateSignupLinkForm = () => {
  const [referralCode, setReferralCode] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const errorMessage = useMemo(() => {
    if (!referralCode) return "";
    if (!REFERRAL_CODE_PATTERN.test(referralCode)) {
      return "Referral codes can only contain letters, numbers and hyphens.";
    }
    return "";
  }, [referralCode]);

  const getBaseUrl = () => {
    const configured = companyInfo.webUrl?.replace(/\/+$/, "");
    if (configured) return configured;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneratedLink("");
    setCopied(false);
    setReferralCode(sanitizeReferralCode(e.target.value));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const code = sanitizeReferralCode(referralCode);
    if (!code) {
      notify({
        title: "Referral code required",
        text: "Enter your referral code to generate your signup link.",
        type: "error",
      });
      return;
    }

    if (!REFERRAL_CODE_PATTERN.test(code)) {
      notify({
        title: "Invalid referral code",
        text: "Referral codes can only contain letters, numbers and hyphens.",
        type: "error",
      });
      return;
    }

    const link = `${getBaseUrl()}/auth/signup?${REFERRAL_CODE_QUERY_KEY}=${encodeURIComponent(
      code
    )}`;
    setGeneratedLink(link);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      notify({
        title: "Link copied",
        text: "Your referral signup link is ready to share.",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notify({
        title: "Couldn't copy",
        text: "Please copy the link manually.",
        type: "error",
      });
    }
  };

  const handleShare = async () => {
    if (!generatedLink) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${companyInfo.name}`,
          text: "Create your account using my referral link.",
          url: generatedLink,
        });
      } catch {
        // User dismissed the share sheet - no action needed.
      }
      return;
    }

    handleCopy();
  };

  return (
    <form onSubmit={handleGenerate} autoComplete="off">
      <CustomInput
        type="text"
        name="referralCode"
        label=""
        value={referralCode}
        onChange={handleChange}
        errorMessage={errorMessage}
        placeholder="Enter your referral code e.g. HOB-C5VKRG"
        bgColor="bg-white"
        inputTextColor="text-[#1F2937]"
        classnames="h-[58px] rounded-xl border border-secondaryGrey bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] data-[hover=true]:!border-secondaryColor/60 data-[focus=true]:!border-secondaryColor"
      />

      <div className="mt-6">
        <CustomButton
          type="submit"
          disabled={!referralCode || !!errorMessage}
          className="group flex h-[56px] w-full items-center justify-center gap-3 rounded-xl text-[16px] font-semibold text-white transition-colors"
        >
          <span>Generate signup link</span>
          <LuArrowRight className="text-lg transition-transform group-hover:translate-x-0.5" />
        </CustomButton>
      </div>

      {generatedLink && (
        <div className="mt-6 rounded-xl border border-secondaryGrey bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <p className="mb-2 text-[13px] font-semibold text-[#475367]">
            Your referral signup link
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-primaryGrey px-3 py-3">
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#1F2937]">
              {generatedLink}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-secondaryGrey bg-white text-[15px] font-semibold text-[#1F2937] transition-colors hover:bg-primaryGrey"
            >
              {copied ? (
                <>
                  <LuCheck className="text-lg text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <LuCopy className="text-lg" />
                  Copy link
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primaryColor text-[15px] font-semibold text-white transition-colors hover:bg-primaryColor/90"
            >
              <LuShare2 className="text-lg" />
              Share
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default GenerateSignupLinkForm;
