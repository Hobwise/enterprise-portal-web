"use client";
import { loginUser } from "@/app/api/controllers/auth";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { useGlobalContext } from "@/hooks/globalProvider";
import { setJsonCookie } from "@/lib/cookies";
import {
  notify,
  saveJsonItemToLocalStorage,
  setTokenCookie,
} from "@/lib/utils";
import { Spacer } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaRegEnvelope } from "react-icons/fa6";
import { useQueryClient } from "react-query";

import { encryptPayload, decryptPayload } from "@/lib/encrypt-decrypt";

const LoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoginDetails } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    setResponse(null);
    const { name, value } = e.target;
    setLoginFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const routePaths: Record<number | "default", string> = {
    0: "/auth/business-information",
    1: "/dashboard",
    default: "/auth/select-business",
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    queryClient.clear();
    localStorage.clear();
    setLoading(true);
    const data = await loginUser(loginFormData);
    setResponse(data);
    const businesses = data?.data?.data?.businesses || [];

    setLoading(false);

    if (data?.data?.isSuccessful) {
      saveJsonItemToLocalStorage("userInformation", data?.data?.data);
      setLoginDetails(loginFormData);
      saveJsonItemToLocalStorage("business", data?.data?.data.businesses);
      setTokenCookie("token", data?.data?.data.token);

      router.push(routePaths[businesses.length] || routePaths.default);
    } else {
      if (data?.response?.data?.error?.responseCode === "HB016") {
        return router.push(
          `/auth/forget-password?email=${loginFormData.email}&screen=${2}`
        );
      } else {
        notify({
          title: "Error!",
          text: data?.response?.data?.error?.responseDescription,
          type: "error",
        });
      }
    }
  };

  return (
    <form onSubmit={submitFormData} autoComplete="off">
      <CustomInput
        type="text"
        name="email"
        errorMessage={response?.errors?.email?.[0]}
        onChange={handleInputChange}
        value={loginFormData.email}
        label="Email Address"
        placeholder="Enter email"
        // isRequired={true}
        endContent={<FaRegEnvelope className="text-foreground-500 text-l" />}
      />

      <Spacer y={6} />
      <CustomInput
        errorMessage={response?.errors?.password?.[0]}
        value={loginFormData.password}
        onChange={handleInputChange}
        type="password"
        label="Password"
        name="password"
        placeholder="Enter password"
        // isRequired={true}
      />

      <Spacer y={4} />
      <div className="flex items-center justify-end">
        {/* <Checkbox size='sm' className='rounded-lg' color='default'>
          Remember me
         
        </Checkbox> */}
        <Link
          prefetch={true}
          className="text-primaryColor text-sm"
          href="/auth/forget-password"
        >
          Forget Password?
        </Link>
      </div>
      <Spacer y={7} />
      <CustomButton loading={loading} disabled={loading} type="submit">
        Log In
      </CustomButton>
    </form>
  );
};

export default LoginForm;
