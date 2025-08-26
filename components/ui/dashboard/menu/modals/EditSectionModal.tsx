
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spacer,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';

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
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                Edit section
              </h2>
              <p className="text-sm text-grey600 mb-4">
                Update the section name
              </p>
              <CustomInput
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingSectionName(e.target.value)
                }
                value={editingSectionName}
                label="Name of section"
                placeholder="Enter section name"
              />
              <Spacer y={2} />
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="bordered"
                onPress={handleCancelEditSection}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUpdateSection}
                disabled={loading || !editingSectionName}
                className="bg-[#5F35D2] text-white"
              >
                {loading ? 'Updating...' : 'Update Section'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditSectionModal;
