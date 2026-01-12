'use client';
import { createUser } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { useGlobalContext } from '@/hooks/globalProvider';
import { notify } from '@/lib/utils';
import { Spacer, Tooltip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';
import { useQueryClient } from '@tanstack/react-query';

const SignupForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUserData, setExpireTime } = useGlobalContext();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [signupFormData, setSignupFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 0,
    isActive: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setSignupFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e) => {
    e.preventDefault();
    queryClient.clear();
    localStorage.clear();
    setUserData(signupFormData);
    setLoading(true);
    const data = await createUser(signupFormData);
    setLoading(false);
    setResponse(data);

    if (data?.data?.isSuccessful) {
      setExpireTime(new Date(data.data.data));
      router.push("/auth/confirm-email");
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  return (
    <form onSubmit={submitFormData} autoComplete="off">
      <div className="flex md:flex-row flex-col w-full gap-5">
        <div className="flex-1">
          <CustomInput
            type="text"
            name="firstName"
            label=""
            errorMessage={response?.errors?.firstName?.[0]}
            onChange={handleInputChange}
            value={signupFormData.firstName}
            placeholder="First name"
            bgColor="bg-transparent"
            classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
            inputTextColor="text-gray-200"
          />
        </div>

        <div className="flex-1">
          <CustomInput
            type="text"
            name="lastName"
            errorMessage={response?.errors?.lastName?.[0]}
            onChange={handleInputChange}
            value={signupFormData.lastName}
            label=""
            placeholder="Last name"
            bgColor="bg-transparent"
            classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
            inputTextColor="text-gray-200"
          />
        </div>
      </div>

      <Spacer y={5} />

      <CustomInput
        type="text"
        name="email"
        errorMessage={response?.errors?.email?.[0]}
        onChange={handleInputChange}
        value={signupFormData.email}
        label=""
        placeholder="Enter email"
        bgColor="bg-transparent"
        classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
        inputTextColor="text-gray-200"
        endContent={<FaRegEnvelope className="text-gray-300 text-lg" />}
      />

      <Spacer y={5} />

      <Tooltip
        showArrow
        placement="left"
        classNames={{
          base: [
            // arrow color
            "before:bg-neutral-400 dark:before:bg-white",
          ],
          content: [
            "py-2 px-4 shadow-xl bg-[#F2F8FF] rounded-md",
            "text-black bg-gradient-to-br from-white to-neutral-400",
          ],
        }}
        content={
          <div className="px-1 py-2 space-y-2">
            <div className="text-small font-bold">
              Your password should include
            </div>
            <div className="text-tiny">
              One uppercase character e.g A,B,C,etc
            </div>
            <div className="text-tiny">
              One lowercase character e.g a,b,c,etc
            </div>
            <div className="text-tiny">One special character e.g !,@,#,etc</div>
            <div className="text-tiny">One number e.g 1,2,3,4 etc</div>
            <div className="text-tiny">At least 8 characters </div>
          </div>
        }
      >
        <div>
          <CustomInput
            errorMessage={response?.errors?.password?.[0]}
            value={signupFormData.password}
            onChange={handleInputChange}
            type="password"
            name="password"
            label=""
            placeholder="Enter password"
            bgColor="bg-transparent"
            classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
            inputTextColor="text-gray-200"
            eyeIconStyle="text-gray-300 text-lg"
          />
        </div>
      </Tooltip>

      <Spacer y={5} />

      <CustomInput
        errorMessage={response?.errors?.confirmPassword?.[0]}
        value={signupFormData.confirmPassword}
        onChange={handleInputChange}
        type="password"
        name="confirmPassword"
        label=""
        placeholder="Confirm password"
        bgColor="bg-transparent"
        classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
        inputTextColor="text-gray-200"
        eyeIconStyle="text-gray-300 text-lg"
      />

      <Spacer y={7} />

      <CustomButton
        loading={loading}
        disabled={loading}
        type="submit"
        className="bg-secondaryColor font-[600] text-[16px] w-full rounded-xl h-[55px] text-white hover:bg-secondaryColor/90 focus:bg-secondaryColor/90 active:bg-secondaryColor/80 transition-all"
      >
        Create Account
      </CustomButton>
    </form>
  );
};

export default SignupForm;
