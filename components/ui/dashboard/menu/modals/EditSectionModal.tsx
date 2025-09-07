import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { Edit, Layers, X } from 'lucide-react';

interface EditSectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editingSectionName: string;
  setEditingSectionName: (name: string) => void;
  handleUpdateSection: () => void;
  loading: boolean;
  handleCancelEditSection: () => void;
}

const EditSectionModal = ({
  isOpen,
  onOpenChange,
  editingSectionName,
  setEditingSectionName,
  handleUpdateSection,
  loading,
  handleCancelEditSection,
}: EditSectionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      size="md"
      onOpenChange={(open) => {
        if (!open) {
          handleCancelEditSection();
        }
        onOpenChange(open);
      }}
      hideCloseButton
      classNames={{
        wrapper: "items-center justify-center",
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "border border-gray-200",
      }}
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
              

                {/* Content */}
                <div className="">
                  <div className="bg-white p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-[#5F35D2]" />
                      </div>
                      <div>
                              <h3 className="text-lg font-semibold text-gray-800">Edit Section</h3>
                      <p className="text-gray-700 text-xs">
                        Update section information
                      </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Section Name
                      </label>
                      <CustomInput
                        type="text"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditingSectionName(e.target.value)
                        }
                        value={editingSectionName}
                        label=""
                        placeholder="e.g., Appetizers, Main Courses, Desserts"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Choose a descriptive name that helps organize your menu items
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-end gap-4 w-full">
                <button
                  onClick={handleCancelEditSection}
                  className="px-8 py-3 border flex-1 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSection}
                  disabled={loading || !editingSectionName}
                  className="px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="current" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      <span>Update Section</span>
                    </div>
                  )}
                </button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditSectionModal;
