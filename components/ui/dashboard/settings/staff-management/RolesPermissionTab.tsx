"use client";
import { configureRole } from "@/app/api/controllers/dashboard/settings";
import useGetRoleByBusiness from "@/hooks/cachedEndpoints/useGetRoleBusiness";
import { SmallLoader, getJsonItemFromLocalStorage } from "@/lib/utils";
import { Divider, ScrollShadow, Spacer, Switch } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { sections } from "../data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const RolesPermissionTab = () => {
  const queryClient = useQueryClient();
  const { data, isLoading: roleLoading } = useGetRoleByBusiness();
  const permissionsData = data; // data is already the permissions object from the hook
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const [permissions, setPermissions] = useState({
    userRole: {},
    managerRole: {},
  });

  useEffect(() => {
    if (permissionsData) {
      setPermissions({
        userRole: permissionsData.userRole || {},
        managerRole: permissionsData.managerRole || {},
      });
    }
  }, [permissionsData]);

  const updatePermissionMutation = useMutation({
    mutationFn: (updatedPermissions: any) => {
      const permissionsToSend = {
        userRole: {
          ...updatedPermissions.userRole,
          cooperateId: userInformation?.cooperateID,
          businessId: businessInformation[0]?.businessId,
        },
        managerRole: {
          ...updatedPermissions.managerRole,
          cooperateId: userInformation?.cooperateID,
          businessId: businessInformation[0]?.businessId,
        },
      };
      return configureRole(
        businessInformation[0]?.businessId,
        permissionsToSend
      );
    },
    onMutate: async (newPermissions) => {
      const queryKey = ['roleByBusiness', businessInformation[0]?.businessId];

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousPermissions = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value - data is stored directly as permissions object
      queryClient.setQueryData(queryKey, newPermissions);

      // Return a context object with the snapshotted value
      return { previousPermissions, queryKey };
    },
    onError: (err, newPermissions, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.queryKey) {
        queryClient.setQueryData(
          context.queryKey,
          context.previousPermissions
        );
      }
      toast.error("Failed to update permission. Please try again.");
    },
    onSuccess: (response) => {
      if (!response?.data?.isSuccessful && response?.data?.error) {
        toast.error(response?.data?.error);
      }
      // Don't update cache here - let the optimistic update stay until refetch
    },
    onSettled: (_data, _error, _variables, context) => {
      // Only refetch to sync with server, this will replace the optimistic update
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active'
        });
      }
    },
  });

  const handleToggle = (permission: string) => {
    const updatedPermissions = {
      ...permissions,
      userRole: {
        ...permissions.userRole,
        [permission]: !permissions.userRole[permission],
      },
    };

    setPermissions(updatedPermissions);
    updatePermissionMutation.mutate(updatedPermissions);
  };

  return (
    <div className="pt-2">
      <div className="mb-6">
        <h2 className="text-[16px] leading-8 font-semibold">Permissions</h2>
        <p className="text-sm text-grey600">
          Assign the necessary permissions to access specific resources
        </p>
      </div>

      {roleLoading ? (
        <div className="grid place-content-center">
          <SmallLoader />
        </div>
      ) : (
        <div className="w-full border border-secondaryGrey rounded-lg">
          <div className="grid grid-cols-3 p-3 text-sm rounded-tl-lg border-b border-secondaryGrey rounded-tr-lg bg-grey300 mb-4 text-grey500 font-medium">
            <div className="col-span-1 font-medium">Actions</div>
            <div className="col-span-1 text-center font-medium">Manager</div>
            <div className="col-span-1 text-center font-medium">Staff</div>
          </div>
          <ScrollShadow size={0} className="w-full">
            {sections.map((section) => (
              <div key={section.title} className="px-3">
                <div className="font-medium border-b border-gray-100 text-sm  text-primaryColor pb-2 mb-2">
                  {section.title}
                </div>

                {section.permissions.map((permission) => {
                  const isUserRoleChecked =
                    permission.key === "canViewDashboard"
                      ? true
                      : permissions.userRole[permission.key] || false;

                  const isManagerRoleChecked =
                    permission.key === "canViewDashboard"
                      ? true
                      : permissions.managerRole[permission.key] || false;

                  return (
                    <div key={permission.key}>
                      <div className="grid grid-cols-3 text-sm items-center">
                        <div className="col-span-1 text-grey500">
                          {permission.label}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Switch
                            size="sm"
                            isSelected={isManagerRoleChecked}
                            isDisabled={true}
                            classNames={{
                              wrapper:
                                "group-data-[selected=true]:bg-[#5f35d2]",
                              thumb: isManagerRoleChecked ? "bg-white" : "",
                            }}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Switch
                            size="sm"
                            isSelected={isUserRoleChecked}
                            isDisabled={permission.key === "canViewDashboard"}
                            onChange={() => {
                              if (permission.key !== "canViewDashboard") {
                                handleToggle(permission.key);
                              }
                            }}
                            classNames={{
                              wrapper:
                                "group-data-[selected=true]:bg-[#5f35d2]",
                              thumb: isUserRoleChecked ? "bg-white" : "",
                            }}
                          />
                        </div>
                      </div>
                      <Divider className="my-2 bg-gray-100" />
                    </div>
                  );
                })}
              </div>
            ))}
          </ScrollShadow>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionTab;
