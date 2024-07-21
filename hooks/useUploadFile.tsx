'use client';
import { deleteFile, uploadFile } from '@/app/api/controllers/dashboard/menu';
import {
  THREEMB,
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
} from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { useState } from 'react';
import toast from 'react-hot-toast';

const useUploadFile = () => {
  const [isLoadingImage, setIsLoadingImage] = useState({});
  const [selectedImages, setSelectedImages] = useState({});
  const [imageReferences, setImageReferences] = useState({});

  const businessInformation = getJsonItemFromLocalStorage('business');

  const menuFileUpload = async (
    formData: FormData,
    file: any,
    type: string
  ) => {
    setIsLoadingImage((prev) => ({ ...prev, [type]: true }));
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage((prev) => ({ ...prev, [type]: false }));

    if (data?.data?.isSuccessful) {
      setSelectedImages((prev) => ({
        ...prev,
        [type]: URL.createObjectURL(file),
      }));
      setImageReferences((prev) => ({
        ...prev,
        [type]: data.data.data,
      }));
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  // const removeUploadedFile = async (
  //   type: string,
  //   referenceId: string,
  //   refetch: any
  // ) => {
  //   const data = await deleteFile(
  //     businessInformation[0]?.businessId,
  //     referenceId || imageReferences[type]
  //   );

  //   if (data?.data?.isSuccessful) {
  //     setSelectedImages((prev) => ({ ...prev, [type]: '' }));
  //     setImageReferences((prev) => ({ ...prev, [type]: '' }));
  //     clearItemLocalStorage('selectedImageCampaign');
  //     toast.success('Image removed');
  //     refetch();
  //   } else if (data?.data?.error) {
  //     notify({
  //       title: 'Error!',
  //       text: data?.data?.error,
  //       type: 'error',
  //     });
  //   }
  // };
  const removeUploadedFile = async (type: string, referenceId: string) => {
    if (referenceId) {
      const data = await deleteFile(
        businessInformation[0]?.businessId,
        referenceId
      );

      if (data?.data?.isSuccessful) {
        setSelectedImages((prev) => ({ ...prev, [type]: '' }));
        setImageReferences((prev) => ({ ...prev, [type]: '' }));
        clearItemLocalStorage('selectedImageCampaign');
        toast.success('Image removed');
      } else if (data?.data?.error) {
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
      }
    } else {
      setSelectedImages((prev) => ({ ...prev, [type]: '' }));
      setImageReferences((prev) => ({ ...prev, [type]: '' }));
    }
  };

  const handleImageChange = async (event: any, type: string) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return toast.success('File too large');
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append('file', compressedFile);
      menuFileUpload(formData, file, type);
    }
  };

  return {
    isLoadingImage,
    selectedImages,
    imageReferences,
    removeUploadedFile,
    handleImageChange,
  };
};

export default useUploadFile;
