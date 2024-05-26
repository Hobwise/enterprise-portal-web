import { CustomButton } from '@/components/customButton';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Modal, ModalBody, ModalContent, Spacer } from '@nextui-org/react';
import download from 'downloadjs';
import { toPng } from 'html-to-image';
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

  const downloadQR = async () => {
    if (qrRef.current === null) {
      return;
    }

    const dataUrl = await toPng(qrRef.current);
    download(dataUrl, `${qrObject?.name}-qr-code.png`);
  };
  return (
    <Modal
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
              <div ref={qrRef} className='flex justify-center'>
                <QRCode
                  size={256}
                  style={{
                    height: 'auto',
                    maxWidth: '50%',
                    width: '100%',
                  }}
                  value={`https://hobink-corporate-web.vercel.app/create-order?businessID=${business[0]?.businessId}&cooperateID=${userInformation?.cooperateID}&id=${qrObject?.id}`}
                  viewBox={`0 0 256 256`}
                />
              </div>

              <Spacer y={4} />
              <div className='flex flex-col gap-2'>
                <CustomButton onClick={downloadQR} type='submit'>
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
