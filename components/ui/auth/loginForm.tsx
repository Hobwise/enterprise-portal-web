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
import { useEffect, useState, useRef } from "react";
import { FaRegEnvelope } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Prefetch routes on component mount for faster navigation
  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/auth/select-business');
    router.prefetch('/auth/business-information');
  }, [router]);

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

      // Save critical data synchronously
      setTokenCookie("token", token);
      saveJsonItemToLocalStorage("userInformation", decryptedData.data);
      saveJsonItemToLocalStorage("business", businesses);
      setLoginDetails(loginFormData);

      // Determine redirect path based on business count
      let redirectPath: string;
      
      if (!businesses || businesses.length === 0) {
        // No businesses - go to business information setup
        redirectPath = "/auth/business-information";
      } else if (businesses.length === 1) {
        // Single business - go directly to dashboard
        redirectPath = "/dashboard";
      } else {
        // Multiple businesses - go to business selection
        redirectPath = "/auth/select-business";
      }

      // Navigate immediately without await
      router.push(redirectPath);
      router.refresh(); // Force immediate update
      
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
      
      // Navigate immediately for better UX
      router.push(`/auth/forget-password?email=${loginFormData.email}&screen=${2}`);
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
    
    // Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }
    
    // Set loading states immediately
    setLoading(true);
    setIsSubmitting(true);
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      // Clear previous session data without blocking
      localStorage.clear();
      queryClient.clear();

      // Call API with abort signal support
      const response = await loginUser(loginFormData);

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
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Optional: Add keyboard shortcut for submit (Enter key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading && !isSubmitting && loginFormData.email && loginFormData.password) {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [loading, isSubmitting, loginFormData]);

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
      
          <CustomButton 
        loading={loading} 
        disabled={loading || isSubmitting} 
        type="submit"
      >
        {loading ? "Logging in..." : "Log In"}
      </CustomButton>
    </form>
  );
};

export default LoginForm;