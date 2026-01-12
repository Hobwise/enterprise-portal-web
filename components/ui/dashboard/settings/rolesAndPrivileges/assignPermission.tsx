"use client";
import { configureRole } from "@/app/api/controllers/dashboard/settings";
import useGetRoleByBusiness from "@/hooks/cachedEndpoints/useGetRoleBusiness";
import { SmallLoader, getJsonItemFromLocalStorage } from "@/lib/utils";
import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Spacer,
  Switch,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { sections } from "../data";

const AssignPermission = ({ isOpen, onOpenChange }: any) => {
  const { data, isLoading: roleLoading, refetch } = useGetRoleByBusiness();
  const permissionsData = data?.data?.data;
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const [permissions, setPermissions] = useState({
    userRole: {},
    managerRole: {},
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (permissionsData) {
      setPermissions({
        userRole: permissionsData.userRole || {},
        managerRole: permissionsData.managerRole || {},
      });
    }
  }, [permissionsData]);

  const handleToggle = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      userRole: {
        ...prev.userRole,
        [permission]: !prev.userRole[permission],
      },
    }));
    setHasChanges(true);
  };

  const assignPermission = async () => {
    const permissionsToSend = {
      userRole: {
        ...permissions.userRole,
        cooperateId: userInformation?.cooperateID,
        businessId: businessInformation[0]?.businessId,
      },
      managerRole: {
        ...permissions.managerRole,
        cooperateId: userInformation?.cooperateID,
        businessId: businessInformation[0]?.businessId,
      },
    };
    const response = await configureRole(
      businessInformation[0]?.businessId,
      permissionsToSend
    );

    if (response?.data?.isSuccessful) {
      refetch();
      setHasChanges(false);
      console.log("Permission assigned successfully");
    } else if (response?.data?.error) {
      console.log(response?.data?.error, "errrrrrrrror");
    }
  };

  const handleModalClose = () => {
    assignPermission();
    onOpenChange();
  };

  return (
    <Modal
      size="5xl"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={handleModalClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className="text-[24px] leading-8 mt-8 text-black font-semibold">
                Permissions
              </h2>
              <p className="text-sm  text-grey600">
                Assign the necessary permissions to access specific resources
              </p>
              {roleLoading ? (
                <div className="grid place-content-center">
                  <SmallLoader />
                </div>
              ) : (
                <div className="w-full   border border-secondaryGrey rounded-lg">
                  <div className="grid grid-cols-3 p-3  rounded-tl-lg border-b border-secondaryGrey rounded-tr-lg bg-grey300 mb-4 text-grey500 font-medium">
                    <div className="col-span-1 font-medium ">Actions</div>
                    <div className="col-span-1 text-center font-medium">
                      Manager
                    </div>
                    <div className="col-span-1 text-center font-medium">
                      Staff
                    </div>
                  </div>
                  <ScrollShadow size={0} className="h-[400px] w-full ">
                    {sections.map((section) => (
                      <div key={section.title} className=" px-3">
                        <div className="font-medium border-b pb-3 border-secondaryGrey text-primaryColor mt-0 mb-4">
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
                              : permissions.managerRole[permission.key] ||
                                false;

                          return (
                            <div key={permission.key}>
                              <div className="grid grid-cols-3 items-center ">
                                <div className="col-span-1 text-grey500">
                                  {permission.label}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <Switch
                                    size="sm"
                                    isSelected={isManagerRoleChecked}
                                    isDisabled={true}
                                    classNames={{
                                      wrapper: "group-data-[selected=true]:bg-[#5f35d2]",
                                      thumb: isManagerRoleChecked ? "bg-white" : ""
                                    }}
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <Switch
                                    size="sm"
                                    isSelected={isUserRoleChecked}
                                    isDisabled={
                                      permission.key === "canViewDashboard"
                                    }
                                    onChange={() => {
                                      if (
                                        permission.key !== "canViewDashboard"
                                      ) {
                                        handleToggle(permission.key);
                                      }
                                    }}
                                    classNames={{
                                      wrapper: "group-data-[selected=true]:bg-[#5f35d2]",
                                      thumb: isUserRoleChecked ? "bg-white" : ""
                                    }}
                                  />
                                </div>
                              </div>
                              <Divider className="my-4" />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </ScrollShadow>
                </div>
              )}
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AssignPermission;
