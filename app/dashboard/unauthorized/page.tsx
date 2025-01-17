import { CustomButton } from "@/components/customButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CiLock } from "react-icons/ci";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-[400px]   p-4">
      <div className="flex flex-col items-center text-center space-y-6 pt-6 max-w-lg w-full">
        <div className="rounded-full bg-pink200 p-3">
          <CiLock className="h-6 w-6 text-primaryColor" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Subscribe To Continue
          </h2>
          <p className="text-gray-600">
            It looks like you've reached the limit of your current plan. Upgrade
            now to unlock unlimited access to all our premium features.
          </p>
        </div>

        <div className="bg-purple-50  p-4 rounded-lg border border-purple-400">
          <div className=" font-semibold">Why upgrade?</div>
          <div className="">
            Get unlimited access to all features, priority support, and
            exclusive content.
          </div>
        </div>

        <div className="space-y-3 w-full">
          <Link href={"/dashboard/settings/subscriptions"}>
            <CustomButton>Upgrade Now</CustomButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
