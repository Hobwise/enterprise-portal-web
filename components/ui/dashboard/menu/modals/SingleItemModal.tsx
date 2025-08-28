
import { Modal, ModalContent, ModalBody, Switch } from '@nextui-org/react';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditItemModal from './EditItemModal';
import toast from 'react-hot-toast';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import type { payloadMenuItem } from '@/app/api/controllers/dashboard/menu';

interface SingleItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItem: any;
  openCreateVarietyModal: (item: any) => void;
  onDeleteItem?: (itemId: string) => Promise<void>;
  categories?: any[];
  menuSections?: any[];
  onItemUpdated?: () => void;
  onEditVariety?: (variety: any) => void;
  onDeleteVariety?: (varietyId: string) => Promise<void>;
  handleVarietyClick?: (variety: any) => void;
}

const SingleItemModal = ({
  isOpen,
  onOpenChange,
  selectedItem,
  openCreateVarietyModal,
  onDeleteItem,
  categories = [],
  menuSections = [],
  onItemUpdated,
  onEditVariety,
  onDeleteVariety,
  handleVarietyClick,
}: SingleItemModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(selectedItem?.isAvailable ?? true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  if (!selectedItem) return null;

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsUpdatingAvailability(true);
    try {
      // Import and call the update API
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

  const handleDelete = async () => {
    if (!onDeleteItem) return;
    
    setIsDeleting(true);
    try {
      await onDeleteItem(selectedItem.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to menu</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => openCreateVarietyModal(selectedItem)}
                    className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create variety</span>
                  </button>
                  {onDeleteItem && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
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
                <div className="flex text-gray-700 gap-6">
                  <img
                    src={
                      selectedItem.image && selectedItem.image.trim() !== ''
                        ? selectedItem.image.startsWith('data:') || selectedItem.image.startsWith('http')
                          ? selectedItem.image
                          : `data:image/jpeg;base64,${selectedItem.image}`
                        : '/assets/images/no-image.svg'
                    }
                    alt={selectedItem.itemName}
                    className="w-64 h-64 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-2">
                      {selectedItem.itemName}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedItem.itemDescription}
                    </p>
                    <p className="text-2xl font-bold mb-4">
                      ₦
                      {selectedItem.price.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium"></span>{' '}
                        {selectedItem.menuName}
                      </p>
                 
                
                        <p className="text-gray-600">
                          <span className="font-medium">Packing Cost:</span> ₦
                          {selectedItem.packingCost.toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                 
                     
                        <p className="text-gray-600">
                          <span className="font-medium">
                            Preparation Time:
                          </span>{' '}
                          {selectedItem.menu?.waitingTimeMinutes || 0} minutes
                        </p>

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
                </div>

                {/* Varieties */}
                {selectedItem.varieties && selectedItem.varieties.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Varieties</h3>
                    <div className="space-y-4">
                      {
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
                              onClick={() => handleVarietyClick && handleVarietyClick(variety)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                              }}
                            />
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleVarietyClick && handleVarietyClick(variety)}
                            >
                              <h3 className="font-semibold text-gray-700">{variety.unit || variety.name}</h3>
                              <p className="text-sm text-gray-700 mt-1">
                                {variety.description}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {selectedItem.menuName}
                              </p>
                              <p className="font-bold mt-2 text-gray-700">
                                ₦
                                {variety.price?.toLocaleString('en-NG', {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
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
                                    if (window.confirm(`Are you sure you want to delete "${variety.unit || variety.name}"?`)) {
                                      await onDeleteVariety(variety.id);
                                    }
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
                      }
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal isOpen={showDeleteConfirm} size="sm" onOpenChange={setShowDeleteConfirm}>
          <ModalContent>
            <ModalBody className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Delete Menu Item</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedItem.itemName}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          selectedItem={selectedItem}
          categories={categories}
          menuSections={menuSections}
          onItemUpdated={() => {
            if (onItemUpdated) {
              onItemUpdated();
            }
          }}
        />
      )}
    </Modal>
  );
};

export default SingleItemModal;
