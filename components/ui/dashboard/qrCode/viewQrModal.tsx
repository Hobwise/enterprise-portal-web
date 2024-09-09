'use client';
import { CustomButton } from '@/components/customButton';
import { downloadQRImage, getJsonItemFromLocalStorage } from '@/lib/utils';
import { Modal, ModalBody, ModalContent, Spacer } from '@nextui-org/react';
import { useRef } from 'react';
import { MdOutlineFileDownload } from 'react-icons/md';
import QRCode from 'react-qr-code';

interface ViewQrModalProps {
  isOpenView: boolean;
  toggleQRmodalView: () => void;
}

const ViewQrModal: React.FC<ViewQrModalProps> = ({
  isOpenView,
  toggleQRmodalView,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrObject = getJsonItemFromLocalStorage('qr');
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const business = getJsonItemFromLocalStorage('business');

  // const params = {
  //   businessID: business[0]?.businessId,
  //   cooperateID: userInformation?.cooperateID,
  //   id: qrObject?.id,
  // };
  // const encrypted = encrypt(JSON.stringify(params));
  // console.log(encrypted, 'encedyigk');
  // const shortIdentifier = encrypted.content.substring(0, 10);

  return (
    <Modal
      classNames={{
        body: 'px-1 md:px-6',
      }}
      isDismissable={false}
      isOpen={isOpenView}
      onOpenChange={() => {
        toggleQRmodalView();
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
                  value={`https://hobink-corporate-web.vercel.app/create-order?businessID=${business[0]?.businessId}&cooperateID=${userInformation?.cooperateID}&id=${qrObject?.id}&businessName=${business[0]?.businessName}`}
                  viewBox={`0 0 256 256`}
                />
              </div>

              <Spacer y={4} />
              <div className='flex flex-col gap-2'>
                <CustomButton
                  onClick={() => downloadQRImage(qrObject, qrRef)}
                  type='submit'
                >
                  <div className='flex gap-2 items-center justify-center'>
                    <MdOutlineFileDownload className='text-[22px]' />
                    <p>Download QR</p>
                  </div>
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewQrModal;
