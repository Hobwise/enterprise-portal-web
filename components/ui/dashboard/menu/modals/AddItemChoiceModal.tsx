import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { Plus, Upload } from 'lucide-react';

interface AddItemChoiceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSingleItemChoice: () => void;
  onMultipleItemChoice: () => void;
}

const AddItemChoiceModal = ({
  isOpen,
  onOpenChange,
  onSingleItemChoice,
  onMultipleItemChoice,
}: AddItemChoiceModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 font-satoshi mb-2">
                  How would you like to add menu items?
                </h2>
                <p className="text-gray-600 font-satoshi">
                  Choose your preferred method to add items to your menu
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single Item Option */}
                <div
                  onClick={onSingleItemChoice}
                  className="group cursor-pointer bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#5F35D2] hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[#EAE5FF] rounded-full flex items-center justify-center group-hover:bg-[#5F35D2] transition-colors duration-300">
                      <Plus className="w-8 h-8 text-[#5F35D2] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 font-satoshi mb-2">
                        Add Single Item
                      </h3>
                      <p className="text-sm text-gray-600 font-satoshi">
                        Add one menu item at a time with detailed information, images, and varieties
                      </p>
                    </div>
                  </div>
                </div>

                {/* Multiple Items Option */}
                <div
                  onClick={onMultipleItemChoice}
                  className="group cursor-pointer bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#5F35D2] hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[#EAE5FF] rounded-full flex items-center justify-center group-hover:bg-[#5F35D2] transition-colors duration-300">
                      <Upload className="w-8 h-8 text-[#5F35D2] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 font-satoshi mb-2">
                        Add Multiple Items
                      </h3>
                      <p className="text-sm text-gray-600 font-satoshi">
                        Upload multiple items at once using an Excel spreadsheet (XLSX format)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-satoshi transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddItemChoiceModal;