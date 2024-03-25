'use client';
import { CustomInput } from '@/components/CustomInput';
import SelectInput from '@/components/selectInput';
import { Spacer } from '@nextui-org/react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomButton } from '@/components/customButton';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { createBusiness } from '@/app/api/controllers/auth';

const BusinessInformationForm = () => {
  const router = useRouter();
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [businessFormData, setBusinessFormData] = useState({
    name: '',
    cooperateID: userInformation?.cooperateID,
    address: '',
    businessCategory: '',
    resistrationNumber: '',
    resistrationCertificateImageReference: '',
    nin: '',
    identificationImageReference: '',
    primaryBrandColour: '',
    secondaryBrandColour: '',
    logoImageReference: '',
  });

  const handleInputChange = (e) => {
    setResponse(null);
    const { name, value } = e.target;
    setBusinessFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await createBusiness({
      ...businessFormData,
      businessCategory: +businessFormData.businessCategory,
    });
    setLoading(false);
    setResponse(data);
    if (data?.data?.isSuccessful) {
      router.push('/dashboard');
    } else if (data?.data?.error) {
      notify({ message: data?.data?.error, type: 'error' });
    }
  };

  return (
    <form onSubmit={submitFormData} autoComplete='off'>
      <CustomInput
        type='text'
        name='name'
        label='Business name'
        errorMessage={response?.errors?.name?.[0]}
        onChange={handleInputChange}
        value={businessFormData.name}
        placeholder='Name of your business'
      />
      <Spacer y={6} />
      <CustomInput
        type='text'
        name='address'
        errorMessage={response?.errors?.address?.[0]}
        onChange={handleInputChange}
        value={businessFormData.address}
        label='Business address'
        placeholder='Where is your business located'
      />
      <Spacer y={6} />
      <SelectInput
        errorMessage={response?.errors?.businessCategory?.[0]}
        label={'Business category'}
        name='businessCategory'
        onChange={handleInputChange}
        value={businessFormData.businessCategory}
        placeholder={'Business category'}
        contents={[
          {
            label: 'Business center',
            value: 0,
          },
          {
            label: 'Logistics',
            value: 1,
          },
          {
            label: 'Bar',
            value: 2,
          },
          {
            label: 'Restaurant',
            value: 3,
          },
          {
            label: 'Club',
            value: 4,
          },
          {
            label: 'Cafe',
            value: 5,
          },
          {
            label: 'Hotel',
            value: 6,
          },
        ]}
      />

      <Spacer y={8} />
      <CustomButton loading={loading} disabled={loading} type='submit'>
        Proceed
      </CustomButton>
    </form>
  );
};

export default BusinessInformationForm;
