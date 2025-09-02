
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { Plus, Menu, X } from 'lucide-react';

interface CreateMenuModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  name: string;
  setName: (name: string) => void;
  packingCost?: number;
  setPackingCost: (cost?: number) => void;
  estimatedTime?: number;
  setEstimatedTime: (time?: number) => void;
  selectedCreateSection: string;
  setSelectedCreateSection: (section: string) => void;
  categories: any[];
  loading: boolean;
  handleCreateMenu: () => void;
}

const CreateMenuModal = ({
  isOpen,
  onOpenChange,
  name,
  setName,
  packingCost,
  setPackingCost,
  estimatedTime,
  setEstimatedTime,
  selectedCreateSection,
  setSelectedCreateSection,
  categories,
  loading,
  handleCreateMenu,
}: CreateMenuModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      size="md"
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
                {/* Enhanced Header */}
                

                {/* Content */}
                <div className="p-1">
                  <div className="bg-white p-6 rounded-xl ">
                    <div className="flex items-center gap-2 mb-6">
                      
                      <div>
                     <h3 className="text-lg font-semibold text-gray-800">Create Menu</h3>

                        <p className="text-gray-700 text-xs ">
                        Create a new menu section for your items
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
                            setName(e.target.value)
                          }
                          value={name}
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
                            value={selectedCreateSection}
                            onChange={(e) => setSelectedCreateSection(e.target.value)}
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
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Number(e.target.value);
                            if (value >= 0 || e.target.value === '') {
                              setPackingCost(value || undefined);
                            }
                          }}
                          value={packingCost !== undefined ? String(packingCost) : ''}
                          label=""
                          placeholder="Cost required to pack items in this menu"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Preparation Time (Optional)
                        </label>
                        <CustomInput
                          type="number"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Number(e.target.value);
                            if (value >= 0 || e.target.value === '') {
                              setEstimatedTime(value || undefined);
                            }
                          }}
                          value={
                            estimatedTime !== undefined ? String(estimatedTime) : ''
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
                  onClick={onOpenChange}
                  className="px-8 py-3 border flex-1 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMenu}
                  disabled={!name || loading}
                  className="px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:from-[#5F35D2]/90 hover:to-[#7C69D8]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="current" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>Create Menu</span>
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

export default CreateMenuModal;
