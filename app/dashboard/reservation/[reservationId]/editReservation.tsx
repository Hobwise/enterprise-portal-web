import { uploadFile } from "@/app/api/controllers/dashboard/menu";
import {
  editReservations,
  payloadReservationItem,
} from "@/app/api/controllers/dashboard/reservations";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { CustomTextArea } from "@/components/customTextArea";
import useReservation from "@/hooks/cachedEndpoints/useReservation";
import {
  SmallLoader,
  THREEMB,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
  reservationDuration,
} from "@/lib/utils";
import { InfoCircle } from "@/public/assets/svg";
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spacer,
  Switch,
} from "@nextui-org/react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";

const EditReservation = ({
  isOpenEdit,
  toggleModalEdit,
  reservationItem,
  getReservation,
}: any) => {
  const { refetch } = useReservation();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const [reservationState, setReservationState] =
    useState<payloadReservationItem>({
      reservationName: reservationItem?.reservationName || "",
      reservationDescription: reservationItem?.reservationDescription || "",
      reservationFee: +reservationItem?.reservationFee || 0,
      minimumSpend: reservationItem?.minimumSpend || 0,
      quantity: reservationItem?.quantity || 0,
      imageReference: reservationItem?.imageReference || "",
      startTime: reservationItem?.startTime || "",
      endTime: reservationItem?.endTime || "",
      reservationDuration: reservationItem?.reservationDuration || "",
      allowSystemAdvert: reservationItem?.allowSystemAdvert || !true,
      numberOfSeat: reservationItem?.numberOfSeat || 1,
    });

    console.log(reservationItem);
    
  useEffect(() => {
    setReservationState({
      reservationName: reservationItem?.reservationName,
      reservationDescription: reservationItem?.reservationDescription,
      reservationFee: +reservationItem?.reservationFee,
      minimumSpend: reservationItem?.minimumSpend,
      quantity: reservationItem?.quantity,
      imageReference: reservationItem?.imageReference || "",
      startTime: reservationItem?.startTime || "",
      endTime: reservationItem?.endTime || "",
      reservationDuration: reservationItem?.reservationDuration || "",
      allowSystemAdvert: reservationItem?.allowSystemAdvert || !true,
      numberOfSeat: reservationItem?.numberOfSeat || 1,
    });
  }, [reservationItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setReservationState((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const menuFileUpload = async (formData: FormData, file) => {
    setIsLoadingImage(true);
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage(false);
    setImageError("");
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setReservationState({
        ...reservationState,
        imageReference: data.data.data,
      });
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const handleImageChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return setImageError("File too large");
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append("file", compressedFile);
      menuFileUpload(formData, file);
    }
  };

  const reservationRequirement = () => {
    if (reservationState.reservationFee) {
      return 0;
    } else if (reservationState.minimumSpend) {
      return 1;
    } else if (
      reservationState.minimumSpend &&
      reservationState.reservationFee
    ) {
      return 3;
    } else {
      return 2;
    }
  };

  const updateReservation = async (loading = true) => {
    loading && setIsLoading(true);
    function convertTimeFormat(time: string): string {
      const parts = time.split(":");
      return parts.slice(0, 2).join(":");
    }
    const payload = {
      reservationName: reservationState?.reservationName,
      reservationDescription: reservationState?.reservationDescription,
      reservationFee: +reservationState?.reservationFee,
      minimumSpend: reservationState?.minimumSpend,
      quantity: Number(reservationState?.quantity),
      reservationRequirement: reservationRequirement(),
      imageReference: reservationState?.imageReference,
      reservationDuration: reservationState.reservationDuration,
      allowSystemAdvert: reservationState.allowSystemAdvert,
      startTime: convertTimeFormat(reservationState?.startTime),
      endTime: convertTimeFormat(reservationState?.endTime),
      numberOfSeat: Number(reservationState.numberOfSeat),
    };

    const data = await editReservations(
      businessInformation[0]?.businessId,
      payload,
      reservationItem?.id
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      toast.success("Reservation updated successfully");
      toggleModalEdit();
      getReservation();
      refetch();
      setSelectedImage("");
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const handleDurationSelect = (value: number) => {
    setReservationState((prev) => ({
      ...prev,
      reservationDuration:
        prev.reservationDuration === value ? undefined : value,
    }));
  };

  const handleToggle = async (isSelected: boolean) => {
    setReservationState({
      ...reservationState,
      allowSystemAdvert: isSelected,
    });
  };

  const handleNumberOfSeatChange = (type: "increment" | "decrement") => {
    setReservationState((prevState) => ({
      ...prevState,
      numberOfSeat:
        type === "increment"
          ? Number(prevState.numberOfSeat || 0) + 1
          : Math.max(1, Number(prevState.numberOfSeat || 0) - 1),
    }));
  };

  return (
    <Modal
      classNames={{
        wrapper: "overflow-hidden z-[9999]",
      }}
      size="5xl"
      isOpen={isOpenEdit}
      onOpenChange={() => {
        setReservationState({
          reservationName: reservationItem?.reservationName || "",
          reservationDescription: reservationItem?.reservationDescription || "",
          reservationFee: +reservationItem?.reservationFee || 0,
          minimumSpend: reservationItem?.minimumSpend || 0,
          quantity: reservationItem?.quantity || 0,
          imageReference: reservationItem?.imageReference || "",
          startTime: reservationItem?.startTime || "",
          endTime: reservationItem?.endTime || "",
          reservationDuration: reservationItem?.reservationDuration || "",
          allowSystemAdvert: reservationItem?.allowSystemAdvert || false,
          numberOfSeat: reservationItem?.numberOfSeat || 1,
        });
        setSelectedImage("");
        toggleModalEdit();
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h1 className=" text-xl mt-3 font-[600] text-black">
                Edit Reservation
              </h1>
              <div className="flex lg:flex-row flex-col gap-6 lg:h-[450px] overflow-y-auto h-full">
                <div className={`flex-grow xl:h-auto lg:w-1/2 w-full `}>
                  <label className="flex xl:my-2 m-0 justify-between  bg-white">
                    <p className="text-[#475467] text-[14px] font-[400]">
                      Maximum of 3MB
                    </p>
                  </label>
                  <div
                    className={`lg:h-[calc(100%-2rem)] bg-[#F9F8FF] h-[200px] border   mt-2 rounded-md ${
                      imageError ? "border-danger-600" : "border-[#F5F5F5]"
                    }   text-sm font-[400] text-center relative`}
                  >
                    {selectedImage || reservationState?.imageReference ? (
                      <>
                        <Image
                          src={
                            selectedImage ||
                            `data:image/jpeg;base64,${reservationItem?.image}`
                          }
                          style={{ objectFit: "cover" }}
                          width={150}
                          height={150}
                          className="object-cover h-full rounded-lg w-full"
                          aria-label="uploaded image"
                          alt="uploaded image(s)"
                        />
                        <span
                          onClick={() => {
                            setSelectedImage("");
                            setReservationState({
                              ...reservationState,
                              imageReference: "",
                            });
                          }}
                          className="text-danger-500 float-left cursor-pointer"
                        >
                          Remove
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col h-full justify-center items-center">
                        <div className="flex flex-col mt-0 text-black text-center xl:w-[240px]  w-full gap-2 justify-center items-center">
                          {isLoadingImage ? (
                            <SmallLoader />
                          ) : (
                            <>
                              <MdOutlineAddPhotoAlternate className="text-[42px] text-primaryColor" />
                              <span className="text-black">
                                Drag and drop files to upload or{" "}
                                <span className="text-primaryColor">
                                  click here
                                </span>{" "}
                                to browse
                              </span>
                            </>
                          )}
                        </div>
                        <input
                          title="upload an image"
                          alt="upload a menu"
                          type="file"
                          id="menu-upload"
                          accept="image/*"
                          onChange={(event) => handleImageChange(event)}
                          className="h-full w-full opacity-0 cursor-pointer absolute top-0"
                        />
                      </div>
                    )}

                    <span className="text-sm float-left text-danger-600">
                      {imageError}
                    </span>
                  </div>
                </div>
                <div className="flex-grow  lg:w-1/2 w-full mt-3">
                  <CustomInput
                    type="text"
                    value={reservationState.reservationName}
                    errorMessage={response?.errors?.reservationName?.[0]}
                    onChange={handleInputChange}
                    name="reservationName"
                    label="Name of reservation"
                    placeholder="name of reservation"
                  />
                  <Spacer y={6} />
                  <CustomTextArea
                    value={reservationState.reservationDescription}
                    name="reservationDescription"
                    onChange={handleInputChange}
                    label="Add a description for this reservation"
                    placeholder="Add a description"
                  />
                  <Spacer y={6} />
                  <div className="flex gap-6">
                    <CustomInput
                      type="text"
                      disabled={true}
                      startContent={<div className="text-black">₦</div>}
                      name="reservationFee"
                      errorMessage={response?.errors?.reservationFee?.[0]}
                      onChange={handleInputChange}
                      value={`${reservationState.reservationFee}`}
                      label="Reservation fee"
                      placeholder="Reservation fee"
                    />

                    <CustomInput
                      type="text"
                      startContent={<div className="text-black">₦</div>}
                      name="minimumSpend"
                      errorMessage={response?.errors?.minimumSpend?.[0]}
                      onChange={handleInputChange}
                      value={`${reservationState.minimumSpend}`}
                      label="Minimum spend"
                      placeholder="Minimum spend"
                    />
                  </div>
                  <Spacer y={6} />
                  <div className="flex lg:flex-row flex-col gap-6">
                    <CustomInput
                      type="time"
                      name="startTime"
                      errorMessage={response?.errors?.startTime?.[0]}
                      onChange={handleInputChange}
                      value={`${reservationState.startTime}`}
                      label="Start Time"
                      placeholder="Start Time"
                    />

                    <CustomInput
                      type="time"
                      name="endTime"
                      min={reservationState.startTime}
                      errorMessage={response?.errors?.endTime?.[0]}
                      onChange={handleInputChange}
                      value={`${reservationState.endTime}`}
                      label="End Time"
                      placeholder="End Time"
                    />
                  </div>
                  <Spacer y={6} />
                  <CustomInput
                    type="number"
                    name="quantity"
                    errorMessage={response?.errors?.quantity?.[0]}
                    onChange={handleInputChange}
                    value={`${reservationState.quantity}`}
                    label={"Quantity"}
                    placeholder={"Quantity"}
                  />
                  <Spacer y={6} />
                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Number of seat(s)</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <button
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        disabled={Number(reservationState.numberOfSeat) <= 1}
                        role="button"
                        onClick={() => handleNumberOfSeatChange("decrement")}
                      >
                        -
                      </button>
                      <p className="font-medium w-4 flex justify-center items-center">
                        {reservationState.numberOfSeat || 1}
                      </p>
                      <button
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        role="button"
                        onClick={() => handleNumberOfSeatChange("increment")}
                      >
                        +
                      </button>
                    </div>
                  </div>{" "}
                  <Spacer y={6} />
                  <div className="bg-[#F0F2F4] p-4 text-[#5A5A63]  items-baseline space-x-2 space-y-2 rounded-lg">
                    <p className="text-sm">
                      Duration: Select a duration if this reservation is
                      time-sensitive. (Optional)
                    </p>
                    <div className="flex justify-between  items-center">
                      <div className="flex flex-wrap gap-2">
                        {reservationDuration.map((item) => (
                          <Chip
                            key={item.value}
                            onClick={() => handleDurationSelect(item.value)}
                            className={`cursor-pointer transition-colors ${
                              reservationState.reservationDuration ===
                              item.value
                                ? "bg-primaryColor text-white"
                                : "bg-white text-[#5A5A63]"
                            }`}
                            classNames={{
                              base: "text-xs h-7",
                              content: "px-3",
                            }}
                          >
                            {item.label}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <Spacer y={3} />
                    <hr className="my-4 text-secondaryGrey" />
                    <Spacer y={3} />
                    <p className="text-sm">
                      Allow System Advertisement: Disable this option if you do
                      not wish for the system to promote this reservation.
                    </p>
                    <div className="bg-primaryGrey inline-flex px-4 py-2 rounded-lg  gap-3 items-center">
                      <span
                        className={
                          !reservationState.allowSystemAdvert
                            ? "text-primaryColor text-bold text-sm"
                            : "text-grey400 text-sm"
                        }
                      >
                        Disable
                      </span>

                      <Switch
                        size="sm"
                        classNames={{
                          wrapper: `m-0 ${
                            reservationState.allowSystemAdvert
                              ? "!bg-primaryColor"
                              : "bg-[#E4E7EC]"
                          } `,
                        }}
                        name="allowSystemAdvert"
                        defaultChecked={reservationState.allowSystemAdvert}
                        onChange={(e) => handleToggle(e.target.checked)}
                        isSelected={reservationState.allowSystemAdvert}
                        aria-label="allow system advert"
                      />

                      <span
                        className={
                          reservationState.allowSystemAdvert
                            ? "text-primaryColor text-bold text-sm"
                            : "text-grey400 text-sm"
                        }
                      >
                        Enable
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <CustomButton
                className="w-32 mb-3 font-bold text-white"
                loading={isLoading}
                onClick={updateReservation}
                type="submit"
              >
                {isLoading ? "Loading" : "Save"}
              </CustomButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditReservation;
