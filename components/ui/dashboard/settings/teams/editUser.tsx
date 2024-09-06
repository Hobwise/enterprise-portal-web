'use client';
import { createAdditionalUser } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import SelectInput from '@/components/selectInput';
import useUserByBusiness from '@/hooks/cachedEndpoints/useUserByBusiness';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
  Tooltip,
} from '@nextui-org/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';
import follow from '../../../../../public/assets/images/follow.png';

const EditUser = ({ isOpenEdit, user, toggleEdit }: any) => {
  const { refetch } = useUserByBusiness();
  const [isOpenInviteMore, setIsOpenInviteMore] = useState(false);
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessID: businessInformation[0]?.businessId,
    cooperateID: userInformation?.cooperateID,
    isActive: true,
    role: '',
  });

  const toggleInviteMoreModal = () => {
    setIsOpenInviteMore(!isOpenInviteMore);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setCreateFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e) => {
    e.preventDefault();
    const payload = { ...createFormData, role: +createFormData.role };

    setLoading(true);
    const data = await createAdditionalUser(payload);
    setLoading(false);
    setResponse(data);

    if (data?.data?.isSuccessful) {
      toggleEdit();
      toggleInviteMoreModal();
      setCreateFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        businessID: businessInformation[0]?.businessId,
        cooperateID: userInformation?.cooperateID,
        isActive: true,
        role: '',
      });
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  const role = [
    {
      label: 'Manager',
      value: 0,
    },
    {
      label: 'Staff',
      value: 1,
    },
  ];
  return (
    <>
      <Modal isOpen={isOpenEdit} onOpenChange={() => toggleEdit()}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col mt-2 text-black gap-1'>
                <h1 className='text-[22px]  font-bold leading-4'>
                  Update team member
                </h1>
                <p className='text-[14px] font-[500]  text-grey600'>
                  Enter details to invite a team member
                </p>
              </ModalHeader>
              <ModalBody className='text-black'>
                <form onSubmit={submitFormData} autoComplete='off'>
                  <div className='flex md:flex-row flex-col gap-5'>
                    <CustomInput
                      type='text'
                      name='firstName'
                      label='First name'
                      errorMessage={response?.errors?.firstName?.[0]}
                      onChange={handleInputChange}
                      value={createFormData.firstName}
                      placeholder='First name'
                    />

                    <CustomInput
                      type='text'
                      name='lastName'
                      errorMessage={response?.errors?.lastName?.[0]}
                      onChange={handleInputChange}
                      value={createFormData.lastName}
                      label='Last name'
                      placeholder='Last name'
                    />
                  </div>
                  <Spacer y={6} />
                  <CustomInput
                    type='email'
                    name='email'
                    errorMessage={response?.errors?.email?.[0]}
                    onChange={handleInputChange}
                    value={createFormData.email}
                    label='Email Address'
                    placeholder='Enter email'
                    endContent={
                      <FaRegEnvelope className='text-foreground-500 text-l' />
                    }
                  />

                  <Spacer y={6} />
                  <Tooltip
                    showArrow
                    placement='left'
                    classNames={{
                      base: [
                        // arrow color
                        'before:bg-neutral-400 dark:before:bg-white',
                      ],
                      content: [
                        'py-2 px-4 shadow-xl bg-[#F2F8FF] rounded-md',
                        'text-black bg-gradient-to-br from-white to-neutral-400',
                      ],
                    }}
                    content={
                      <div className='px-1 py-2 space-y-2'>
                        <div className='text-small font-bold'>
                          Password should include
                        </div>
                        <div className='text-tiny'>
                          One uppercase character e.g A,B,C,etc
                        </div>
                        <div className='text-tiny'>
                          One lowercase character e.g a,b,c,etc
                        </div>
                        <div className='text-tiny'>
                          One special character e.g !,@,#,etc
                        </div>
                        <div className='text-tiny'>
                          One number e.g 1,2,3,4 etc
                        </div>
                        <div className='text-tiny'>At least 8 characters </div>
                      </div>
                    }
                  >
                    <div>
                      <CustomInput
                        errorMessage={response?.errors?.password?.[0]}
                        value={createFormData.password}
                        onChange={handleInputChange}
                        type='password'
                        name='password'
                        label='Password'
                        placeholder='Enter password'
                      />
                    </div>
                  </Tooltip>

                  <Spacer y={6} />

                  <SelectInput
                    errorMessage={response?.errors?.role?.[0]}
                    label='Role'
                    placeholder='Select a role'
                    name='role'
                    selectedKeys={[createFormData?.role]}
                    onChange={handleInputChange}
                    value={createFormData?.role}
                    contents={role}
                  />
                  <Spacer y={6} />
                  <CustomButton
                    loading={loading}
                    disabled={loading}
                    type='submit'
                  >
                    Send invite
                  </CustomButton>
                  <Spacer y={6} />
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenInviteMore} onOpenChange={toggleInviteMoreModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className='text-black flex flex-col justify-center items-center mt-4 text-center'>
                <Image
                  src={follow}
                  width={100}
                  height={100}
                  className='object-cover rounded-lg'
                  aria-label='booking icon'
                  alt='booking icon'
                />
                <Spacer y={1} />
                <div className='md:w-[70%] w-full '>
                  <h1 className='text-[16px]  font-semibold'>
                    Team members invited
                  </h1>
                  <p className='text-sm  text-grey600 '>
                    Your team member has been sent an invitation via mail
                  </p>
                </div>
                <Spacer y={1} />
                <div className='flex flex-col gap-3 px-4 w-full'>
                  <CustomButton
                    onClick={() => {
                      toggleInviteMoreModal();
                      onOpenChange();
                    }}
                    className='h-[50px] text-white'
                    type='button'
                  >
                    Add another team member
                  </CustomButton>

                  <CustomButton
                    onClick={toggleInviteMoreModal}
                    type='button'
                    className='h-[50px] bg-white text-black border border-primaryGrey'
                  >
                    View team members
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
