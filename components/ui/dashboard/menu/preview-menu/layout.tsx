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

  setIsLoading(true);

  // Check localStorage for all config values
  const storageKey = `menuImageRef_${businessInformation[0]?.businessId}`;
  const storedImageRef = localStorage.getItem(storageKey);

  // IMPROVED: Build a comprehensive fallback chain for imageRef
  // Priority: current imageReference → savedConfig → localStorage → empty
  const finalImageRef =
    imageReference || savedConfig?.imageRef || storedImageRef || "";

  // Layout - use current state (user just selected) or fall back to savedConfig
  const finalLayout = convertActiveTile();

  // Background color - use current state or fall back to savedConfig
  const finalBackgroundColor =
    backgroundColor || savedConfig?.backgroundColour || "";

  // Text color - use current state or fall back to savedConfig
  const finalTextColor = selectedTextColor || savedConfig?.textColour || "#000";

  // Use background - use current state or fall back to savedConfig
  const finalUseBackground =
    isSelectedPreview ?? savedConfig?.useBackground ?? false;

  const payload = {
    layout: finalLayout,
    backgroudStyle: finalImageRef ? 0 : 1, // 0 if image exists, 1 for color
    useBackground: finalUseBackground,
    backgroundColour: finalBackgroundColor,
    imageRef: finalImageRef, // CRITICAL: Always include imageRef
    textColour: finalTextColor,
  };

  const data = await createMenuConfiguration(
    businessInformation[0]?.businessId,
    payload
  );

  setIsLoading(false);

  if (data?.data?.isSuccessful) {
    toast.success("Changes saved");

    // CRITICAL: Always persist imageRef to localStorage if it exists
    if (finalImageRef) {
      localStorage.setItem(storageKey, finalImageRef);
    }

    // Update saved config with the new data
    const updatedConfig = await getMenuConfiguration(
      businessInformation[0]?.businessId
    );

    if (updatedConfig?.data?.isSuccessful) {
      const newConfig = updatedConfig.data.data;

      // CRITICAL: Preserve ALL fields, especially imageRef
      // If API doesn't return imageRef, use what we just saved
      const configToSave = {
        ...newConfig,
        layout: newConfig?.layout ?? finalLayout,
        backgroundColour: newConfig?.backgroundColour || finalBackgroundColor,
        textColour: newConfig?.textColour || finalTextColor,
        useBackground: newConfig?.useBackground ?? finalUseBackground,
        // IMPORTANT: Never lose imageRef - use API value or fall back to what we saved
        imageRef: newConfig?.imageRef || finalImageRef,
      };
      setSavedConfig(configToSave);

      // CRITICAL: Update global context with preserved values
      // This ensures the next submit will have access to these values
      if (finalImageRef) {
        setImageReference(finalImageRef);
      }
      if (finalBackgroundColor) {
        setBackgroundColor(finalBackgroundColor);
      }
      if (finalTextColor) {
        setSelectedTextColor(finalTextColor);
      }
      setIsSelectedPreview(finalUseBackground);
    }
  } else if (data?.data?.error) {
    notify({
      title: "Error!",
      text: data?.data?.error,
      type: "error",
    });
  }
};

const menuFileUpload = async (formData: FormData, file: File) => {
  setIsLoadingImage(true);

  const data = await uploadFile(businessInformation[0]?.businessId, formData);
  setIsLoadingImage(false);
  setImageError("");

  if (data?.data?.isSuccessful) {
    // Create blob URL for immediate preview
    const blobUrl = URL.createObjectURL(file);
    const imageRef = data.data.data;

    // CRITICAL: Update both selectedImage and imageReference immediately
    setSelectedImage(blobUrl);
    setImageReference(imageRef);

    // CRITICAL: Store imageRef in localStorage for persistence
    const storageKey = `menuImageRef_${businessInformation[0]?.businessId}`;
    localStorage.setItem(storageKey, imageRef);

    // CRITICAL: Update savedConfig to include the new imageRef
    setSavedConfig((prev) => ({
      ...prev,
      imageRef: imageRef,
    }));

    // Show success message
    toast.success("Image uploaded successfully");
  } else if (data?.data?.error) {
    setImageError(data?.data?.error);
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
    // Check localStorage for imageRef
    const storageKey = `menuImageRef_${businessInformation[0]?.businessId}`;
    const storedImageRef = localStorage.getItem(storageKey);

    // Fetch config data to store locally and set up initial state
    const configData = await getMenuConfiguration(
      businessInformation[0]?.businessId
    );
    if (configData?.data?.isSuccessful) {
      const apiConfig = configData.data.data;

      // Merge with stored imageRef if available - prioritize localStorage for imageRef
      const apiImageRef = apiConfig.imageRef || "";
      const finalImageRef = storedImageRef || apiImageRef;

      const configToSave = {
        ...apiConfig,
        imageRef: finalImageRef,
      };
      setSavedConfig(configToSave);

      // Set imageReference in global context - prioritize localStorage
      if (finalImageRef) {
        setImageReference(finalImageRef);
      }

      // Initialize all other fields from the saved config if they're not already set
      // This ensures that when the component loads, it has the full config available
      if (apiConfig.backgroundColour && !backgroundColor) {
        setBackgroundColor(apiConfig.backgroundColour);
      }
      if (apiConfig.textColour && !selectedTextColor) {
        setSelectedTextColor(apiConfig.textColour);
      }
      // Note: useBackground and layout are set by fetchMenuConfig below
    }

    // Also call the global fetch - this will set selectedImage, layout, and other fields from API
    await fetchMenuConfig();
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
