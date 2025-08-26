
import {
  Modal,
  ModalContent,
  ModalBody,
  Spacer,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';

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
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <h2 className="text-xl leading-3 mt-8 text-black font-semibold font-satoshi">
                Edit Menu
              </h2>
              <p className="text-sm text-grey600 xl:w-[231px] w-full mb-4 font-satoshi">
                Update menu details
              </p>
              <CustomInput
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditName(e.target.value)
                }
                value={editName}
                label="Name of menu"
                placeholder="E.g Drinks"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-satoshi">
                  Select section
                </label>
                <select
                  value={selectedEditSection}
                  onChange={(e) => setSelectedEditSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2] font-satoshi text-base"
                >
                  <option value="">Select a section</option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <CustomInput
                type="number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  if (value >= 0 || e.target.value === '') {
                    setEditPackingCost(value || undefined);
                  }
                }}
                value={
                  editPackingCost !== undefined
                    ? String(editPackingCost)
                    : ''
                }
                label="Packing cost (Optional)"
                placeholder="This is a cost required to pack any item in this menus"
              />
              <CustomInput
                type="number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  if (value >= 0 || e.target.value === '') {
                    setEditEstimatedTime(value || undefined);
                  }
                }}
                value={
                  editEstimatedTime !== undefined
                    ? String(editEstimatedTime)
                    : ''
                }
                label="Preparation time in minutes (Optional)"
                placeholder="This is the estimated time required to prepare any item in this menus"
                min="0"
              />
              <Spacer y={2} />

              <div className="flex gap-2">
                <CustomButton
                  onClick={() => closeEditModal()}
                  className="flex-1 text-gray-700"
                  backgroundColor="bg-gray-200"
                >
                  Cancel
                </CustomButton>

                <CustomButton
                  loading={loading}
                  onClick={handleUpdateMenu}
                  disabled={!editName || loading}
                  type="submit"
                  className="flex-1 text-white"
                >
                  {loading ? 'Loading' : 'Update Menu'}
                </CustomButton>
              </div>

              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditMenuModal;
