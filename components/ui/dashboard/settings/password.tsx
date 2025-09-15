"use client";
import { changePassword } from "@/app/api/controllers/auth";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import { Spacer } from "@nextui-org/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Password = () => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const [isLoading, setIsLoading] = useState(false);

  const [response, setResponse] = useState(null);
  const [passwordFormData, setChangePasswordFormData] = useState({
    password: "",
    confirmPassword: "",
    oldPassword: "",
  });

  const handleInputChange = (e) => {
    setResponse(null);
    const { name, value } = e.target;
    setChangePasswordFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setIsLoading(true);
    const payload = {
      email: userInformation.email,
      oldPassword: passwordFormData.oldPassword,
      newPassword: passwordFormData.password,
      confirmPassword: passwordFormData.confirmPassword,
    };
    const data = await changePassword(payload);

    setIsLoading(false);
    setResponse(data);

    if (data?.data?.isSuccessful) {
      toast.success("Your password has been changed");
      setChangePasswordFormData({
        password: "",
        confirmPassword: "",
        oldPassword: "",
      });
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };
  return (
    <div>
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">
            Update password
          </h1>
          <p className="text-sm  text-grey600 md:mb-10 mb-4">
            Protect your account with secure password
          </p>
        </div>
        <CustomButton
          loading={isLoading}
          disabled={isLoading}
          onClick={submitFormData}
          className="py-2 px-4 md:mb-0 mb-4 text-white"
          backgroundColor="bg-primaryColor"
        >
          Save Changes
        </CustomButton>
      </div>
      <form autoComplete="off">
        <CustomInput
          errorMessage={response?.errors?.oldPassword?.[0]}
          value={passwordFormData?.oldPassword}
          onChange={handleInputChange}
          name="oldPassword"
          type="password"
          label="Enter old password"
          placeholder="**********"
        />
        <Spacer y={6} />
        <CustomInput
          errorMessage={response?.errors?.newPassword?.[0]}
          value={passwordFormData?.password}
          onChange={handleInputChange}
          type="password"
          name="password"
          label="Enter new password"
          placeholder="**********"
        />
        <Spacer y={6} />
        <CustomInput
          errorMessage={response?.errors?.confirmPassword?.[0]}
          value={passwordFormData?.confirmPassword}
          onChange={handleInputChange}
          type="password"
          name="confirmPassword"
          label="Enter new password"
          placeholder="Confirm new password"
        />
      </form>
    </div>
  );
};

export default Password;
