'use client';
import { updateUser } from "@/app/api/controllers/auth";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import SelectInput from "@/components/selectInput";
import useUserByBusiness from "@/hooks/cachedEndpoints/useUserByBusiness";
import useStaffAssignment from "@/hooks/cachedEndpoints/useStaffAssignment";
import { getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaRegEnvelope } from "react-icons/fa6";
import toast from "react-hot-toast";
import success from "../../../../../public/assets/images/success.png";

const EditUser = ({ isOpenEdit, user, toggleEdit, refetch }: any) => {
  const { data: staffAssignments } = useStaffAssignment();
  const [isOpenSuccess, setIsOpenSuccess] = useState(false);
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    businessID: businessInformation[0]?.businessId,
    cooperateID: userInformation?.cooperateID,
    isActive: true,
    role: "",
    assignmentId: "",
  });

  // Prefill form data when user prop changes
  useEffect(() => {
    if (user && isOpenEdit) {
      let assignmentValue = "";

      // Check assignedCategoryId first (though it appears to be empty)
      if (user.assignedCategoryId && user.assignedCategoryId !== "") {
        assignmentValue = user.assignedCategoryId.toString();
      } else if (user.assignmentId) {
        assignmentValue = user.assignmentId.toString();
      } else if (user.primaryAssignmentId) {
        assignmentValue = user.primaryAssignmentId.toString();
      } else if (user.staffAssignmentId) {
        assignmentValue = user.staffAssignmentId.toString();
      } else if (user.staffAssignment?.id) {
        assignmentValue = user.staffAssignment.id.toString();
      } else if (user.primaryAssignmentID) {
        assignmentValue = user.primaryAssignmentID.toString();
      } else if (
        user.primaryAssignment &&
        user.primaryAssignment !== "NONE" &&
        staffAssignments
      ) {
        // If we only have the assignment name, try exact match first
        let matchingAssignment = staffAssignments.find(
          (assignment) => assignment.name === user.primaryAssignment
        );

        // If no exact match, try partial matching (e.g., "Point of Sales" contains "POS")
        if (!matchingAssignment) {
          matchingAssignment = staffAssignments.find(
            (assignment) =>
              assignment.name
                .toLowerCase()
                .includes(user.primaryAssignment.toLowerCase()) ||
              user.primaryAssignment
                .toLowerCase()
                .includes(assignment.name.toLowerCase()) ||
              // Check for POS abbreviation
              (user.primaryAssignment
                .toLowerCase()
                .includes("point of sales") &&
                assignment.name.toLowerCase().includes("pos"))
          );
        }

        if (matchingAssignment) {
          assignmentValue = matchingAssignment.id.toString();
        }
      }

      setEditFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        businessID: businessInformation[0]?.businessId,
        cooperateID: userInformation?.cooperateID,
        isActive: user.isActive ?? true,
        role: user.role?.toString() || "",
        assignmentId: assignmentValue,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpenEdit, staffAssignments]);

  const toggleSuccessModal = () => {
    setIsOpenSuccess(!isOpenSuccess);
  };

  const handleInputChange = (e: any) => {
    setResponse(null);

    // Handle both regular inputs and NextUI Select components
    const name = e.target.name;
    const value = e.target.value;

    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      notify({
        title: "Error!",
        text: "User ID is required",
        type: "error",
      });
      return;
    }

    const payload = {
      firstName: editFormData.firstName,
      lastName: editFormData.lastName,
      email: editFormData.email,
      role: +editFormData.role,
      businessID: editFormData.businessID,
      cooperateID: editFormData.cooperateID,
      isActive: editFormData.isActive,
      assignmentId: editFormData.assignmentId,
    };

    setLoading(true);
    const data = await updateUser(payload, user.id);
    setLoading(false);
    setResponse(data);

    if (data?.errors) {
      // Handle validation errors - they're already set in response state
      return;
    }

    if (data?.data?.isSuccessful) {
      toggleEdit();
      toggleSuccessModal();
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };
  const role = [
    {
      label: "Manager",
      value: "0",
    },
    {
      label: "Staff",
      value: "1",
    },
  ];

  const assignmentOptions =
    staffAssignments?.map((assignment) => ({
      label: assignment.name,
      value: assignment.id.toString(), // Ensure value is string to match selectedKeys
    })) || [];

  const handleClose = () => {
    setResponse(null);
    toggleEdit();
  };

  return (
    <>
      <Modal isOpen={isOpenEdit} onOpenChange={handleClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col mt-2 text-black gap-1">
                <h1 className="text-[22px] font-bold leading-6">
                  Update team member
                </h1>
                <p className="text-[14px] font-normal text-grey600">
                  Update details for {user?.firstName} {user?.lastName}
                </p>
              </ModalHeader>
              <ModalBody className="text-black">
                <form onSubmit={submitFormData} autoComplete="off">
                  <div className="flex md:flex-row flex-col gap-5">
                    <CustomInput
                      type="text"
                      name="firstName"
                      label="First name"
                      errorMessage={response?.errors?.firstName?.[0]}
                      onChange={handleInputChange}
                      value={editFormData.firstName}
                      placeholder="First name"
                    />

                    <CustomInput
                      type="text"
                      name="lastName"
                      errorMessage={response?.errors?.lastName?.[0]}
                      onChange={handleInputChange}
                      value={editFormData.lastName}
                      label="Last name"
                      placeholder="Last name"
                    />
                  </div>
                  <Spacer y={6} />
                  <CustomInput
                    type="text"
                    name="email"
                    errorMessage={response?.errors?.email?.[0]}
                    onChange={handleInputChange}
                    value={editFormData.email}
                    label="Email Address"
                    placeholder="Enter email"
                    endContent={
                      <FaRegEnvelope className="text-foreground-500 text-l" />
                    }
                  />

                  <Spacer y={6} />

                  <SelectInput
                    errorMessage={response?.errors?.role?.[0]}
                    label="Role"
                    placeholder="Select a role"
                    name="role"
                    selectedKeys={editFormData?.role ? [editFormData.role] : []}
                    onChange={handleInputChange}
                    value={editFormData?.role}
                    contents={role}
                  />

                  <Spacer y={6} />

                  {editFormData.role === "1" && (
                    <>
                      <SelectInput
                        errorMessage={response?.errors?.assignmentId?.[0]}
                        label="Assignment"
                        placeholder="Select a position"
                        name="assignmentId"
                        selectedKeys={
                          editFormData?.assignmentId
                            ? [editFormData.assignmentId]
                            : []
                        }
                        onChange={handleInputChange}
                        value={editFormData?.assignmentId}
                        contents={assignmentOptions}
                      />
                      <Spacer y={6} />
                    </>
                  )}

                  <CustomButton
                    loading={loading}
                    disabled={loading}
                    type="submit"
                  >
                    Update member
                  </CustomButton>
                  <Spacer y={6} />
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenSuccess} onOpenChange={toggleSuccessModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="text-black flex flex-col justify-center items-center mt-4 text-center">
                <Image
                  src={success}
                  width={100}
                  height={100}
                  className="object-cover rounded-lg"
                  aria-label="success icon"
                  alt="success icon"
                />
                <Spacer y={1} />
                <div className="md:w-[70%] w-full">
                  <h1 className="text-[16px] font-semibold">
                    Team member updated
                  </h1>
                  <p className="text-sm text-grey600">
                    Team member details have been updated successfully
                  </p>
                </div>
                <Spacer y={1} />
                <div className="flex flex-col gap-3 px-4 w-full">
                  <CustomButton
                    onClick={toggleSuccessModal}
                    className="h-[50px] text-white"
                    type="button"
                  >
                    Done
                  </CustomButton>
                </div>
                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditUser;
