'use client';

import { updateQr } from '@/app/api/controllers/dashboard/quickResponse';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import useQR from '@/hooks/cachedEndpoints/useQRcode';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface Table {
  name: string;
  cooperateID: string;
  businessID: string;
  id: string;
}

interface EditQrModalProps {
  isOpenEdit: boolean;
  toggleQRmodalEdit: () => void;
}

const EditQrModal: React.FC<EditQrModalProps> = ({
  isOpenEdit,
  toggleQRmodalEdit,
}) => {
  const qrObject = getJsonItemFromLocalStorage('qr') as Table;
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [name, setName] = useState<string>(qrObject?.name || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qrURL, setQrURL] = useState<Table | null>(null);
  const { refetch } = useQR();

  const editQR = async () => {
    setIsLoading(true);
    const data = await updateQr(
      businessInformation[0]?.businessId,
      qrObject?.id,
      { name }
    );
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      refetch();
      setQrURL(data.data.data);
      notify({
        title: 'Success!',
        text: 'QR updated successfully',
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

  useEffect(() => {
    if (isOpenEdit) {
      setName(qrObject?.name || '');
      setQrURL(null);
    }
  }, [isOpenEdit, qrObject?.name, qrObject?.id]);

  return (
    <Modal
      isOpen={isOpenEdit}
      onOpenChange={(isOpen) => {
        toggleQRmodalEdit();
        if (!isOpen) {
          setName(qrObject?.name || '');
          setQrURL(null);
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <p className='font-[600] text-[16px] text-black'>Edit QR code</p>
            </ModalHeader>

            <ModalBody>
              <div>
                <Spacer y={3} />
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
                {qrURL && (
                  <>
                    <div className='flex justify-center'>
                      <QRCode
                        size={256}
                        style={{
                          height: 'auto',
                          maxWidth: '50%',
                          width: '100%',
                        }}
                        value={`https://hobink-corporate-web.vercel.app/dashboard/orders/create-orders?businessID=${qrURL.businessID}&cooperateID=${qrURL.cooperateID}&id=${qrURL.id}`}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                    <Spacer y={8} />
                  </>
                )}
                <CustomButton
                  loading={isLoading}
                  onClick={editQR}
                  className='max-w-[154px] h-[47px] float-right w-full mb-4 text-white font-semibold'
                  disabled={!name || name.length < 2 || isLoading}
                  type='submit'
                >
                  {isLoading ? 'Loading' : 'Save QR'}
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditQrModal;
