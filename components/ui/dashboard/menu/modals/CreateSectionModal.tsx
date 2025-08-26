
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spacer,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';

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
          setSectionName('');
        }
        onOpenChange(open);
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <h2 className="text-xl leading-3 mt-8 text-black font-semibold font-satoshi">
                Create new section
              </h2>
              <p className="text-sm text-grey600 mb-4 font-satoshi">
                Create sections to manage your order
              </p>
              <CustomInput
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSectionName(e.target.value)
                }
                value={sectionName}
                label="Name of section"
                placeholder="Enter section name"
              />
              <Spacer y={2} />
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="bordered"
                onPress={() => {
                  setSectionName('');
                  onOpenChange(false);
                }}
                className="font-satoshi text-base"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleCreateSection}
                disabled={loading || !sectionName}
                className="bg-[#5F35D2] text-white font-satoshi text-base"
              >
                {loading ? 'Creating...' : 'Create Section'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateSectionModal;
