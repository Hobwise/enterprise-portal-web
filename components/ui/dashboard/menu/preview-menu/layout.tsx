'use client';
import {
  createMenuConfiguration,
  uploadFile,
} from '@/app/api/controllers/dashboard/menu';
import { CustomButton } from '@/components/customButton';
import { useGlobalContext } from '@/hooks/globalProvider';
import {
  SmallLoader,
  THREEMB,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
} from '@/lib/utils';
import { Chip, Divider, Spacer, Switch } from '@nextui-org/react';
import imageCompression from 'browser-image-compression';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import toast from 'react-hot-toast';
import { FaList } from 'react-icons/fa';
import { FaSquare } from 'react-icons/fa6';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
import { PiSquaresFourFill } from 'react-icons/pi';
import { CheckIcon } from '../../orders/place-order/data';

interface Column {
  name: string;
  icon: React.ComponentType;
}

const Layout: React.FC = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');
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
  const [imageError, setImageError] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const handleChangeColor = (color: any) => {
    setBackgroundColor(color.hex);
    setImageReference('');
    setSelectedImage('');
  };

  const convertActiveTile = () => {
    const previewStyles: { [key: string]: number } = {
      'List left': 0,
      'List Right': 1,
      'Single column 1': 2,
      'Single column 2': 3,
      'Double column': 4,
    };

    return previewStyles[activeTile];
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setIsLoading(true);

    const payload = {
      layout: convertActiveTile(),
      backgroudStyle: imageReference ? 0 : 1,
      useBackground: isSelectedPreview,
      backgroundColour: backgroundColor,
      imageRef: imageReference ? imageReference : '',
      textColour: selectedTextColor,
    };

    const data = await createMenuConfiguration(
      businessInformation[0]?.businessId,
      payload
    );

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      toast.success('Changes saved');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  const menuFileUpload = async (formData: FormData, file) => {
    setIsLoadingImage(true);
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage(false);
    setImageError('');
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setImageReference(data.data.data);
      setBackgroundColor('');
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
    }
  };

  const handleImageChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return setImageError('File too large');
      }

      // Clean up previous blob URL if it exists
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage);
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append('file', compressedFile);
      menuFileUpload(formData, file);
    }
  };

  const handleClick = (textColor: string) => {
    setSelectedTextColor(textColor);
  };

  const previewColumn: Column[] = [
    {
      name: 'List left',
      icon: (active) => (
        <FaList
          className={`text-[24px]  ${
            activeTile === active ? 'text-primaryColor' : 'text-[#A299BB]'
          }`}
        />
      ),
    },

    {
      name: 'List Right',
      icon: (active) => (
        <FaList
          className={`text-[24px] ${
            activeTile === active ? 'text-primaryColor' : 'text-[#A299BB]'
          } rotate-180`}
        />
      ),
    },
    {
      name: 'Single column 1',
      icon: (active) => (
        <FaSquare
          className={`text-[22px] ${
            activeTile === active ? 'text-primaryColor' : 'text-[#A299BB]'
          }`}
        />
      ),
    },
    {
      name: 'Single column 2',
      icon: (active) => (
        <FaSquare
          className={`text-[22px] ${
            activeTile === active ? 'text-primaryColor' : 'text-[#A299BB]'
          }`}
        />
      ),
    },
    {
      name: 'Double column',
      icon: (active) => (
        <PiSquaresFourFill
          className={`text-[28px] ${
            activeTile === active ? 'text-primaryColor' : 'text-[#A299BB]'
          }`}
        />
      ),
    },
  ];
  useEffect(() => {
    fetchMenuConfig();
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith('blob:')) {
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
            Select how your menu appears to users{' '}
          </p>
        </div>
        <CustomButton
          loading={isLoading}
          disabled={isLoading}
          onClick={submitFormData}
          className={`py-2 px-4 md:mb-0 mb-4 ${
            isLoading ? 'text-white' : 'text-primaryColor'
          }  bg-white border-2 border-primaryColor`}
          backgroundColor="bg-primaryColor"
        >
          {isLoading ? 'Loading...' : 'Save Changes'}
        </CustomButton>
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
            onClick={() => handleClick('#000')}
            startContent={<CheckIcon size={18} />}
            variant="bordered"
            classNames={{
              base: ` cursor-pointer h-8 text-[12px] ${
                selectedTextColor === '#000'
                  ? 'border border-primaryColor text-primaryColor'
                  : 'border border-primaryGrey text-grey400'
              }`,
            }}
          >
            Black text
          </Chip>
          <Chip
            onClick={() => handleClick('#fff')}
            startContent={<CheckIcon size={18} />}
            variant="bordered"
            classNames={{
              base: ` cursor-pointer h-8 text-[12px] ${
                selectedTextColor === '#fff'
                  ? 'border border-primaryColor text-primaryColor'
                  : 'border border-primaryGrey text-grey400'
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
              isSelectedPreview ? '!bg-primaryColor' : 'bg-[#E4E7EC]'
            } `,
          }}
          isSelected={isSelectedPreview}
          onValueChange={setIsSelectedPreview}
        />
      </div>
      <Divider className="my-6 text-[#E4E7EC]" />
      <div className="flex justify-between">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">Background</h1>
          <p className="text-sm xl:w-full w-[150px] text-grey600 md:mb-10 mb-4">
            Set a background for your menu
          </p>
        </div>
        {/* <CustomButton
          loading={isLoading}
          disabled={isLoading}
          //   onClick={submitFormData}
          className='py-2 px-4 md:mb-0 mb-4 text-primaryColor bg-white border-2 border-primaryColor'
          backgroundColor='bg-primaryColor'
        >
          Save Changes
        </CustomButton> */}
      </div>
      <div className="xl:flex w-full justify-between block">
        <div className="xl:w-[calc(50%-1rem)] w-full">
          <label className="font-[500]">Choose a colour</label>
          <div className="rounded-lg w-full  pt-2">
            <SketchPicker
              color={backgroundColor}
              onChangeComplete={handleChangeColor}
              className="!bg-[#F5F5F5] !w-[calc(100%-1.2rem)] !rounded-[8px]"
            />
          </div>
        </div>
        <p className="text-[20px] xl:my-0 my-2 xl:mx-4 mx-0 grid place-content-center text-grey600">
          OR
        </p>

        <div className="xl:w-[calc(50%-1rem)] w-full">
          <label className="font-[500]">Upload image</label>
          <div className="flex relative flex-col p-3 mt-2 h-[calc(100%-2rem)]  border border-dashed rounded-lg justify-center items-center">
            <div className="flex flex-col mt-0 text-black  text-center xl:w-[240px]  w-full gap-2 justify-center items-center">
              {isLoadingImage ? (
                <SmallLoader />
              ) : selectedImage ? (
                <>
                  <div className="w-16 h-16 rounded-lg overflow-hidden mb-2">
                    <img
                      src={selectedImage}
                      alt="Selected background"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-primaryColor text-sm font-medium">
                    Background image uploaded
                  </span>
                  <span className="text-xs text-gray-500">
                    Click to change image
                  </span>
                </>
              ) : (
                <>
                  <MdOutlineAddPhotoAlternate className="text-[42px] text-primaryColor" />
                  <span className="text-black">
                    Drag and drop files to upload or{' '}
                    <span className="text-primaryColor">click here</span> to
                    browse
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
              className="opacity-0 cursor-pointer absolute h-full bottom-0"
            />
          </div>
        </div>

        <span className="text-sm float-left text-danger-600">{imageError}</span>
      </div>
    </article>
  );
};

export default Layout;
