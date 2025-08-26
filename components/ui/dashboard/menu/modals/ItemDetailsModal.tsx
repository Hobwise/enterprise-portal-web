
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
} from '@nextui-org/react';
import { ArrowLeft, Edit, Plus, Star, Trash2 } from 'lucide-react';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItem: any;
  openCreateVarietyModal: (item: any) => void;
  varietiesLoading: boolean;
  handleVarietyClick: (variety: any) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (item: any) => void;
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
}: ItemDetailsModalProps) => {
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
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
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
                            onClick={() => handleVarietyClick(variety)}
                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                              className="w-20 h-20 rounded-lg object-cover bg-cyan-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-700">{variety.name}</h3>
                              <p className="text-sm text-gray-700 mt-1">
                                {variety.description}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {selectedItem.category}
                              </p>
                              <p className="font-bold mt-2 text-gray-700">
                                ₦
                                {variety.price.toLocaleString('en-NG', {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <button className="text-gray-700 p-2 hover:bg-gray-200 rounded">
                              <Star className="w-5 h-5 text-gray-400" />
                            </button>
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
