
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

interface SingleVarietyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedVariety: any;
  selectedItem: any;
  backToItemDetailsFromVariety: () => void;
  onDeleteVariety?: (varietyId: string) => Promise<void>;
  onEditVariety?: (variety: any) => void;
  onCreateVariety?: (item: any) => void;
}

const SingleVarietyModal = ({
  isOpen,
  onOpenChange,
  selectedVariety,
  selectedItem,
  backToItemDetailsFromVariety,
  onDeleteVariety,
  onEditVariety,
  onCreateVariety,
}: SingleVarietyModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedVariety) return null;

  const handleDelete = async () => {
    if (!onDeleteVariety) return;
    
    setIsDeleting(true);
    try {
      await onDeleteVariety(selectedVariety.id);
      setShowDeleteConfirm(false);
      backToItemDetailsFromVariety();
    } catch (error) {
      console.error('Error deleting variety:', error);
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
                <button
                  onClick={backToItemDetailsFromVariety}
                  className="flex items-center gap-2 text-[#5F35D2] hover:text-[#5F35D2]"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to item details</span>
                </button>
                <div className="flex items-center gap-2">
                  {onCreateVariety && (
                    <button
                      onClick={() => onCreateVariety(selectedItem)}
                      className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Variety</span>
                    </button>
                  )}
                  {onEditVariety && (
                    <button 
                      onClick={() => onEditVariety(selectedVariety)}
                      className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDeleteVariety && (
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
                <div className="flex gap-8">
                  <img
                    src={
                      selectedVariety?.image && selectedVariety.image.trim() !== ''
                        ? selectedVariety.image.startsWith('data:') || selectedVariety.image.startsWith('http')
                          ? selectedVariety.image
                          : `data:image/jpeg;base64,${selectedVariety.image}`
                        : '/assets/images/no-image.svg'
                    }
                    alt={selectedVariety?.item?.itemName || selectedVariety?.unit}
                    className="w-80 h-80 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/no-image.svg';
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl text-gray-700 font-semibold mb-2">
                      {selectedVariety?.item?.itemName} ({selectedVariety?.unit})
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedVariety?.description ||
                        'No description available'}
                    </p>
                    <p className="text-2xl text-gray-700 font-bold mb-4">
                      ₦
                      {selectedVariety?.price?.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Unit:</span>{' '}
                        {selectedVariety?.unit}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Main Item:</span>{' '}
                        {selectedItem?.itemName}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Category:</span>{' '}
                        {selectedItem?.menuName}
                      </p>
                    </div>
                  </div>
                </div>
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
              <h3 className="text-lg font-semibold mb-4">Delete Variety</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedVariety?.unit}"? This action cannot be undone.
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
    </Modal>
  );
};

export default SingleVarietyModal;
