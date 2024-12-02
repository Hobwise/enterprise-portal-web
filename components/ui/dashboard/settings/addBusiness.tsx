'use client';

import { createBusiness } from '@/app/api/controllers/auth';
import { CustomButton } from '@/components/customButton';
import { CustomInput } from '@/components/CustomInput';
import SelectInput from '@/components/selectInput';
import { businessTypes } from '@/lib/businessTypes';
import { companyInfo } from '@/lib/companyInfo';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { Modal, ModalBody, ModalContent, Spacer } from '@nextui-org/react';
import { useState } from 'react';
import States from '../../../../lib/cities.json';

const AddBusiness = ({
  isOpenBusinessModal,
  toggleBusinessModal,
  refetch,
}: any) => {
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
    state: '',
    city: '',
    contactEmailAddress: '',
    contactPhoneNumber: '',
  });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    setResponse(null);
    const { name, value } = e.target;
    setBusinessFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);
    const data = await createBusiness({
      ...businessFormData,
      businessCategory: +businessFormData.businessCategory,
    });

    setLoading(false);
    setResponse(data);
    if (data?.data?.isSuccessful) {
      toggleBusinessModal();
      refetch();
      notify({
        title: 'Success!',
        text: `${businessFormData.name} successfully created`,
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

  const getStates = () => {
    return States.map((state) => ({
      label: state.name,
      value: state.name,
    }));
  };

  const getCities = () => {
    const state = States.find((state) => state.name === businessFormData.state);

    if (state) {
      return state?.cities.map((city) => ({
        label: city,
        value: city,
      }));
    } else {
      return [];
    }
  };
  return (
    <Modal
      size='xl'
      isDismissable={false}
      isOpen={isOpenBusinessModal}
      onOpenChange={toggleBusinessModal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='p-4'>
                <h2 className='text-[28px] text-black leading-8 font-bold '>
                  Tell us about your business
                </h2>
                <Spacer y={8} />
                <form onSubmit={submitFormData} autoComplete='off'>
                  <CustomInput
                    type='text'
                    name='name'
                    label='Business Name'
                    errorMessage={response?.errors?.name?.[0]}
                    onChange={handleInputChange}
                    value={businessFormData.name}
                    placeholder='Name of your business'
                  />
                  <Spacer y={4} />

                  {/* <div className='flex flex-col md:flex-row  gap-3'> */}
                  <CustomInput
                    type='text'
                    name='contactEmailAddress'
                    errorMessage={response?.errors?.contactEmailAddress?.[0]}
                    onChange={handleInputChange}
                    value={businessFormData.contactEmailAddress}
                    label='Business Email'
                    placeholder={`${companyInfo.name}@gmail.com`}
                  />
                  {/* <CustomInput
          type='text'
          name='contactPhoneNumber'
          errorMessage={response?.errors?.contactPhoneNumber?.[0]}
          onChange={handleInputChange}
          value={businessFormData.contactPhoneNumber}
          label='Business Phone Number'
          placeholder='09034545454'
        />
      </div> */}
                  <Spacer y={4} />
                  <CustomInput
                    type='text'
                    name='address'
                    errorMessage={response?.errors?.address?.[0]}
                    onChange={handleInputChange}
                    value={businessFormData.address}
                    label='Business Address'
                    placeholder='Where is your business located '
                  />

                  <Spacer y={4} />
                  <div className='flex flex-col md:flex-row  gap-3'>
                    <SelectInput
                      errorMessage={response?.errors?.state?.[0]}
                      label={'Business State'}
                      name='state'
                      onChange={handleInputChange}
                      value={businessFormData.state}
                      placeholder={'Select state'}
                      contents={getStates()}
                    />

                    <SelectInput
                      errorMessage={response?.errors?.city?.[0]}
                      label={'Business LGA'}
                      name='city'
                      onChange={handleInputChange}
                      value={businessFormData.city}
                      placeholder={'Select lga'}
                      contents={getCities()}
                    />
                  </div>
                  <Spacer y={4} />
                  <SelectInput
                    errorMessage={response?.errors?.businessCategory?.[0]}
                    label={'Business Category'}
                    name='businessCategory'
                    onChange={handleInputChange}
                    value={businessFormData.businessCategory}
                    placeholder={'Business category'}
                    contents={businessTypes}
                  />

                  <Spacer y={8} />
                  <CustomButton
                    loading={loading}
                    disabled={loading}
                    type='submit'
                  >
                    Proceed
                  </CustomButton>
                </form>
                <Spacer y={4} />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddBusiness;
