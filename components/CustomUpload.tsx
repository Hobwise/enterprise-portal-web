'use client';
import { SmallLoader } from '@/lib/utils';
import Image from 'next/image';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';

const CustomImageUpload = ({
  handleImageChange,
  selectedImage,
  removeUploadedFile,
  isLoadingImage,
  type,
  setResponse,
  errorMessage,
  referenceId,
  existingImageUrl,
}: any) => {
  return (
    <div
      className={` bg-[#F9F8FF] h-[200px] border rounded-md ${
        errorMessage ? 'border-danger-500' : 'border-[#F5F5F5]'
      } text-sm font-[400] text-center ${
        selectedImage || existingImageUrl ? 'xl:w-[200px]' : 'w-full'
      }`}
    >
      {selectedImage ? (
        <>
          <Image
            src={selectedImage}
            width={200}
            height={200}
            className='object-cover h-[200px] rounded-md xl:w-[200px] w-full'
            aria-label='uploaded image'
            alt='uploaded image(s)'
          />
          <span
            onClick={() => removeUploadedFile(type, referenceId)}
            className='text-danger-500 float-left cursor-pointer'
          >
            Remove
          </span>
        </>
      ) : (
        <>
          <div
            style={{
              backgroundImage: existingImageUrl && `url(${existingImageUrl})`,
              backgroundSize: 'cover',

              backgroundPosition: 'center',
            }}
            className='flex flex-col h-full relative justify-center items-center  group'
          >
            <div className='flex flex-col mt-0 text-black text-center xl:w-[240px] w-full gap-2 justify-center items-center'>
              {isLoadingImage ? (
                <SmallLoader />
              ) : (
                <>
                  {!existingImageUrl && (
                    <>
                      <MdOutlineAddPhotoAlternate className='text-[42px] text-primaryColor' />
                      <span className='text-black'>
                        Drag and drop files to upload or{' '}
                        <span className='text-primaryColor'>click here</span> to
                        browse
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
            <input
              title='upload an image'
              alt={`upload ${type}`}
              type='file'
              id={`${type}-upload`}
              accept='image/*'
              onChange={(event) => {
                handleImageChange(event, type, referenceId);
                setResponse(null);
              }}
              className='h-[200px] opacity-0 cursor-pointer absolute top-0'
            />
            {existingImageUrl && (
              <div className='hidden group-hover:flex text-xs  cursor-pointer absolute top-0 left-0 w-full h-full justify-center items-center bg-black bg-opacity-50'>
                <span className='text-white  grid px-3 place-content-center'>
                  Update file <span className='font-[600]'>click here</span> to
                  browse
                </span>
                <input
                  title='upload an image'
                  alt={`upload ${type}`}
                  type='file'
                  id={`${type}-upload-update`}
                  accept='image/*'
                  onChange={(event) => {
                    handleImageChange(event, type, referenceId);
                    setResponse(null);
                  }}
                  className='h-[200px] opacity-0 cursor-pointer absolute top-0'
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomImageUpload;
