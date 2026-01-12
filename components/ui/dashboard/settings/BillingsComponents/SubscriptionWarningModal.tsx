'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@nextui-org/react';
import { IoWarningOutline } from 'react-icons/io5';

interface SubscriptionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  newPlan: string;
  isLoading?: boolean;
}

const SubscriptionWarningModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  isLoading = false,
}: SubscriptionWarningModalProps) => {
  return (
    <Modal 
      isDismissable={false} 
      isOpen={isOpen} 
      onOpenChange={onClose}
      size="md"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <IoWarningOutline className="text-primaryColor text-4xl" />
                <span>Subscription Change Warning</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-base text-gray-700">
                  You are about to change your subscription plan.
                </p>
                <div className="bg-[#EAE5FF] border border-primaryColor rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Current Plan: <span className="font-bold">{currentPlan}</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    New Plan: <span className="font-bold">{newPlan}</span>
                  </p>
                  <p className="text-sm text-primaryColor">
                    <strong>Important:</strong> Your previous {currentPlan} plan will be terminated 
                    immediately upon successful payment. Any unused time on your current plan will 
                    not be refunded.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Are you sure you want to proceed with this change?
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="bordered"
                onPress={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onPress={onConfirm}
                disabled={isLoading}
                className="bg-primaryColor text-white"
              >
                {isLoading ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  'Continue to Payment'
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionWarningModal;