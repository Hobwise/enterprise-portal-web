'use client';
import { removeCampaign } from '@/app/api/controllers/dashboard/campaigns';
import useCampaign from '@/hooks/cachedEndpoints/useCampaign';
import {
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@nextui-org/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DeleteCampaignModal = ({ isOpenDelete, toggleCampaignModal }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useCampaign();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const campaignObject = getJsonItemFromLocalStorage('campaign');

  const deleteCampaign = async () => {
    setIsLoading(true);
    const data = await removeCampaign(
      businessInformation[0]?.businessId,
      campaignObject?.id
    );
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      refetch();
      toggleCampaignModal();
      toast.success('Campaign deleted successfully');
      clearItemLocalStorage('campaign');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <Modal isOpen={isOpenDelete} onOpenChange={toggleCampaignModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className='flex justify-center'>
                <div className='text-black text-center mt-8 xl:w-[80%] w-full mb-2'>
                  Are you sure you want to delete this campaign?
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className='flex justify-center w-full gap-4 mb-4'>
                <Button
                  onClick={deleteCampaign}
                  disabled={isLoading}
                  color='danger'
                  variant='flat'
                >
                  Delete
                </Button>
                <Button
                  color='default'
                  variant='bordered'
                  onPress={toggleCampaignModal}
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

export default DeleteCampaignModal;
