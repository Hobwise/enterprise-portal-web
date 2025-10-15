'use client';
import {
  createMenuConfiguration,
  uploadFile,
  getMenuConfiguration,
} from "@/app/api/controllers/dashboard/menu";
import { CustomButton } from "@/components/customButton";
import { useGlobalContext } from "@/hooks/globalProvider";
import {
  SmallLoader,
  THREEMB,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
} from "@/lib/utils";
import { Chip, Divider, Spacer, Switch } from "@nextui-org/react";
import imageCompression from "browser-image-compression";
import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import toast from "react-hot-toast";
import { FaList } from "react-icons/fa";
import { FaSquare } from "react-icons/fa6";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { PiSquaresFourFill } from "react-icons/pi";
import { CheckIcon } from "../../orders/place-order/data";

interface Column {
  name: string;
  icon: React.ComponentType;
}

const Layout: React.FC = () => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const {
    activeTile,
    handleListItemClick,
    isSelectedPreview,
    setIsSelectedPreview,

    backgroundColor,
    setBackgroundColor,
    fetchMenuConfig,
    imageReference,
    setImageReference,
    selectedImage,
    setSelectedImage,
    selectedTextColor,
    setSelectedTextColor,
  } = useGlobalContext();

  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [savedConfig, setSavedConfig] = useState<any>(null);

  const handleChangeColor = (color: any) => {
    setBackgroundColor(color.hex);
    // Allow both color and image to be selected
  };

  const convertActiveTile = () => {
    const previewStyles: { [key: string]: number } = {
      "List left": 0,
      "List Right": 1,
      "Single column 1": 2,
      "Single column 2": 3,
      "Double column": 4,
    };

    return previewStyles[activeTile];
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    console.log("=== SUBMIT START ===");
    console.log("Submit - selectedImage:", selectedImage);
    console.log("Submit - imageReference:", imageReference);
    console.log("Submit - savedConfig:", savedConfig);
    console.log("Submit - savedConfig.imageRef:", savedConfig?.imageRef);

    setIsLoading(true);

    // Determine the final image reference to use
    // Priority:
    // 1. imageReference - if user just uploaded a new image in this session
    // 2. savedConfig.imageRef - the stored reference ID from previous upload
    // 3. empty string
    let finalImageRef = imageReference || savedConfig?.imageRef || "";

    console.log("Submit - finalImageRef to send:", finalImageRef);

    const payload = {
      layout: convertActiveTile(),
      backgroudStyle: finalImageRef ? 0 : 1,
      useBackground: isSelectedPreview,
      backgroundColour: backgroundColor || "",
      imageRef: finalImageRef || "",
      textColour: selectedTextColor || "#000",
    };

    console.log("Submit - payload:", payload);

    const data = await createMenuConfiguration(
      businessInformation[0]?.businessId,
      payload
    );

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      toast.success("Changes saved");
      // Update saved config with the new data
      const updatedConfig = await getMenuConfiguration(
        businessInformation[0]?.businessId
      );
      if (updatedConfig?.data?.isSuccessful) {
        const newConfig = updatedConfig.data.data;
        console.log("=== AFTER SAVE - FETCHED CONFIG ===");
        console.log("After save - fetched config:", newConfig);
        console.log("After save - fetched imageRef:", newConfig?.imageRef);
        console.log("After save - current selectedImage:", selectedImage);
        console.log("After save - current imageReference:", imageReference);

        // Ensure imageRef is preserved - use the one we just saved if API doesn't return it
        const configToSave = {
          ...newConfig,
          imageRef: newConfig?.imageRef || finalImageRef
        };

        console.log("After save - config to save:", configToSave);
        setSavedConfig(configToSave);

        // Preserve the imageReference in global context
        if (finalImageRef) {
          setImageReference(finalImageRef);
          console.log("After save - preserved imageReference in global context:", finalImageRef);
        }

        // IMPORTANT: Don't call fetchMenuConfig here as it might reset the selectedImage
        // The image is already in the state, we just need to preserve it
        console.log("After save - selectedImage should still be:", selectedImage);
      }
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };
  const menuFileUpload = async (formData: FormData, file) => {
    console.log("=== IMAGE UPLOAD START ===");
    setIsLoadingImage(true);
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage(false);
    setImageError("");
    if (data?.data?.isSuccessful) {
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);
      console.log("Image upload - created blob URL:", blobUrl);
      setSelectedImage(blobUrl);

      const imageRef = data.data.data;
      console.log("Image upload - received imageRef from API:", imageRef);
      setImageReference(imageRef);

      // Store imageRef in localStorage for persistence across page reloads
      const storageKey = `menuImageRef_${businessInformation[0]?.businessId}`;
      localStorage.setItem(storageKey, imageRef);
      console.log("Image upload - stored imageRef in localStorage:", storageKey, imageRef);

      // Update savedConfig with the new imageRef
      const updatedConfig = {
        ...savedConfig,
        imageRef: imageRef,
      };
      console.log("Image upload - updating savedConfig:", updatedConfig);
      setSavedConfig(updatedConfig);

      console.log("=== IMAGE UPLOAD COMPLETE ===");
      console.log("Image upload - selectedImage is now:", blobUrl);
      console.log("Image upload - imageReference is now:", imageRef);
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
      console.log("Image upload - error:", data?.data?.error);
    }
  };

  const handleImageChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return setImageError("File too large");
      }

      // Clean up previous blob URL if it exists
      if (selectedImage && selectedImage.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append("file", compressedFile);
      menuFileUpload(formData, file);
    }
  };

  const handleClick = (textColor: string) => {
    setSelectedTextColor(textColor);
  };

  const previewColumn: Column[] = [
    {
      name: "List left",
      icon: (active) => (
        <FaList
          className={`text-[24px]  ${
            activeTile === active ? "text-primaryColor" : "text-[#A299BB]"
          }`}
        />
      ),
    },

    {
      name: "List Right",
      icon: (active) => (
        <FaList
          className={`text-[24px] ${
            activeTile === active ? "text-primaryColor" : "text-[#A299BB]"
          } rotate-180`}
        />
      ),
    },
    {
      name: "Single column 1",
      icon: (active) => (
        <FaSquare
          className={`text-[22px] ${
            activeTile === active ? "text-primaryColor" : "text-[#A299BB]"
          }`}
        />
      ),
    },
    {
      name: "Single column 2",
      icon: (active) => (
        <FaSquare
          className={`text-[22px] ${
            activeTile === active ? "text-primaryColor" : "text-[#A299BB]"
          }`}
        />
      ),
    },
    {
      name: "Double column",
      icon: (active) => (
        <PiSquaresFourFill
          className={`text-[28px] ${
            activeTile === active ? "text-primaryColor" : "text-[#A299BB]"
          }`}
        />
      ),
    },
  ];
  useEffect(() => {
    const loadConfig = async () => {
      console.log("=== INITIAL LOAD ===");

      // Check localStorage for imageRef
      const storageKey = `menuImageRef_${businessInformation[0]?.businessId}`;
      const storedImageRef = localStorage.getItem(storageKey);
      console.log("Initial load - checking localStorage for imageRef:", storageKey, storedImageRef);

      // Fetch config data to store locally
      const configData = await getMenuConfiguration(
        businessInformation[0]?.businessId
      );
      if (configData?.data?.isSuccessful) {
        console.log("Initial load - config data from API:", configData.data.data);

        // Merge with stored imageRef if available
        const configToSave = {
          ...configData.data.data,
          imageRef: storedImageRef || configData.data.data.imageRef || ''
        };
        console.log("Initial load - merged config with localStorage imageRef:", configToSave);
        setSavedConfig(configToSave);

        // Set imageReference in global context if we have it
        if (storedImageRef) {
          setImageReference(storedImageRef);
          console.log("Initial load - restored imageReference from localStorage:", storedImageRef);
        }
      }

      // Also call the global fetch - this will set selectedImage from API
      await fetchMenuConfig();
      console.log("Initial load - after fetchMenuConfig");
    };
    loadConfig();
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);
  return (
    <article className="xl:w-[70%] w-full h-full p-5 border border-[#E4E7EC] rounded-lg">
      <div className="flex justify-between">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">Layout</h1>
          <p className="text-sm xl:w-full w-[150px] text-grey600 md:mb-10 mb-4">
            Select how your menu appears to users{" "}
          </p>
        </div>
        <div className="flex gap-3">
          <CustomButton
            loading={isLoading}
            disabled={isLoading}
            onClick={submitFormData}
            className="w-[150px] bg-transparent border text-primaryColor border-primaryColor"
            // className={`py-2 px-4 md:mb-0 mb-4 w-[150px] ${
            //   isLoading ? "text-white" : "text-primaryColor"
            // }  bg-white border-2 border-primaryColor`}
            backgroundColor="bg-primaryColor"
          >
            {isLoading ? "Loading..." : "Save Changes"}
          </CustomButton>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        {previewColumn.map((column) => {
          return (
            <div
              onClick={() => handleListItemClick(column.name)}
              key={column.name}
              className="grid cursor-pointer place-content-center"
            >
              <div
                className={`w-[104px] grid place-content-center h-[56px] bg-[#EAE5FF80] rounded-lg  `}
              >
                {column.icon(column.name)}
              </div>
              <p className="text-center text-[13px] font-[400] pt-1">
                {column.name}
              </p>
            </div>
          );
        })}
      </div>
      <Divider className="my-6 text-[#E4E7EC]" />
      <div>
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">Text Color</h1>
          <p className="text-sm  text-grey600 ">
            Select whether your text should be white or black
          </p>
        </div>
        <Spacer y={5} />
        <div className="flex items-center gap-3">
          <Chip
            onClick={() => handleClick("#000")}
            startContent={<CheckIcon size={18} />}
            variant="bordered"
            classNames={{
              base: ` cursor-pointer h-8 text-[12px] ${
                selectedTextColor === "#000"
                  ? "border border-primaryColor text-primaryColor"
                  : "border border-primaryGrey text-grey400"
              }`,
            }}
          >
            Black text
          </Chip>
          <Chip
            onClick={() => handleClick("#fff")}
            startContent={<CheckIcon size={18} />}
            variant="bordered"
            classNames={{
              base: ` cursor-pointer h-8 text-[12px] ${
                selectedTextColor === "#fff"
                  ? "border border-primaryColor text-primaryColor"
                  : "border border-primaryGrey text-grey400"
              }`,
            }}
          >
            White text
          </Chip>
        </div>
      </div>
      <Divider className="my-6 text-[#E4E7EC]" />
      <div className="flex justify-between">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">
            Thumbnail Images
          </h1>
          <p className="text-sm  text-grey600 ">Toggle images on and off</p>
        </div>
        <Switch
          classNames={{
            wrapper: `m-0 ${
              isSelectedPreview ? "!bg-primaryColor" : "bg-[#E4E7EC]"
            } `,
          }}
          isSelected={isSelectedPreview}
          onValueChange={setIsSelectedPreview}
        />
      </div>
      <Divider className="my-6 text-[#E4E7EC]" />
      <div className="mb-4">
        <h1 className="text-[16px] leading-8 font-semibold">
          Background & Theme
        </h1>
        <p className="text-sm text-grey600">
          Customize the appearance of your menu with colors and images
        </p>
      </div>

      {/* Color and Image Selection - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Color Selection */}
        <div className="flex flex-col h-full">
          <label className="font-[500] text-sm mb-2 block">
            Primary Color (Optional)
          </label>
          <p className="text-xs text-grey600 mb-3">
            Choose a color for buttons, highlights, and interactive elements
          </p>
          <div className="rounded-lg w-full flex-1 min-h-[320px]">
            <SketchPicker
              color={backgroundColor}
              onChangeComplete={handleChangeColor}
              className="!bg-[#F5F5F5] !w-full !rounded-[8px]"
            />
          </div>
        </div>

        {/* Background Image Upload */}
        <div className="flex flex-col h-full">
          <label className="font-[500] text-sm mb-2 block">
            Background Image (Optional)
          </label>
          <p className="text-xs text-grey600 mb-3">
            Add a background image to enhance your menu's visual appeal
          </p>
          <div className="flex relative flex-col p-6 border-2 border-dashed border-gray-300 rounded-lg justify-center items-center hover:border-primaryColor transition-colors bg-gray-50 flex-1 min-h-[320px]">
            <div className="flex flex-col text-black text-center w-full gap-2 justify-center items-center">
              {isLoadingImage ? (
                <SmallLoader />
              ) : selectedImage ? (
                <>
                  <div className="w-20 h-20 rounded-lg overflow-hidden mb-2 border-2 border-gray-100">
                    <img
                      src={selectedImage}
                      alt="Selected background"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-primaryColor text-sm font-semibold">
                    Background image uploaded
                  </span>
                  <span className="text-xs text-gray-500">
                    Click to change image
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <MdOutlineAddPhotoAlternate className="text-[24px] text-primaryColor" />
                  </div>
                  <span className="text-sm font-medium text-black">
                    Upload Background Image
                  </span>
                  <span className="text-xs text-gray-500">
                    Drag and drop or{" "}
                    <span className="text-primaryColor font-medium">
                      click to browse
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Recommended: 1920x1080px, Max 3MB
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
              className="opacity-0 cursor-pointer absolute inset-0 w-full h-full"
            />
          </div>
          {imageError && (
            <p className="text-sm text-danger-600 mt-2">{imageError}</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default Layout;
