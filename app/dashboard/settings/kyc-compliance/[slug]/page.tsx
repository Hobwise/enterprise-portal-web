'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import { options } from '@/app/dashboard/settings/kyc-compliance/verification-types';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { useMutation } from 'react-query';
import {
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
  THREEMB,
} from '@/lib/utils';
import { deleteFile, uploadFile } from '@/app/api/controllers/dashboard/menu';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { updateUser } from '@/app/api/controllers/auth';
import { CustomButton } from '@/components/customButton';
import useUser from '@/hooks/cachedEndpoints/useUser';
import { SETTINGS_URL } from '@/utilities/routes';
import useGetBusinessByCooperate from '@/hooks/cachedEndpoints/useGetBusinessByCooperate';
import api from '@/app/api/apiService';
import { AUTH } from '@/app/api/api-url';
import { RxCross2 } from 'react-icons/rx';
import { LuLoader } from 'react-icons/lu';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/modal';
import Image from 'next/image';

const FileUploadInput = ({
  id,
  label,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label
    htmlFor={id}
    className="flex flex-col items-center justify-center border border-dashed border-secondaryGrey rounded-[10px] py-6 text-[10px] space-y-2"
  >
    <div className="flex items-center justify-center rounded-full w-5 h-5 bg-[#F9FAFB]">
      <IoCloudUploadOutline />
    </div>
    <div className="text-center">
      <p className="text-[#475367]">
        <span className="font-semibold text-primaryColor">Click to upload</span>{' '}
        {label}
      </p>
      <p className="text-[#98A2B3]">{placeholder}</p>
    </div>
    <input type="file" id={id} className="hidden" onChange={onChange} />
  </label>
);

const PersonalVerificationForm = () => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');

  const userQuery = useUser();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selfieReference, setSelfieReference] = useState('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [idReference, setIdReference] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);

  const [nin, setNin] = useState('');
  const [type, setType] = useState('');
  const [isSelfie, setIsSelfie] = useState<boolean | null>(null);

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      uploadFile(businessInformation[0]?.businessId, formData),
    onSuccess: (data) => {
      if (data?.data?.isSuccessful) {
        if (type === 'selfie') {
          setSelfieReference(data?.data.data);
        } else {
          setIdReference(data?.data.data);
        }
      } else {
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
      }
    },
  });

  const removeFileMutation = useMutation({
    mutationFn: (idType: 'selfie' | 'id') => {
      const imageReference =
        idType === 'selfie' ? selfieReference : idReference;
      return deleteFile(
        businessInformation[0]?.businessId,
        imageReference as string
      );
    },
    onSuccess: (data, idType) => {
      if (data?.data.isSuccessful) {
        if (idType === 'selfie') {
          setSelfieFile(null);
          setSelfiePreviewUrl(null);
          setSelfieReference('');
        } else {
          setIdFile(null);
          setIdPreviewUrl(null);
          setIdReference(data?.data.data);
        }
      }
    },
  });

  const handleFileChange = async (event: any) => {
    setType(event.target.id);
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return toast.error('File too large');
      }
      const compressedFile = await imageCompression(file, imageCompressOptions);

      if (event.target.id === 'selfie') {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setSelfiePreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
        setSelfieFile(compressedFile);
      } else {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setIdPreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
        setIdFile(compressedFile);
      }
      const formData = new FormData();
      formData.append('file', compressedFile);
      uploadFileMutation.mutate(formData);
    }
  };

  const updateUserMutation = useMutation({
    mutationFn: (payload) => updateUser(payload, userInformation?.id),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        router.replace(`${SETTINGS_URL}/kyc-compliance`);
      }
    },
  });

  const handlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...userQuery.data,
      ...(selfieReference && { imageReference: selfieReference }),
      identificationNumberImageReference: idReference,
      identificationNumber: nin,
    };
    updateUserMutation.mutate(payload);
  };

  if (userQuery.isLoading) return <p>Loading...</p>;

  return (
    <>
      <form className="space-y-3 w-[67.5%]" onSubmit={handlSubmit}>
        {!userQuery.data?.imageReference && (
          <div className="space-y-2">
            <div className="font-medium text-sm text-[#344054]">
              Selfie Upload
            </div>
            <FileUploadInput
              id="selfie"
              label="your SELFIE"
              placeholder="SVG, PNG, JPG or GIF (max. 800x400px)"
              onChange={handleFileChange}
            />
            {selfieFile && (
              <div className="flex items-center gap-3 text-primary text-xs">
                <p
                  className="cursor-pointer"
                  onClick={() => {
                    setIsSelfie(true);
                    onOpen();
                  }}
                >
                  {selfieFile.name}
                </p>
                {removeFileMutation.variables === 'selfie' &&
                removeFileMutation.isLoading ? (
                  <LuLoader className="animate-spin" />
                ) : (
                  <RxCross2
                    onClick={() => removeFileMutation.mutate('selfie')}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <div className="space-y-2">
          <div className="font-medium text-sm text-[#344054]">
            Submit means of identification
          </div>
          <FileUploadInput
            id="id"
            label="a a VALID ID"
            placeholder="SVG, PNG, JPG or GIF (max. 800x400px)"
            onChange={handleFileChange}
          />
          {idFile ? (
            <div className="flex items-center gap-3 text-primary text-xs">
              <p
                className="cursor-pointer"
                onClick={() => {
                  setIsSelfie(false);
                  onOpen();
                }}
              >
                {idFile.name}
              </p>
              {removeFileMutation.variables === 'id' &&
              removeFileMutation.isLoading ? (
                <LuLoader className="animate-spin" />
              ) : (
                <RxCross2 onClick={() => removeFileMutation.mutate('id')} />
              )}
            </div>
          ) : (
            <p className="text-[10px] text-[#AFAFAF]">
              You can submit your National identification card, NIN slip,
              Drivers license, International passport or Voters card
            </p>
          )}
          <div className="flex flex-col space-y-2">
            <label htmlFor="nin" className="font-medium text-sm text-[#344054]">
              National Identification Number ( NIN )
            </label>
            <input
              type="text"
              className="p-4 rounded-xl bg-[#F3F3F3] focus:border focus:border-primaryColor focus:outline-none text-sm"
              placeholder="Enter NIN here"
              value={nin}
              onChange={(e) => setNin(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-[#AFAFAF]">
            Ensure the name on your NIN matches your name
          </p>
        </div>
        <div className="flex justify-end">
          <CustomButton
            loading={updateUserMutation.isLoading}
            className="w-[200px] h-[50px] text-white font-medium"
          >
            Submit
          </CustomButton>
        </div>
      </form>{' '}
      <Modal isOpen={isOpen} size="sm" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Document Image
              </ModalHeader>
              <ModalBody>
                <Image
                  src={
                    isSelfie ? String(selfiePreviewUrl) : String(idPreviewUrl)
                  }
                  width={500}
                  height={300}
                  alt="Document image"
                />
              </ModalBody>
              <ModalFooter>
                <CustomButton onClick={() => onClose()}>Close</CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

const BusinessVerificationForm = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const businessQuery = useGetBusinessByCooperate();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [pobReference, setPobReference] = useState('');
  const [pobFile, setPobFile] = useState<File | null>(null);
  const [pobPreviewUrl, setPobPreviewUrl] = useState<string | null>(null);
  const [pobaReference, setPobaReference] = useState('');
  const [pobaFile, setPobaFile] = useState<File | null>(null);
  const [pobaPreviewUrl, setPobaPreviewUrl] = useState<string | null>(null);
  const [isPob, setIsPob] = useState<boolean | null>(null);

  const [tin, setTin] = useState('');
  const [type, setType] = useState('');

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      uploadFile(businessInformation[0]?.businessId, formData),
    onSuccess: (data) => {
      if (data?.data?.isSuccessful) {
        if (type === 'pob') {
          setPobReference(data?.data.data);
        } else {
          setPobaReference(data?.data.data);
        }
      } else {
        setPobFile(null);
        setPobPreviewUrl(null);
        setPobaFile(null);
        setPobaPreviewUrl(null);
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
      }
    },
  });

  const removeFileMutation = useMutation({
    mutationFn: (idType: 'pob' | 'poba') => {
      const imageReference = idType === 'pob' ? pobReference : pobaReference;
      return deleteFile(
        businessInformation[0]?.businessId,
        imageReference as string
      );
    },
    onSuccess: (data, idType) => {
      if (data?.data.isSuccessful) {
        if (idType === 'pob') {
          setPobFile(null);
          setPobPreviewUrl(null);
          setPobReference('');
        } else {
          setPobaFile(null);
          setPobaPreviewUrl(null);
          setPobaReference('');
        }
      }
    },
  });

  const handleFileChange = async (event: any) => {
    setType(event.target.id);
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return toast.error('File too large');
      }
      const compressedFile = await imageCompression(file, imageCompressOptions);

      if (event.target.id === 'pob') {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setPobPreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
        setPobFile(compressedFile);
      } else {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setPobaPreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
        setPobaFile(compressedFile);
      }
      const formData = new FormData();
      formData.append('file', compressedFile);
      uploadFileMutation.mutate(formData);
    }
  };

  const updateBusinessMutation = useMutation({
    mutationFn: (payload) =>
      api.put(AUTH.registerBusiness, payload, {
        headers: {
          businessId: businessInformation[0]?.businessId,
        },
      }),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        router.replace(`${SETTINGS_URL}/kyc-compliance`);
      }
    },
    onError: () => {
      notify({
        title: 'Error!',
        text: 'Failed to update record',
        type: 'error',
      });
    },
  });

  const handlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...businessQuery.data[0],
      registrationNumber,
      resistrationCertificateImageReference: pobReference,
      addressProofImageReference: pobaReference,
      taxIdentificationNumber: tin,
    };
    updateBusinessMutation.mutate(payload);
  };

  return (
    <>
      <form className="space-y-3 w-[67.5%]" onSubmit={handlSubmit}>
        <div className="flex flex-col space-y-2">
          <label htmlFor="nin" className="font-medium text-sm text-[#344054]">
            RC/BN Number
          </label>
          <input
            type="text"
            className="p-4 rounded-xl bg-[#F3F3F3] focus:border focus:border-primaryColor focus:outline-none text-sm"
            placeholder="Enter RC/BN here"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="font-medium text-sm text-[#344054]">
            Proof of business registration
          </div>
          <FileUploadInput
            id="pob"
            label="your CAC CERTIFICATE"
            placeholder="SVG, PNG, JPG or GIF (max. 800x400px)"
            onChange={handleFileChange}
          />
          {pobFile ? (
            <div className="flex items-center gap-3 text-primary text-xs">
              <p
                className="cursor-pointer"
                onClick={() => {
                  setIsPob(true);
                  onOpen();
                }}
              >
                {pobFile.name}
              </p>
              {removeFileMutation.variables === 'pob' &&
              removeFileMutation.isLoading ? (
                <LuLoader className="animate-spin" />
              ) : (
                <RxCross2 onClick={() => removeFileMutation.mutate('pob')} />
              )}
            </div>
          ) : (
            <p className="text-[10px] text-[#AFAFAF]">
              Ensure that RC/BN number matches with your registration document
              provided
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="font-medium text-sm text-[#344054]">
            Proof of business address
          </div>
          <FileUploadInput
            id="poba"
            label="your BUSINESS UTILITY BILL"
            placeholder="SVG, PNG, JPG or GIF (max. 800x400px)"
            onChange={handleFileChange}
          />
          {pobaFile ? (
            <div className="flex items-center gap-3 text-primary text-xs">
              <p
                className="cursor-pointer"
                onClick={() => {
                  setIsPob(false);
                  onOpen();
                }}
              >
                {pobaFile.name}
              </p>
              {removeFileMutation.variables === 'poba' &&
              removeFileMutation.isLoading ? (
                <LuLoader className="animate-spin" />
              ) : (
                <RxCross2
                  onClick={() => {
                    removeFileMutation.mutate('poba');
                  }}
                />
              )}
            </div>
          ) : (
            <p className="text-[10px] text-[#AFAFAF]">
              The address on the utlity bill will be used to verify your
              business location
            </p>
          )}
          <div className="flex flex-col space-y-2">
            <label htmlFor="nin" className="font-medium text-sm text-[#344054]">
              Tax Identification Number (Optional)
            </label>
            <input
              type="text"
              className="p-4 rounded-xl bg-[#F3F3F3] focus:border focus:border-primaryColor focus:outline-none text-sm"
              placeholder="Enter Tax Identification Number (TIN)"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-[#AFAFAF]">
            Ensure name on your Tax verification number (TIN) matches your
            business name provided.
          </p>
        </div>
        <div className="flex justify-end">
          <CustomButton
            loading={updateBusinessMutation.isLoading}
            className="w-[200px] h-[50px] text-white font-medium"
          >
            Submit
          </CustomButton>
        </div>
      </form>
      <Modal isOpen={isOpen} size="sm" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Document Image
              </ModalHeader>
              <ModalBody>
                <Image
                  src={isPob ? String(pobPreviewUrl) : String(pobaPreviewUrl)}
                  width={500}
                  height={300}
                  alt="Document image"
                />
              </ModalBody>
              <ModalFooter>
                <CustomButton onClick={() => onClose()}>Close</CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

const Page = () => {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.slug);

  const verificationType = options.find((option) => option.id === id);

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <IoIosArrowBack
          className="text-[#282828] mt-1 cursor-pointer"
          onClick={() => router.back()}
        />{' '}
        <div>
          <h2 className="font-semibold text-[#101928]">
            {verificationType?.title}
          </h2>
          <p className="text-sm text-[#667185]">
            {verificationType?.description}
          </p>
        </div>
      </div>
      {id === 1 ? <PersonalVerificationForm /> : <BusinessVerificationForm />}
    </div>
  );
};

export default Page;
