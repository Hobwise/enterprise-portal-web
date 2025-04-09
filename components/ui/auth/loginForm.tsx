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

    try {
      queryClient.clear();
      localStorage.clear();
      setLoading(true);
      setResponse(null);

      const response = await loginUser(loginFormData);

      if (response?.data?.response) {
        const decryptedData = decryptPayload(response.data.response);

        if (decryptedData?.data) {
          const { businesses, token } = decryptedData.data;

          saveJsonItemToLocalStorage("userInformation", decryptedData.data);
          setLoginDetails(loginFormData);
          saveJsonItemToLocalStorage("business", businesses);
          setTokenCookie("token", token);

          const redirectPath =
            businesses?.length >= 0
              ? routePaths[businesses.length] || routePaths.default
              : routePaths.default;

          router.push(redirectPath);
        }
      } else {
        const decryptedData = decryptPayload(response?.response?.data.response);

        if (decryptedData?.error) {
          if (decryptedData.error.responseCode === "HB016") {
            return router.push(
              `/auth/forget-password?email=${loginFormData.email}&screen=${2}`
            );
          }
          notify({
            title: "Error!",
            text: decryptedData.error.responseDescription,
            type: "error",
          });
          return;
        }
      }
    } catch (error: any) {
      notify({
        title: "Error!",
        text: error.message || "An unexpected error occurred during login",
        type: "error",
      });
    } finally {
      setLoading(false);
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
      />

      <Spacer y={4} />
      <div className="flex items-center justify-end">
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
