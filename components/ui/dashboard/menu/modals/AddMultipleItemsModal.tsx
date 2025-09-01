import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import SelectMenu from '@/app/dashboard/menu/add-menu-item/add-mulitple-menuItem/selectMenu';
import AddMultipleMenu from '@/app/dashboard/menu/add-menu-item/add-mulitple-menuItem/addMultipleMenu';

interface AddMultipleItemsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

const AddMultipleItemsModal = ({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddMultipleItemsModalProps) => {
  const [activeScreen, setActiveScreen] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState('');

  const handleClose = () => {
    setActiveScreen(1);
    setSelectedMenu('');
    onOpenChange(false);
  };

  const handleBackToStep1 = () => {
    setActiveScreen(1);
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  const toggleMultipleMenu = () => {
    // Handle toggle functionality if needed
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="md"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {activeScreen === 2 && (
                    <button
                      onClick={handleBackToStep1}
                      className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2] mr-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 font-satoshi">
                      {activeScreen === 1 ? 'Select Menu' : 'Bulk Upload Items'}
                    </h2>
                    <p className="text-sm text-gray-600 font-satoshi">
                      Step {activeScreen} of 2
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeScreen === 1 && (
                  <div className="max-w-2xl mx-auto">
                    <SelectMenu
                      setActiveScreen={setActiveScreen}
                      setSelectedMenu={setSelectedMenu}
                      selectedMenu={selectedMenu}
                      toggleMultipleMenu={toggleMultipleMenu}
                    />
                  </div>
                )}
                
                {activeScreen === 2 && (
                  <div className="max-w-4xl mx-auto">
                    <AddMultipleMenu 
                      selectedMenu={selectedMenu}
                      onSuccess={handleSuccess}
                      onClose={handleClose}
                    />
                  </div>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddMultipleItemsModal;