"use client";
import Error from "@/components/error";
import useUserByBusiness from "@/hooks/cachedEndpoints/useUserByBusiness";
import { SmallLoader } from "@/lib/utils";
import EmptyPage from "./emptyPage";
import Users from "./users";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";
import { CiLock } from "react-icons/ci";

const Teams = ({ setActiveScreen }: any) => {
  const { data: subscription } = useSubscription();
  const { data, isLoading, isError, refetch } = useUserByBusiness();
  console.log(subscription, "subscription");
  if (subscription?.onTrialVersion) {
    return (
      <>
        <div className="grid place-content-center h-full p-4">
          <div className="flex flex-col items-center text-center space-y-6 pt-6 max-w-lg w-full">
            <div className="rounded-full bg-orange-100 p-3">
              <CiLock className="h-6 w-6 text-orange-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Team Management Not Available
              </h2>
              <p className="text-gray-600">
                Team management features are only available with a paid
                subscription.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (isLoading) {
    return (
      <>
        <div className="w-[220px]">
          <h1 className="text-[16px] leading-8 font-semibold">Team members</h1>
          <p className="text-sm  text-grey600 md:mb-10 mb-4">
            Invite your colleagues to work faster and collaborate together
          </p>
        </div>
        <div className="grid mt-5 place-content-center">
          <SmallLoader />
        </div>
      </>
    );
  }
  if (isError) {
    return <Error onClick={() => refetch()} />;
  }
  return (
    <section>
      {data && data.length > 0 ? (
        <Users data={data} refetch={refetch} />
      ) : (
        <EmptyPage />
      )}
    </section>
  );
};

export default Teams;
