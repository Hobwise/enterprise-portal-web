
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
  Switch,
} from '@nextui-org/react';
import { ArrowLeft, Edit, Plus, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import type { payloadMenuItem } from '@/app/api/controllers/dashboard/menu';
import { useState, useEffect } from 'react';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItem: any;
  openCreateVarietyModal: (item: any) => void;
  varietiesLoading: boolean;
  handleVarietyClick: (variety: any) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (item: any) => void;
  onEditVariety?: (variety: any) => void;
  onDeleteVariety?: (varietyId: string) => Promise<void>;
  onItemUpdated?: () => void;
}

const ItemDetailsModal = ({
  isOpen,
  onOpenChange,
  selectedItem,
  openCreateVarietyModal,
  varietiesLoading,
  handleVarietyClick,
  onEditItem,
  onDeleteItem,
  onEditVariety,
  onDeleteVariety,
  onItemUpdated,
}: ItemDetailsModalProps) => {
  const [isAvailable, setIsAvailable] = useState(selectedItem?.isAvailable ?? true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setIsAvailable(selectedItem.isAvailable ?? true);
    }
  }, [selectedItem]);

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsUpdatingAvailability(true);
    try {
      const { editMenuItem } = await import('@/app/api/controllers/dashboard/menu');
      const business = getJsonItemFromLocalStorage('business');
      
      const payload: payloadMenuItem = {
        menuID: selectedItem.menuID,
        itemName: selectedItem.itemName,
        itemDescription: selectedItem.itemDescription || '',
        price: selectedItem.price,
        currency: 'NGN',
        isAvailable: value,
        hasVariety: selectedItem.varieties?.length > 0 || false,
        imageReference: selectedItem.imageReference || '',
      };

      const response = await editMenuItem(business[0]?.businessId, payload, selectedItem.id);

      if (response && 'errors' in response) {
        toast.error('Failed to update availability');
        return;
      }

      if (response?.data?.isSuccessful) {
        setIsAvailable(value);
        toast.success(`Item ${value ? 'enabled' : 'disabled'} successfully`);
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        toast.error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  if (!selectedItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      size="5xl"
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to menu</span>
                </button>

                <div className="flex items-center gap-2">
                  {onEditItem && (
                    <button 
                      onClick={() => onEditItem(selectedItem)}
                      className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => openCreateVarietyModal(selectedItem)}
                    className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-gray-700">Create variety</span>
                  </button>
                  {onDeleteItem && (
                    <button 
                      onClick={() => onDeleteItem(selectedItem)}
                      className="text-red-600 px-6 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Main Item */}
                  <div>
                    <img
                      src={
                        selectedItem.image && selectedItem.image.trim() !== ''
                          ? selectedItem.image.startsWith('data:') || selectedItem.image.startsWith('http')
                            ? selectedItem.image
                            : `data:image/jpeg;base64,${selectedItem.image}`
                          : '/assets/images/no-image.svg'
                      }
                      alt={selectedItem.name}
                      className="w-full aspect-square rounded-lg object-cover bg-orange-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                      }}
                    />
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-700">
                          {selectedItem.name}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedItem.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedItem.category}
                      </p>
                      <p className="text-2xl font-bold mt-4 text-gray-700">
                        ₦
                        {selectedItem.price.toLocaleString('en-NG', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      
                      {/* Availability Toggle */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                        <span className="text-gray-600 font-medium">
                          Availability:
                        </span>
                        <Switch
                          isSelected={isAvailable}
                          onValueChange={handleAvailabilityToggle}
                          isDisabled={isUpdatingAvailability}
                          classNames={{
                            wrapper: "group-data-[selected=true]:bg-[#5F35D2]",
                          }}
                        />
                        <span className={`text-sm ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                          {isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Varieties */}
                  <div className="col-span-2">
                    <div className="space-y-4">
                      {varietiesLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner size="lg" />
                          <p className="ml-4 text-gray-700">
                            Loading varieties...
                          </p>
                        </div>
                      ) : (
                        selectedItem.varieties?.map((variety: any) => (
                          <div
                            key={variety.id}
                            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors relative group"
                          >
                            <img
                              src={
                                variety.image && variety.image.trim() !== ''
                                  ? variety.image.startsWith('data:') || variety.image.startsWith('http')
                                    ? variety.image
                                    : `data:image/jpeg;base64,${variety.image}`
                                  : '/assets/images/no-image.svg'
                              }
                              alt={variety.name}
                              className="w-20 h-20 rounded-lg object-cover bg-cyan-500 cursor-pointer"
                              onClick={() => handleVarietyClick(variety)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                              }}
                            />
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleVarietyClick(variety)}
                            >
                              <h3 className="font-semibold text-gray-700">{variety.unit || variety.name}</h3>
                              <p className="text-sm text-gray-700 mt-1">
                                {variety.description}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {selectedItem.category}
                              </p>
                              <p className="font-bold mt-2 text-gray-700">
                                ₦
                                {variety.price?.toLocaleString('en-NG', {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {onEditVariety && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditVariety({ ...variety, item: selectedItem });
                                  }}
                                  className="p-2 text-[#5F35D2] hover:bg-[#EAE5FF] rounded-lg transition-colors"
                                  title="Edit variety"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {onDeleteVariety && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await onDeleteVariety(variety.id);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete variety"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ItemDetailsModal;
