"use client";
import { createBusiness } from "@/app/api/controllers/auth";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { businessTypes } from "@/lib/businessTypes";
import { companyInfo } from "@/lib/companyInfo";
import {
  cn,
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import { Spacer } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import States from "../../../lib/cities.json";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";
import { setJsonCookie } from "@/lib/cookies";
import { getUserSubscription } from "@/app/api/controllers/dashboard/settings";
import { forceTokenRefresh } from "@/app/api/apiService";
import useLogout from "@/hooks/cachedEndpoints/useLogout";
import { useGlobalContext } from "@/hooks/globalProvider";
import {
  clearSignupReferralCode,
  getSignupReferralCode,
} from "@/lib/referral";
import { MdKeyboardArrowDown } from "react-icons/md";

type BusinessSelectProps = {
  label: string;
  name: string;
  value: string | number;
  placeholder?: string;
  contents: { label: string; value: string | number }[];
  onChange: (e: { target: { name: string; value: string | number } }) => void;
  errorMessage?: any;
  disabled?: boolean;
};

const BusinessSelect = ({
  label,
  name,
  value,
  placeholder,
  contents,
  onChange,
  errorMessage,
  disabled,
}: BusinessSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = contents.find(
    (content) => String(content.value) === String(value)
  );

  const handleSelect = (selectedValue: string | number) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="w-full">
      <label
        htmlFor={name}
        className="mb-1.5 block text-[14px] font-[500] text-[#000]"
      >
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          id={name}
          name={name}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "flex h-[56px] w-full items-center justify-between rounded-[8px] border bg-white px-3 text-left text-[14px] outline-none transition-colors",
            "hover:border-[#C3ADFF] focus:border-[#C3ADFF]",
            disabled && "cursor-not-allowed bg-secondaryGrey",
            errorMessage ? "border-red-500" : "border-[#E4E7EC]",
            isOpen && "border-[#C3ADFF]"
          )}
        >
          <span
            className={cn(
              "truncate",
              selectedOption ? "text-black" : "text-[#98A2B3]"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <MdKeyboardArrowDown
            className={cn(
              "ml-2 shrink-0 text-xl text-[#667085] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <ul
            role="listbox"
            aria-labelledby={name}
            className="absolute z-50 mt-1 max-h-[260px] w-full overflow-y-auto rounded-[8px] border border-[#E4E7EC] bg-white py-1 shadow-lg"
          >
            {contents.length === 0 && (
              <li className="px-3 py-2.5 text-[14px] text-[#98A2B3]">
                No options available
              </li>
            )}
            {contents.map((content) => {
              const isSelected =
                String(content.value) === String(value);
              return (
                <li key={content.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(content.value)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-[14px] text-black transition-colors hover:bg-[#F4F0FF]",
                      isSelected && "bg-[#F4F0FF] font-medium"
                    )}
                  >
                    {content.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

const BusinessInformationForm = () => {
  const router = useRouter();
  const { refetch } = useSubscription();
  const { logoutFn } = useLogout();
  const { userData } = useGlobalContext();
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const savedReferralCode = getSignupReferralCode();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [businessFormData, setBusinessFormData] = useState({
    name: "",
    cooperateID: userInformation?.cooperateID,
    address: "",
    businessCategory: "",
    resistrationNumber: "",
    resistrationCertificateImageReference: "",
    nin: "",
    identificationImageReference: "",
    primaryBrandColour: "",
    secondaryBrandColour: "",
    logoImageReference: "",
    state: "",
    city: "",
    contactEmailAddress: "",
    contactPhoneNumber: "",
    referralCode: savedReferralCode,
  });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    setResponse(null);
    setFormErrors({});
    const { name, value } = e.target;
    setBusinessFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    let hasErrors = false;

    // Required field validation
    if (!businessFormData.name?.trim()) {
      errors.name = "Business name is required";
      hasErrors = true;
    }
    if (!businessFormData.contactEmailAddress?.trim()) {
      errors.contactEmailAddress = "Business email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(businessFormData.contactEmailAddress)) {
      errors.contactEmailAddress = "Please enter a valid email address";
      hasErrors = true;
    }
    if (!businessFormData.address?.trim()) {
      errors.address = "Business address is required";
      hasErrors = true;
    }
    if (!businessFormData.state?.trim()) {
      errors.state = "Business state is required";
      hasErrors = true;
    }
    if (!businessFormData.city?.trim()) {
      errors.city = "Business LGA is required";
      hasErrors = true;
    }
    if (!businessFormData.businessCategory) {
      errors.businessCategory = "Business category is required";
      hasErrors = true;
    }

    setFormErrors(errors);

    if (hasErrors) {
      const errorMessages = Object.values(errors).join(". ");
      notify({
        title: "Validation Error",
        text: errorMessages,
        type: "error",
      });
    }

    return !hasErrors;
  };

  const handleAuthenticationError = async (error: any) => {
    // Check for authentication-related errors
    const authErrorCodes = ['AUTH001', 'AUTH002', 'TOKEN_EXPIRED', 'UNAUTHORIZED'];
    const errorCode = error?.code || error?.responseCode;
    const errorMessage = error?.message || error?.responseDescription || "";
    
    if (authErrorCodes.includes(errorCode) || 
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('authentication')) {
      
      notify({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        type: "warning",
      });
      
      // Logout user after a short delay
      setTimeout(async () => {
        await logoutFn();
      }, 2000);
      
      return true; // Indicates auth error was handled
    }
    
    return false; // Not an auth error
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setFormErrors({});

    // Show initial loading message
    notify({
      title: "Creating Business",
      text: "Setting up your business profile...",
      type: "info",
    });

    try {
      // Carry the referral code captured at signup into the business creation
      // request so the referral is applied to the new business. Prefer the code
      // entered in the form, then the code persisted during signup, then fall
      // back to any code returned on the user from email confirmation.
      const referralCode =
        businessFormData.referralCode ||
        getSignupReferralCode() ||
        String(userData?.referralCode ?? "") ||
        String(userInformation?.referralCode ?? "");

      const data = await createBusiness({
        ...businessFormData,
        businessCategory: +businessFormData.businessCategory,
        ...(referralCode ? { referralCode } : {}),
      });

      setResponse(data);

      if (data?.data?.isSuccessful) {
        clearSignupReferralCode();
        // Show progress update
        notify({
          title: "Business Created",
          text: "Setting up your subscription...",
          type: "info",
        });
        
        saveJsonItemToLocalStorage("business", [data?.data?.data]);

        // The token issued at signup predates this newly created business, so
        // the subscription endpoint rejects it (causing the Billing &
        // Subscription page to error until a re-login). Re-scope the JWT to the
        // new business before fetching subscription data or navigating away.
        await forceTokenRefresh();

        const responseData = await getUserSubscription(
          data?.data?.data?.businessId
        );

        setJsonCookie(
          "planCapabilities",
          responseData?.data?.data?.planCapabilities
        );

        if (responseData?.data?.data) {
          notify({
            title: "Success!",
            text: "Business registration completed successfully!",
            type: "success",
          });
          
          // Small delay for user to see success message
          setTimeout(() => {
            router.push("/dashboard/settings/subscriptions");
          }, 1000);
        } else {
          const wasAuthError = await handleAuthenticationError(responseData?.data);
          if (!wasAuthError) {
            notify({
              title: "Subscription Error",
              text: responseData?.data?.error || "Failed to set up subscription. Please try again.",
              type: "error",
            });
          }
        }
      } else if (data?.data?.error) {
        const wasAuthError = await handleAuthenticationError(data?.data);
        if (!wasAuthError) {
          // Handle validation errors from server
          if (data?.errors) {
            setFormErrors(data.errors);
            const serverErrors = Object.entries(data.errors)
              .map(([field, messages]) => `${field}: ${(messages as string[])[0]}`)
              .join(". ");
            
            notify({
              title: "Validation Failed",
              text: serverErrors,
              type: "error",
            });
          } else {
            notify({
              title: "Business Registration Failed",
              text: data?.data?.error || "Failed to register business. Please try again.",
              type: "error",
            });
          }
        }
      }
    } catch (error: any) {
      console.error("Business creation error:", error);
      
      const wasAuthError = await handleAuthenticationError(error);
      if (!wasAuthError) {
        // Handle different types of errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          notify({
            title: "Connection Timeout",
            text: "The request took too long. Please check your internet connection and try again.",
            type: "error",
          });
        } else if (error.message?.includes('Network')) {
          notify({
            title: "Network Error",
            text: "Unable to connect to the server. Please check your internet connection.",
            type: "error",
          });
        } else {
          notify({
            title: "Registration Error",
            text: error.message || "An unexpected error occurred during registration. Please try again.",
            type: "error",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getStates = () => {
    return States.map((state) => ({
      label: state.name,
      value: state.name,
    }));
  };

  const getCities = () => {
    const state = States.find((state) => state.name === businessFormData.state);

    if (state) {
      return state?.cities.map((city) => ({
        label: city,
        value: city,
      }));
    } else {
      return [];
    }
  };

  return (
    <form onSubmit={submitFormData} autoComplete="off">
      <CustomInput
        type="text"
        name="name"
        label="Business Name"
        errorMessage={formErrors?.name || response?.errors?.name?.[0]}
        onChange={handleInputChange}
        value={businessFormData.name}
        placeholder="Name of your business"
      />
      <Spacer y={4} />

      {/* <div className='flex flex-col md:flex-row  gap-3'> */}
      <CustomInput
        type="text"
        name="contactEmailAddress"
        errorMessage={formErrors?.contactEmailAddress || response?.errors?.contactEmailAddress?.[0]}
        onChange={handleInputChange}
        value={businessFormData.contactEmailAddress}
        label="Business Email"
        placeholder={`${companyInfo.name}@gmail.com`}
      />
      {/* <CustomInput
          type='text'
          name='contactPhoneNumber'
          errorMessage={response?.errors?.contactPhoneNumber?.[0]}
          onChange={handleInputChange}
          value={businessFormData.contactPhoneNumber}
          label='Business Phone Number'
          placeholder='09034545454'
        />
      </div> */}
      <Spacer y={4} />
      <CustomInput
        type="text"
        name="address"
        errorMessage={formErrors?.address || response?.errors?.address?.[0]}
        onChange={handleInputChange}
        value={businessFormData.address}
        label="Business Address"
        placeholder="Where is your business located "
      />

      <Spacer y={4} />
      <div className="flex flex-col md:flex-row  gap-3">
        <BusinessSelect
          errorMessage={formErrors?.state || response?.errors?.state?.[0]}
          label={"Business State"}
          name="state"
          onChange={handleInputChange}
          value={businessFormData.state}
          placeholder={"Select state"}
          contents={getStates()}
        />

        <BusinessSelect
          errorMessage={formErrors?.city || response?.errors?.city?.[0]}
          label={"Business LGA"}
          name="city"
          onChange={handleInputChange}
          value={businessFormData.city}
          placeholder={"Select lga"}
          contents={getCities()}
        />
      </div>
      <Spacer y={4} />
      <BusinessSelect
        errorMessage={formErrors?.businessCategory || response?.errors?.businessCategory?.[0]}
        label={"Business Category"}
        name="businessCategory"
        onChange={handleInputChange}
        value={businessFormData.businessCategory}
        placeholder={"Business category"}
        contents={businessTypes}
      />

      {!savedReferralCode && (
        <>
          <Spacer y={4} />
          <CustomInput
            type="text"
            name="referralCode"
            errorMessage={formErrors?.referralCode || response?.errors?.referralCode?.[0]}
            onChange={handleInputChange}
            value={businessFormData.referralCode}
            label="Referral code"
            placeholder="Referral code (optional)"
            bgColor="bg-transparent lg:bg-white"
            classnames="h-[58px] rounded-xl border border-secondaryColor/40 lg:border-transparent lg:shadow-[0_1px_2px_rgba(16,24,40,0.05)] data-[hover=true]:!border-secondaryColor/60 data-[focus=true]:!border-secondaryColor"
          />
        </>
      )}
      <Spacer y={8} />
      <CustomButton loading={loading} disabled={loading} type="submit">
        Proceed
      </CustomButton>
    </form>
  );
};

export default BusinessInformationForm;
