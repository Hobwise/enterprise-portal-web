
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
  Switch,
} from '@nextui-org/react';
import { ArrowLeft, Edit, Plus, Star, Trash2 } from 'lucide-react';
import DeleteModal from '@/components/ui/deleteModal';
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
  onEditItem,
  onDeleteItem,
  onEditVariety,
  onDeleteVariety,
  onItemUpdated,
}: ItemDetailsModalProps) => {
  const [isAvailable, setIsAvailable] = useState(selectedItem?.isAvailable ?? true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteVarietyId, setDeleteVarietyId] = useState<string | null>(null);
  const [isDeleteVarietyModalOpen, setIsDeleteVarietyModalOpen] = useState(false);

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
                      onClick={() => setIsDeleteModalOpen(true)}
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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Main Item */}
                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Image */}
                      <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-xl shadow-lg">
                          <img
                            src={
                              selectedItem.image && selectedItem.image.trim() !== ''
                                ? selectedItem.image.startsWith('data:') || selectedItem.image.startsWith('http')
                                  ? selectedItem.image
                                  : `data:image/jpeg;base64,${selectedItem.image}`
                                : '/assets/images/no-image.svg'
                            }
                            alt={selectedItem.name}
                            className="w-full h-[20rem] object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Item Details */}
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {selectedItem.name}
                          </h2>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#5F35D2]/10 text-[#5F35D2] mb-3">
                            {selectedItem.category}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed">
                          {selectedItem.description}
                        </p>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-3xl font-bold text-[#5F35D2]">
                            ₦{selectedItem.price.toLocaleString('en-NG', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      
                      {/* Availability Toggle */}
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
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
                        <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                          {isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Close the main item details div */}
                </div>
                {/* Varieties */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 h-full border border-gray-200/50 shadow-sm">
                    {/* Header with icon and count */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#5F35D2] to-[#7C69D8] rounded-lg flex items-center justify-center shadow-lg">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Varieties</h3>
                          {selectedItem.varieties && selectedItem.varieties.length > 0 && (
                            <p className="text-sm text-gray-500">
                              {selectedItem.varieties.length} option{selectedItem.varieties.length !== 1 ? 's' : ''} available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {varietiesLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="relative">
                            <Spinner size="lg" color="secondary" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#5F35D2] to-[#7C69D8] rounded-full opacity-20 animate-pulse"></div>
                          </div>
                          <p className="mt-6 text-gray-600 font-medium">
                            Loading varieties...
                          </p>
                        </div>
                      ) : selectedItem.varieties && selectedItem.varieties.length > 0 ? (
                        selectedItem.varieties.map((variety: any, index: number) => (
                          <div
                            key={variety.id}
                            className="bg-white p-5 rounded-xl border border-gray-100  hover:border-[#5F35D2]/30 transition-all duration-300 group transform hover:-translate-y-1 "
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800 text-base group-hover:text-[#5F35D2] transition-colors">
                                  {variety.unit || variety.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {variety.isAvailable === false && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-semibold border border-red-200">
                                      Out of Stock
                                    </span>
                                  </div>
                                )}
                             
                                <div className="flex items-center gap-1  transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                  {onEditVariety && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditVariety({ ...variety, item: selectedItem });
                                      }}
                                      className="p-2 text-[#5F35D2] hover:bg-[#5F35D2]/10 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                                      title="Edit variety"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                  {onDeleteVariety && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteVarietyId(variety.id);
                                        setIsDeleteVarietyModalOpen(true);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                                      title="Delete variety"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {variety.description && (
                              <p className="text-sm text-gray-600 mb-4 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-[#5F35D2]/20">
                                {variety.description}
                              </p>
                            )}
                            
                            <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                              
                                  <span className="text-gray-600 text-xs font-bold">₦</span>
                                <span className="text-xl font-bold text-gray-600 ">
                                  {variety.price?.toLocaleString('en-NG', {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                                {variety.isAvailable !== false && (
                                  <div className="flex items-center gap-1  transition-all duration-200">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                                      Available
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                          <div className="relative mb-6">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <Star className="w-10 h-10 text-gray-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#5F35D2] rounded-full flex items-center justify-center">
                              <Plus className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">No varieties available</h4>
                          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
                            Create varieties to offer different options for this item and give customers more choices
                          </p>
                          <button
                            onClick={() => openCreateVarietyModal(selectedItem)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5F35D2] to-[#7C69D8] text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="font-medium">Add Variety</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Close the varieties div */}
              </div>x
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>

      {/* Delete Item Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        toggleModal={() => setIsDeleteModalOpen(false)}
        handleDelete={async () => {
          setIsDeleting(true);
          try {
            if (onDeleteItem) {
              onDeleteItem(selectedItem);
              onOpenChange(false);
            }
          } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
          }
        }}
        isLoading={isDeleting}
        text="Are you sure you want to delete this menu item?"
      />

      {/* Delete Variety Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteVarietyModalOpen}
        toggleModal={() => {
          setIsDeleteVarietyModalOpen(false);
          setDeleteVarietyId(null);
        }}
        handleDelete={async () => {
          if (onDeleteVariety && deleteVarietyId) {
            await onDeleteVariety(deleteVarietyId);
            setIsDeleteVarietyModalOpen(false);
            setDeleteVarietyId(null);
          }
        }}
        isLoading={false}
        text="Are you sure you want to delete this variety?"
      />
    </Modal>
  );
};

export default ItemDetailsModal;
