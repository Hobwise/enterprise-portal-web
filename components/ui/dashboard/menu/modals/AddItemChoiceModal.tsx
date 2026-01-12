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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" hideCloseButton>
      <ModalContent className="max-w-2xl">
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header with gradient background */}
              <div className="bg-[#5F35D2]  text-white text-center p-8 rounded-t-lg">
                <h2 className="text-3xl font-bold font-satoshi mb-3">
                  Add Menu Items
                </h2>
                <p className="text-[#EAE5FF] font-satoshi opacity-90">
                  Choose your preferred method to add items to your menu
                </p>
              </div>

              {/* Content */}
              <div className="p-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Single Item Option */}
                  <div
                    onClick={onSingleItemChoice}
                    className="group cursor-pointer bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-[#5F35D2] hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center text-center space-y-5">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#EAE5FF] to-[#C3ADFF] rounded-2xl flex items-center justify-center group-hover:from-[#5F35D2] group-hover:to-[#7C69D8] transition-all duration-300 shadow-lg group-hover:shadow-xl">
                          <Plus className="w-10 h-10 text-[#5F35D2] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#5F35D2] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 font-satoshi mb-3 group-hover:text-[#5F35D2] transition-colors duration-300">
                          Add Single Item
                        </h3>
                        <p className="text-sm text-gray-600 font-satoshi leading-relaxed">
                          Add one menu item at a time with detailed information, images, and varieties
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Items Option */}
                  <div
                    onClick={onMultipleItemChoice}
                    className="group cursor-pointer bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-[#5F35D2] hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center text-center space-y-5">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#EAE5FF] to-[#C3ADFF] rounded-2xl flex items-center justify-center group-hover:from-[#5F35D2] group-hover:to-[#7C69D8] transition-all duration-300 shadow-lg group-hover:shadow-xl">
                          <Upload className="w-10 h-10 text-[#5F35D2] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#5F35D2] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Upload className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 font-satoshi mb-3 group-hover:text-[#5F35D2] transition-colors duration-300">
                          Add Multiple Items
                        </h3>
                        <p className="text-sm text-gray-600 font-satoshi leading-relaxed">
                          Upload multiple items at once using an Excel spreadsheet (XLSX format)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-8 py-3 text-gray-600 hover:text-gray-800 font-satoshi font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddItemChoiceModal;