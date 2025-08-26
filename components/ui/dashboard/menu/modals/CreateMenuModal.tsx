
import {
  Modal,
  ModalContent,
  ModalBody,
  Spacer,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <h2 className="text-xl leading-3 mt-8 text-black font-semibold font-satoshi">
                Create Menu
              </h2>
              <p className="text-sm text-grey600 xl:w-[231px] w-full mb-4 font-satoshi">
                Create a menu to add item
              </p>
              <CustomInput
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                value={name}
                label="Name of menu"
                placeholder="E.g Drinks"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-satoshi">
                  Select section
                </label>
                <select
                  value={selectedCreateSection}
                  onChange={(e) => setSelectedCreateSection(e.target.value)}
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
                    setPackingCost(value || undefined);
                  }
                }}
                value={packingCost !== undefined ? String(packingCost) : ''}
                label="Packing cost (Optional)"
                placeholder="This is a cost required to pack any item in this menus"
                min="0"
              />
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
                label="Preparation time in minutes (Optional)"
                placeholder="This is the estimated time required to prepare any item in this menus"
                min="0"
              />
              <Spacer y={2} />

              <CustomButton
                loading={loading}
                onClick={handleCreateMenu}
                disabled={!name || loading}
                type="submit"
              >
                {loading ? 'Loading' : 'Proceed'}
              </CustomButton>

              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateMenuModal;
