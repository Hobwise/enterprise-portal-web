import { CustomButton } from "@/components/customButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CiLock } from "react-icons/ci";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-[400px]   p-4">
      <div className="flex flex-col items-center text-center space-y-6 pt-6 max-w-lg w-full">
        <div className="rounded-full bg-orange-100 p-3">
          <CiLock className="h-6 w-6 text-orange-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription Access Unavailable
          </h2>
          <p className="text-gray-600">
            We're unable to retrieve your subscription information at this time.
            Please try again later or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
