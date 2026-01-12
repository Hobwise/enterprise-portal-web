import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { CustomInput } from "@/components/CustomInput";
import { Layers, X, Plus } from "lucide-react";

interface CreateSectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sectionName: string;
  setSectionName: (name: string) => void;
  handleCreateSection: () => void;
  loading: boolean;
}

const CreateSectionModal = ({
  isOpen,
  onOpenChange,
  sectionName,
  setSectionName,
  handleCreateSection,
  loading,
}: CreateSectionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      size="md"
      onOpenChange={(open) => {
        if (!open) {
          setSectionName("");
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
      <ModalContent className="bg-white rounded-2xl shadow-2xl">
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Enhanced Header */}

              {/* Content */}
              <div className="">
                <div className="bg-white p-6 ">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-[#5F35D2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Create New Section
                      </h3>
                      <p className="text-gray-700 text-xs mt-1">
                        Organize your menu with custom sections
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
                        setSectionName(e.target.value)
                      }
                      value={sectionName}
                      label=""
                      placeholder="e.g., Appetizers, Main Courses, Desserts"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Choose a descriptive name that helps organize your menu
                      items
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-end gap-4 w-full">
                <Button
                  color="default"
                  variant="bordered"
                  onPress={() => {
                    setSectionName("");
                    onOpenChange(false);
                  }}
                  className="px-8 py-3 border border-gray-200 text-gray-700 flex-1 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateSection}
                  disabled={loading || !sectionName}
                  className="px-8 py-3 bg-[#5F35D2]  text-white rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>Create Section</span>
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

export default CreateSectionModal;
