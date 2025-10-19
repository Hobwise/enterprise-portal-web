'use client';
import { createQr } from '@/app/api/controllers/dashboard/quickResponse';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import useQR from '@/hooks/cachedEndpoints/useQRcode';
import { companyInfo } from '@/lib/companyInfo';
import {
  downloadQRImage,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  useDisclosure,
} from '@nextui-org/react';
import { useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdOutlineFileDownload } from 'react-icons/md';
import QRCode from 'react-qr-code';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface Table {
  name: string;
  cooperateID: string;
  businessID: string;
  id: string;
}

const QRform = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { refetch } = useQR();
  const queryClient = useQueryClient();
  const router = useRouter();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [qrURL, setQrURL] = useState<Table | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  const addQR = async () => {
    setIsLoading(true);
    const data = await createQr(businessInformation[0]?.businessId, { name });
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      // Invalidate QR queries to force immediate refresh
      await queryClient.invalidateQueries({
        queryKey: ['qr'],
        refetchType: 'active'
      });

      // Set the QR data for display in success modal
      setQrURL(data.data.data);

      // Open the success modal to show QR code
      onOpen();

      // Trigger refetch to update the list
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <article>
      <Spacer y={16} />
      <CustomInput
        type='text'
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value);
        }}
        value={name}
        label='Name of QR'
        placeholder='E.g Table 1'
      />
      <label className='text-[#667185] text-sm font-[400]'>
        This will help you identify where the orders are coming from.
      </label>
      <Spacer y={8} />

      <CustomButton
        loading={isLoading}
        onClick={addQR}
        className='max-w-[154px] h-[47px] float-right w-full text-white font-semibold'
        disabled={!name || name.length < 2 || isLoading}
        type='submit'
      >
        {isLoading ? 'Loading' : 'Save QR'}
      </CustomButton>

      <Modal
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Modal is closing - navigate back to QR list
            setName('');
            setQrURL(null);
            router.push('/dashboard/quick-response');
          }
          onOpenChange();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className='p-6'>
                <Spacer y={3} />

                <div ref={qrRef} className='flex justify-center p-4 bg-white'>
                  <QRCode
                    size={256}
                    style={{
                      height: 256,
                      width: 256,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    value={`${companyInfo.webUrl}/create-order?businessID=${qrURL?.businessID}&cooperateID=${qrURL?.cooperateID}&id=${qrURL?.id}&businessName=${businessInformation[0]?.businessName}`}
                    viewBox={`0 0 256 256`}
                  />
                </div>

                <div>
                  <p className='text-center text-bold text-[18px] font-[600] text-black p-0'>
                    Fantastic!
                  </p>
                  <p className='text-center text-grey400 text-sm font-[400]'>
                    You have created a new Quick Response
                  </p>
                </div>
                <Spacer y={0} />
                <div className='flex flex-col gap-2'>
                  <CustomButton
                    onClick={() => downloadQRImage(qrURL, qrRef)}
                    type='submit'
                  >
                    <div className='flex gap-2 items-center justify-center'>
                      <MdOutlineFileDownload className='text-[22px]' />
                      <p>Download QR</p>
                    </div>
                  </CustomButton>
                  <CustomButton
                    onClick={() => {
                      setName('');
                      setQrURL(null);
                      onOpenChange();
                    }}
                    className='bg-transparent border-none w-full text-primaryColor'
                    type='submit'
                  >
                    <div className='flex gap-2 items-center justify-center'>
                      <FaPlus className='text-[20px]' />
                      <p className='font-[700] text-[16px]'>
                        Create another QR
                      </p>
                    </div>
                  </CustomButton>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </article>
  );
};

export default QRform;
