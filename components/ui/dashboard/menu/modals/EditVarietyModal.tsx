import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spacer,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface EditVarietyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedVariety: any;
  selectedItem: any;
  onVarietyUpdated: () => void;
}

const EditVarietyModal = ({
  isOpen,
  onOpenChange,
  selectedVariety,
  selectedItem,
  onVarietyUpdated,
}: EditVarietyModalProps) => {
  const [varietyName, setVarietyName] = useState('');
  const [varietyPrice, setVarietyPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedVariety) {
      setVarietyName(selectedVariety.unit || '');
      setVarietyPrice(selectedVariety.price?.toString() || '');
    }
  }, [selectedVariety]);

  const handleUpdateVariety = async () => {
    if (!varietyName || !varietyPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { editMenuVariety } = await import('@/app/api/controllers/dashboard/menu');
      const { getJsonItemFromLocalStorage } = await import('@/lib/utils');
      const business = getJsonItemFromLocalStorage('business');
      
      const payload = {
        id: selectedVariety.id,
        itemID: selectedVariety.itemID || selectedItem?.id,
        menuID: selectedVariety.menuID || selectedItem?.menuID,
        unit: varietyName,
        price: parseFloat(varietyPrice),
        currency: selectedVariety.currency || 'NGN',
      };

      const response = await editMenuVariety(
        business[0]?.businessId, 
        payload, 
        selectedVariety.id
      );

      if (response && 'errors' in response) {
        toast.error('Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Variety updated successfully');
        onOpenChange(false);
        onVarietyUpdated();
      } else {
        toast.error(response?.data?.error || 'Failed to update variety');
      }
    } catch (error) {
      console.error('Error updating variety:', error);
      toast.error('Failed to update variety');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setVarietyName('');
      setVarietyPrice('');
      onOpenChange(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onOpenChange={handleClose}>
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <h2 className="text-xl leading-3 mt-8 text-black font-semibold">
                Edit Variety
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Update the variety details for {selectedItem?.itemName || selectedItem?.name}
              </p>

              <CustomInput
                type="text"
                label="Unit Name"
                placeholder="Enter unit name (e.g., Small, Large, 500ml)"
                value={varietyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVarietyName(e.target.value)
                }
              />

              <Spacer y={4} />

              <CustomInput
                type="number"
                label="Price (₦)"
                placeholder="Enter price"
                value={varietyPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVarietyPrice(e.target.value)
                }
              />

              <Spacer y={2} />
            </ModalBody>

            <ModalFooter>
              <Button
                color="default"
                variant="bordered"
                onPress={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUpdateVariety}
                disabled={loading || !varietyName || !varietyPrice}
                className="bg-[#5F35D2] text-white"
              >
                {loading ? 'Updating...' : 'Update Variety'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditVarietyModal;