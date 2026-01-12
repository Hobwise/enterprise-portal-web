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
              <div className="relative bg-gradient-to-br from-red-50 to-red-100/50 p-8 rounded-t-2xl border-b border-red-200/30">
                <button
                  onClick={toggleModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                      <Trash2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Confirm Deletion
                  </h2>
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
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
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-8 py-6 rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="current" size="sm" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      <span>Yes, Delete</span>
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
