'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteModal = ({
  isOpen,
  toggleModal,
  handleDelete,
  isLoading,
  text,
  title = 'Confirm Deletion',
  actionLabel = 'Yes, Delete',
  loadingLabel = 'Deleting...',
}: any) => {
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
              <div className="relative bg-gradient-to-br from-red-50 to-red-100/50 p-4 sm:p-8 rounded-t-2xl border-b border-red-200/30">
                <button
                  onClick={toggleModal}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-11 h-11 sm:w-16 sm:h-16 bg-red-200 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                      <Trash2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
                    {title}
                  </h2>
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="text-center">
                  <p className="text-gray-700 text-sm sm:text-lg leading-relaxed max-w-md mx-auto">
                    {text}
                  </p>
                  
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter className="px-4 sm:px-8 pb-4 sm:pb-8 pt-0">
              <div className="flex justify-center w-full gap-4">
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-4 sm:px-8 py-3 sm:py-6 rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="current" size="sm" />
                      <span>{loadingLabel}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      <span>{actionLabel}</span>
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

export default DeleteModal;
