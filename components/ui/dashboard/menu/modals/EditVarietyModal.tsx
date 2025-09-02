import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Spinner,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Star, X } from 'lucide-react';

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
    <Modal 
      isOpen={isOpen} 
      size="md" 
      onOpenChange={handleClose}
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
                  <div className="p-6 ">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-[#5F35D2]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Edit Variety</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Variety Name
                        </label>
                        <CustomInput
                          type="text"
                          label=""
                          placeholder="e.g., Small, Large, Medium, 500ml"
                          value={varietyName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setVarietyName(e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Price (₦)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold z-10">₦</span>
                          <CustomInput
                          classnames=''
                            type="number"
                            label=""
                            placeholder="0.00"
                            value={varietyPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setVarietyPrice(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-end gap-4 w-full">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="px-8 py-3 border flex-1 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVariety}
                  disabled={loading || !varietyName || !varietyPrice}
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
                      <span>Update Variety</span>
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

export default EditVarietyModal;