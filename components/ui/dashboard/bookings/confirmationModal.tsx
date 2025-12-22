'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  handleConfirm: () => void;
  isLoading?: boolean;
  text: string;
  title: string;
  isCancellation?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  toggleModal,
  handleConfirm,
  isLoading,
  text,
  title,
  isCancellation = false,
}: ConfirmationModalProps) => {
  const colorScheme = isCancellation
    ? {
        gradient: 'from-red-50 to-red-100/50',
        border: 'border-red-200/30',
        iconBg: 'bg-red-100',
        iconInnerBg: 'bg-red-200',
        iconColor: 'text-red-600',
        accentBg: 'bg-red-600',
        divider: 'from-red-400 to-red-600',
        buttonGradient: 'from-red-500 to-red-600',
        buttonHover: 'hover:from-red-600 hover:to-red-700',
      }
    : {
        gradient: 'from-green-50 to-green-100/50',
        border: 'border-green-200/30',
        iconBg: 'bg-green-100',
        iconInnerBg: 'bg-green-200',
        iconColor: 'text-green-600',
        accentBg: 'bg-green-600',
        divider: 'from-green-400 to-green-600',
        buttonGradient: 'from-green-500 to-green-600',
        buttonHover: 'hover:from-green-600 hover:to-green-700',
      };

  return (
    <Modal
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={toggleModal}
      size="lg"
      hideCloseButton
      classNames={{
        wrapper: "items-center justify-center",
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "border border-gray-200",
      }}
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl">
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className={`relative bg-gradient-to-br ${colorScheme.gradient} p-8 rounded-t-2xl border-b ${colorScheme.border}`}>
                <button
                  onClick={toggleModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 ${colorScheme.iconBg} rounded-full flex items-center justify-center`}>
                      <div className={`w-16 h-16 ${colorScheme.iconInnerBg} rounded-full flex items-center justify-center`}>
                        {isCancellation ? (
                          <AlertTriangle className={`w-10 h-10 ${colorScheme.iconColor}`} />
                        ) : (
                          <CheckCircle className={`w-10 h-10 ${colorScheme.iconColor}`} />
                        )}
                      </div>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${colorScheme.accentBg} rounded-full flex items-center justify-center animate-pulse`}>
                      {isCancellation ? (
                        <X className="w-4 h-4 text-white" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {title}
                  </h2>

                  <div className={`w-16 h-1 bg-gradient-to-r ${colorScheme.divider} rounded-full`}></div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <div className="text-center">
                  <p className="text-gray-700 text-lg leading-relaxed max-w-md mx-auto">
                    {text}
                  </p>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-center w-full gap-4">
                <Button
                  onClick={toggleModal}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 font-semibold px-8 py-6 rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`bg-gradient-to-r ${colorScheme.buttonGradient} text-white font-semibold px-8 py-6 rounded-xl ${colorScheme.buttonHover} transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="current" size="sm" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isCancellation ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      <span>Yes, {isCancellation ? 'Cancel' : 'Confirm'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
