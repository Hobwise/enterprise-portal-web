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
  getTokenCookie,
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSubmitTime = useRef<number>(0);

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

      // Clear old session data BEFORE saving new data
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();

      // Save critical data synchronously
      setTokenCookie("token", token, {
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      saveJsonItemToLocalStorage("userInformation", decryptedData.data);
      saveJsonItemToLocalStorage("business", businesses);
      // Persist loginDetails to sessionStorage to survive page navigation
      saveJsonItemToLocalStorage("loginDetails", loginFormData);
      setLoginDetails(loginFormData);

      // Verify token cookie was actually set
      const cookieVerified = getTokenCookie("token");
      if (!cookieVerified) {
        console.error("Token cookie was not set properly");
        throw new Error("Failed to save authentication token");
      }

      // Check if user needs to change password (common API patterns)
      const needsPasswordChange = user?.mustChangePassword ||
                                user?.isFirstLogin ||
                                user?.passwordExpired ||
                                user?.forcePasswordChange ||
                                user?.requirePasswordChange;

      // Determine redirect path based on user assignment, business count and password status
      let redirectPath: string;

      // Check if user is a Point of Sales user
      const isPOSUser = decryptedData.data.primaryAssignment === "Point of Sales";
      console.log('isPOSUser:', isPOSUser, 'primaryAssignment:', decryptedData.data.primaryAssignment);

      if (needsPasswordChange) {
        // User needs to change password - redirect to password management
        redirectPath = "/dashboard/settings/password-management";
      } else if (isPOSUser) {
        // Point of Sales user - redirect to POS page
        redirectPath = "/pos";
      } else if (!businesses || businesses.length === 0) {
        // No businesses - go to business information setup
        redirectPath = "/auth/business-information";
      } else if (businesses.length === 1) {
        // Single business - go directly to dashboard
        redirectPath = "/dashboard";
      } else {
        // Multiple businesses - go to business selection
        redirectPath = "/auth/select-business";
      }

      // Clear loading state first
      setLoading(false);

      // Only show success notification if NOT redirecting to password change
      if (!needsPasswordChange) {
        notify({
          title: "Login Successful!",
          text: `Welcome back${user?.name ? `, ${user.name}` : ''}!`,
          type: "success",
        });
      }

      // Add small delay to ensure cookies are persisted before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use replace to prevent back button issues
      router.replace(redirectPath);

      // Fallback to hard navigation if router.replace fails
      setTimeout(() => {
        if (window.location.pathname === "/auth/login") {
          window.location.href = redirectPath;
        }
      }, 200);

    } catch (error) {
      console.error("Error handling login success:", error);
      setLoading(false);
      notify({
        title: "Login Error",
        text: "Failed to process login data. Please try again.",
        type: "error",
      });
    }
  };

  const handleLoginError = (error: any) => {
    console.error("Login error:", error);
    
    // Handle specific error codes
    if (error?.error?.responseCode === "HB016") {
      notify({
        title: "Password Update Required",
        text: "Kindly update your password to login. Redirecting to password update page...",
        type: "warning",
      });

      // Clear loading state before navigating
      setLoading(false);
      // Navigate immediately for better UX with proper parameter formatting
      router.push(`/auth/forget-password?email=${encodeURIComponent(loginFormData.email)}&screen=2&forced=true`);
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
    setLoading(false);
  };

  const submitFormData = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) {
      return;
    }

    // Set loading state immediately
    setLoading(true);
    setErrors({});

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Call API with abort signal support (DON'T clear storage yet)
      const response = await loginUser(loginFormData);

      // Log the response structure for debugging
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
        setLoading(false);
        return;
      }

      // Handle successful response from axios
      if (response?.data?.response) {
        const decryptedData = decryptPayload(response.data.response);
        console.log('Login decryptedData:', decryptedData);
        if (decryptedData?.data) {
         handleLoginSuccess(decryptedData);
        
        } else if (decryptedData?.error) {
          handleLoginError(decryptedData);
        } else {
          throw new Error("Invalid response format");
        }
      }
      // Handle axios error response structure
      else if (response?.response?.data?.response) {
        const decryptedData = decryptPayload(response.response.data.response);
        
        if (decryptedData?.error) {
          handleLoginError(decryptedData);
        } else {
          throw new Error("Invalid error response format");
        }
      }
      // Handle direct error response from loginUser catch block
      else if (response?.response?.data) {
        // Check if there's an encrypted payload in the error response
        if (response.response.data.response) {
          const decryptedData = decryptPayload(response.response.data.response);
          handleLoginError(decryptedData);
        }
        // Handle plain error message
        else if (response.response.data.message || response.response.data.error) {
          notify({
            title: "Login Failed",
            text: response.response.data.message || response.response.data.error || "Authentication failed",
            type: "error",
          });
          setLoading(false);
        } else {
          throw new Error("Server error occurred");
        }
      }
      // Handle network errors or other error formats
      else if (response?.message) {
        notify({
          title: "Login Failed",
          text: response.message || "An unexpected error occurred",
          type: "error",
        });
        setLoading(false);
      }
      // Handle unexpected response format
      else {
        console.error("Unexpected response structure:", response);
        notify({
          title: "Login Failed",
          text: "Unable to process server response. Please try again.",
          type: "error",
        });
        setLoading(false);
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
      abortControllerRef.current = null;
    }
  };

  // Prefetch routes on component mount for faster navigation
  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/pos');
    router.prefetch('/auth/select-business');
    router.prefetch('/auth/business-information');
    router.prefetch('/auth/forget-password');
    router.prefetch('/dashboard/settings/password-management');

    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [router]);

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
        disabled={loading}
        type="submit"
      >
        {loading ? "Logging in..." : "Log In"}
      </CustomButton>
    </form>
  );
};

export default LoginForm;