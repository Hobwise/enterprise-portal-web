import { updateUser } from '@/app/api/controllers/auth';
import { uploadFile } from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import SelectInput from '@/components/selectInput';
import {
  THREEMB,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
} from '@/lib/utils';
import { Avatar, Divider, Spacer } from '@nextui-org/react';
import imageCompression from 'browser-image-compression';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { MdOutlineMonochromePhotos } from 'react-icons/md';

const Profile = () => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');
  const { email, firstName, lastName, role } = userInformation;

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');
  const [imageReference, setImageReference] = useState('');

  const [updateUserFormData, setUpdateUserFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: email,
    businessID: businessInformation[0]?.businessID,
    cooperateID: userInformation?.cooperateID,
    isActive: true,
    role: String(role),
    id: userInformation?.id,
  });

  const handleInputChange = (e) => {
    setResponse(null);
    const { name, value } = e.target;
    setUpdateUserFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const menuFileUpload = async (formData: FormData, file: any) => {
    const data = await uploadFile(businessInformation[0]?.businessId, formData);

    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setImageReference(data.data.data);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const handleFileChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return toast.error('File too large');
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append('file', compressedFile);
      menuFileUpload(formData, file);
    }
  };

  const submitFormData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await updateUser(updateUserFormData);
    setIsLoading(false);
    setResponse(data);
    if (data?.data?.isSuccessful) {
      notify({
        title: 'Success!',
        text: 'Your profile has been updated',
        type: 'success',
      });
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <section>
      <div className='flex xl:flex-row flex-col justify-between'>
        <div>
          <h1 className='text-[16px] leading-8 font-semibold'>Profile photo</h1>
          <p className='text-sm  text-grey600 md:mb-7 mb-4'>
            This image will be displayed on your profile
          </p>
        </div>
        <div className='flex items-start xl:justify-center justify-start'>
          <label className='cursor-pointer xl:mb-0 mb-3 w-[180px]   flex flex-col text-primaryColor border-2 rounded-xl font-semibold border-primaryColor xl:w-full py-2 px-4 md:mb-0 group text-center'>
            <div className='h-full w-full text-center gap-2 flex items-center'>
              <MdOutlineMonochromePhotos className='text-[22px]' />
              <span>Change Photo</span>
            </div>
            <input
              type='file'
              multiple
              accept='image/*'
              // onChange={handleFileChange}
              className='hidden'
            />
          </label>
        </div>
      </div>
      <Avatar size='lg' className='h-[120px] w-[120px]' src={selectedImage} />
      <Spacer y={6} />
      <Divider className=' text-secondaryGrey' />
      <Spacer y={6} />
      <div className='flex justify-between'>
        <div>
          <h1 className='text-[16px] leading-8 font-semibold'>
            Personal Information
          </h1>
          <p className='text-sm  text-grey600 md:mb-10 mb-4'>
            Update your personal details here
          </p>
        </div>
        <CustomButton
          loading={isLoading}
          disabled={isLoading}
          onClick={submitFormData}
          className='py-2 px-4 md:mb-0 mb-4 text-white'
          backgroundColor='bg-primaryColor'
        >
          Save Changes
        </CustomButton>
      </div>
      <div className='flex md:flex-row flex-col gap-5'>
        <CustomInput
          type='text'
          name='firstName'
          label='First name'
          errorMessage={response?.errors?.firstName?.[0]}
          onChange={handleInputChange}
          value={updateUserFormData.firstName}
          placeholder='First name'
        />

        <CustomInput
          type='text'
          name='lastName'
          errorMessage={response?.errors?.lastName?.[0]}
          onChange={handleInputChange}
          value={updateUserFormData.lastName}
          label='Last name'
          placeholder='Last name'
        />
      </div>
      <Spacer y={6} />
      <CustomInput
        type='email'
        name='email'
        disabled={true}
        errorMessage={response?.errors?.email?.[0]}
        onChange={handleInputChange}
        value={updateUserFormData.email}
        label='Email Address'
        placeholder='Enter email'
      />

      <Spacer y={6} />
      <SelectInput
        errorMessage={response?.errors?.role?.[0]}
        label={'Role'}
        name='role'
        defaultSelectedKeys={[updateUserFormData.role.toString()]}
        onChange={handleInputChange}
        selectedKeys={[updateUserFormData.role.toString()]}
        placeholder={'Role'}
        contents={[
          {
            label: 'Admin',
            value: 0,
          },
          {
            label: 'Operator',
            value: 1,
          },
          {
            label: 'Owner',
            value: 2,
          },
        ]}
      />
    </section>
  );
};

export default Profile;
