'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import moment from 'moment';
import Image from 'next/image';
import noImage from '../../../../public/assets/images/no-image.svg';

const RepeatCampaignModal = ({
  isOpenRepeat,
  toggleRepeatModal,
  isLoading,
  restartCampaign,
  singleCampaign,
}: any) => {
  return (
    <Modal isOpen={isOpenRepeat} onOpenChange={toggleRepeatModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='text-[20px]  my-4 text-black font-semibold'>
                <span>Repeat campaign</span>
              </div>

              <article className=' '>
                <Image
                  className='h-[144px] w-full bg-cover rounded-lg'
                  width={120}
                  height={144}
                  alt='campaign'
                  aria-label='campaign'
                  src={
                    singleCampaign?.image
                      ? `data:image/jpeg;base64,${singleCampaign?.image}`
                      : noImage
                  }
                />

                <h3 className='mt-5 text-black font-bold text-sm'>
                  {singleCampaign?.campaignName}
                </h3>
                <p className='mt-1 text-[#3D424A] text-sm'>
                  {' '}
                  {singleCampaign?.campaignDescription}
                </p>
                <h3 className='mt-5 text-black font-bold text-sm'>FROM</h3>
                <p className='mt-1 text-[#3D424A] text-sm font-[400]'>
                  {' '}
                  {singleCampaign?.startDateTime
                    ? moment(singleCampaign?.startDateTime).format(
                        'MMMM Do YYYY, h:mm:ss a'
                      )
                    : ''}
                </p>
                <h3 className='mt-5 text-black font-bold text-sm'>To</h3>
                <p className='mt-1 text-[#3D424A] text-sm font-[400]'>
                  {' '}
                  {singleCampaign?.endDateTime
                    ? moment(singleCampaign?.endDateTime).format(
                        'MMMM Do YYYY, h:mm:ss a'
                      )
                    : ''}
                </p>
                <h3 className='mt-5 text-black font-bold text-sm'>
                  DRESS CODE
                </h3>
                <p className='mt-1 text-[#3D424A] text-sm font-[400]'>
                  {' '}
                  {singleCampaign?.dressCode}
                </p>
              </article>
            </ModalBody>
            <ModalFooter>
              <div className='flex gap-2 mb-2'>
                <Button
                  isDisabled={isLoading}
                  onClick={() => restartCampaign(singleCampaign)}
                  color='secondary'
                  className='bg-primaryColor text-white'
                  variant='flat'
                >
                  Repeat
                </Button>
                <Button
                  color='default'
                  variant='bordered'
                  onPress={toggleRepeatModal}
                >
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RepeatCampaignModal;
