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

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string[];
  password?: string[];
}

const LoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoginDetails } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const routePaths: Record<number | "default", string> = {
    0: "/auth/business-information",
    1: "/dashboard",
    default: "/auth/select-business",
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasValidationError = false;
    
    if (!loginFormData.email) {
      newErrors.email = ["Email is required"];
      hasValidationError = true;
    } else if (!loginFormData.email.includes("@")) {
      newErrors.email = ["Please enter a valid email address"];
      hasValidationError = true;
    } else if (!/\S+@\S+\.\S+/.test(loginFormData.email)) {
      newErrors.email = ["Please enter a valid email address"];
      hasValidationError = true;
    }
    
    if (!loginFormData.password) {
      newErrors.password = ["Password is required"];
      hasValidationError = true;
    } else if (loginFormData.password.length < 6) {
      newErrors.password = ["Password must be at least 6 characters"];
      hasValidationError = true;
    }

    setErrors(newErrors);
    
    // Show a comprehensive validation error toast
    if (hasValidationError) {
      const errorMessages = [];
      if (newErrors.email) errorMessages.push(newErrors.email[0]);
      if (newErrors.password) errorMessages.push(newErrors.password[0]);
      
      notify({
        title: "Validation Error",
        text: errorMessages.join(". "),
        type: "error",
      });
    }
    
    return !hasValidationError;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleLoginSuccess = async (decryptedData: any) => {
    try {
      const { businesses, token, user } = decryptedData.data;
      
      // Show immediate success notification
      notify({
        title: "Login Successful!",
        text: `Welcome back${user?.name ? `, ${user.name}` : ''}!`,
        type: "success",
      });

      // Determine redirect path early
      const redirectPath = businesses?.length >= 0
        ? routePaths[businesses.length] || routePaths.default
        : routePaths.default;

      // Optimistically start navigation while saving data in background
      const navigationPromise = router.push(redirectPath);
      
      // Save user data asynchronously
      const dataPromises = [
        Promise.resolve().then(() => saveJsonItemToLocalStorage("userInformation", decryptedData.data)),
        Promise.resolve().then(() => setLoginDetails(loginFormData)),
        Promise.resolve().then(() => saveJsonItemToLocalStorage("business", businesses)),
        Promise.resolve().then(() => setTokenCookie("token", token))
      ];

      // Wait for both navigation and data persistence
      await Promise.all([navigationPromise, ...dataPromises]);
      
    } catch (error) {
      console.error("Error handling login success:", error);
      notify({
        title: "Login Error",
        text: "Failed to process login data. Please try again.",
        type: "error",
      });
      setLoading(false);
    }
  };

  const handleLoginError = (error: any) => {
    console.error("Login error:", error);
    
    // Handle specific error codes
    if (error?.error?.responseCode === "HB016") {
      notify({
        title: "Password Reset Required",
        text: "Your password needs to be reset. Redirecting to password reset page...",
        type: "warning",
      });
      
      setTimeout(() => {
        router.push(`/auth/forget-password?email=${loginFormData.email}&screen=${2}`);
      }, 1500);
      return;
    }
    
    // Handle other specific error codes if needed
    const errorMessages: Record<string, string> = {
      "HB001": "Invalid email or password. Please check your credentials.",
      "HB002": "Account is locked. Please contact support.",
      "HB003": "Account not verified. Please check your email for verification link.",
      "HB004": "Session expired. Please login again.",
      // Add more error codes as needed
    };
    
    const errorCode = error?.error?.responseCode;
    const errorMessage = errorCode && errorMessages[errorCode] 
      ? errorMessages[errorCode] 
      : error?.error?.responseDescription || "An unexpected error occurred during login";
    
    notify({
      title: "Login Failed",
      text: errorMessage,
      type: "error",
    });
  };

  const submitFormData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }

    try {
      // Clear previous session data
      queryClient.clear();
      localStorage.clear();
      setLoading(true);
      setErrors({});

      // Show immediate loading feedback
      notify({
        title: "Authenticating",
        text: "Verifying your credentials...",
        type: "info",
      });
      
      // Show extended loading notification for slow requests
      const loadingTimeout = setTimeout(() => {
        notify({
          title: "Still Processing",
          text: "This is taking longer than usual. Please wait...",
          type: "info",
        });
      }, 3000);

      const response = await loginUser(loginFormData);
      clearTimeout(loadingTimeout);

      // Handle validation errors from server
      if (response?.errors) {
        setErrors(response.errors);
        
        // Show server validation errors as toast
        const serverErrors = [];
        if (response.errors.email) serverErrors.push(`Email: ${response.errors.email[0]}`);
        if (response.errors.password) serverErrors.push(`Password: ${response.errors.password[0]}`);
        
        notify({
          title: "Validation Failed",
          text: serverErrors.join(". "),
          type: "error",
        });
        return;
      }

      // Handle successful response
      if (response?.data?.response) {
        const decryptedData = decryptPayload(response.data.response);
        if (decryptedData?.data) {
          await handleLoginSuccess(decryptedData);
        } else if (decryptedData?.error) {
          handleLoginError(decryptedData);
        } else {
          throw new Error("Invalid response format");
        }
      } 
      // Handle error response
      else if (response?.response?.data?.response) {
        const decryptedData = decryptPayload(response.response.data.response);
        if (decryptedData?.error) {
          handleLoginError(decryptedData);
        } else {
          throw new Error("Invalid error response format");
        }
      } 
      // Handle unexpected response format
      else {
        throw new Error("Unexpected response format from server");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        notify({
          title: "Connection Timeout",
          text: "The request took too long. Please check your internet connection and try again.",
          type: "error",
        });
      } else if (error.message.includes('Network')) {
        notify({
          title: "Network Error",
          text: "Unable to connect to the server. Please check your internet connection.",
          type: "error",
        });
      } else {
        notify({
          title: "Login Error",
          text: error.message || "An unexpected error occurred. Please try again later.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Optional: Add keyboard shortcut for submit (Enter key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading && loginFormData.email && loginFormData.password) {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [loading, loginFormData]);

  return (
    <form onSubmit={submitFormData} autoComplete="off" noValidate>
      <CustomInput
        type="email"
        name="email"
        errorMessage={errors.email?.[0]}
        onChange={handleInputChange}
        value={loginFormData.email}
        label="Email Address"
        placeholder="Enter email"
        isRequired
        autoComplete="email"
        endContent={<FaRegEnvelope className="text-foreground-500 text-l" />}
      />

      <Spacer y={6} />
      
      <CustomInput
        errorMessage={errors.password?.[0]}
        value={loginFormData.password}
        onChange={handleInputChange}
        type="password"
        label="Password"
        name="password"
        placeholder="Enter password"
        isRequired
        autoComplete="current-password"
      />

      <Spacer y={4} />
      
      <div className="flex items-center justify-end">
        <Link
          prefetch={true}
          className="text-primaryColor text-sm hover:underline transition-all"
          href="/auth/forget-password"
        >
          Forgot Password?
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