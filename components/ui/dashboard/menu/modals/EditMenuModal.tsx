import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import { CustomInput } from "@/components/CustomInput";
import { Edit, Menu, X } from "lucide-react";

interface EditMenuModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editName: string;
  setEditName: (name: string) => void;
  editPackingCost?: number;
  setEditPackingCost: (cost?: number) => void;
  editEstimatedTime?: number;
  setEditEstimatedTime: (time?: number) => void;
  selectedEditSection: string;
  setSelectedEditSection: (section: string) => void;
  categories: any[];
  loading: boolean;
  handleUpdateMenu: () => void;
  closeEditModal: () => void;
}

const EditMenuModal = ({
  isOpen,
  onOpenChange,
  editName,
  setEditName,
  editPackingCost,
  setEditPackingCost,
  editEstimatedTime,
  setEditEstimatedTime,
  selectedEditSection,
  setSelectedEditSection,
  categories,
  loading,
  handleUpdateMenu,
  closeEditModal,
}: EditMenuModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      size="md"
      onOpenChange={(open) => {
        if (!open) {
          closeEditModal();
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
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                        <Edit className="w-6 h-6 text-[#5F35D2]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Edit Menu
                        </h3>
                        <p className="text-gray-700 text-xs ">
                          Update menu section details
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Menu Name
                        </label>
                        <CustomInput
                          type="text"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditName(e.target.value)
                          }
                          value={editName}
                          label=""
                          placeholder="e.g., Drinks, Appetizers, Main Course"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Select Section
                        </label>
                        <div className="relative">
                          <select
                            value={selectedEditSection}
                            onChange={(e) =>
                              setSelectedEditSection(e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                          >
                            <option value="">Choose a section</option>
                            {categories.map((category) => (
                              <option
                                key={category.categoryId}
                                value={category.categoryId}
                              >
                                {category.categoryName}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Packing Cost (Optional)
                        </label>
                        <CustomInput
                          type="number"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = Number(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              setEditPackingCost(value || undefined);
                            }
                          }}
                          value={
                            editPackingCost !== undefined
                              ? String(editPackingCost)
                              : ""
                          }
                          label=""
                          placeholder="Cost required to pack items in this menu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Preparation Time (Optional)
                        </label>
                        <CustomInput
                          type="number"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = Number(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              setEditEstimatedTime(value || undefined);
                            }
                          }}
                          value={
                            editEstimatedTime !== undefined
                              ? String(editEstimatedTime)
                              : ""
                          }
                          label=""
                          placeholder="Estimated preparation time in minutes"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-end gap-4 w-full">
                <button
                  onClick={() => closeEditModal()}
                  className="px-8 py-3 border flex-1 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMenu}
                  disabled={!editName || loading}
                  className="px-8 py-3 bg-[#5F35D2]  text-white rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="current" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      <span>Update Menu</span>
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

export default EditMenuModal;
