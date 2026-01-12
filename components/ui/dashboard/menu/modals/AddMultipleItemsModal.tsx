import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import SelectMenu from '@/app/dashboard/menu/add-menu-item/add-mulitple-menuItem/selectMenu';
import AddMultipleMenu from '@/app/dashboard/menu/add-menu-item/add-mulitple-menuItem/addMultipleMenu';

interface AddMultipleItemsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
  activeSubCategory?: string;
  activeCategory?: string;
  menuSections?: any[];
}

const AddMultipleItemsModal = ({
  isOpen,
  onOpenChange,
  onSuccess,
  activeSubCategory,
  activeCategory,
  menuSections = [],
}: AddMultipleItemsModalProps) => {
  const [activeScreen, setActiveScreen] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState('');

  // Update selectedMenu when activeSubCategory changes or modal opens
  useEffect(() => {
    if (isOpen && activeSubCategory) {
      setSelectedMenu(activeSubCategory);
    }
  }, [isOpen, activeSubCategory]);

  const handleClose = () => {
    setActiveScreen(1);
    setSelectedMenu(activeSubCategory || ''); // Reset to active section instead of empty
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
      size="xl"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh] roundded-lg",
        wrapper: "items-center justify-center",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className="bg-[#5F35D2] text-white rounded-t-lg sticky top-0 z-10">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    {activeScreen === 2 && (
                      <button
                        onClick={handleBackToStep1}
                        className="flex items-center gap-2 text-white hover:text-[#EAE5FF] transition-colors duration-200 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                      </button>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold font-satoshi mb-1">
                        {activeScreen === 1 ? 'Select Menu' : 'Bulk Upload Items'}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activeScreen === 1 ? 'bg-white' : 'bg-white/50'}`}></div>
                          <span className="text-sm font-medium text-[#EAE5FF]">Step {activeScreen} of 2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-[#EAE5FF] transition-colors duration-200 bg-white/10 hover:bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 rounded-b-lg min-h-[500px]">
                <div className="p-8">
                  {activeScreen === 1 && (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SelectMenu
                          setActiveScreen={setActiveScreen}
                          setSelectedMenu={setSelectedMenu}
                          selectedMenu={selectedMenu}
                          toggleMultipleMenu={toggleMultipleMenu}
                          activeSubCategory={activeSubCategory}
                          activeCategory={activeCategory}
                          menuSections={menuSections}
                        />
                      </div>
                    </div>
                  )}
                  
                  {activeScreen === 2 && (
                    <div className="max-w-4xl mx-auto">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <AddMultipleMenu 
                          selectedMenu={selectedMenu}
                          onSuccess={handleSuccess}
                          onClose={handleClose}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddMultipleItemsModal;