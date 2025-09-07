import { Modal, ModalContent, ModalBody, Switch } from "@nextui-org/react";
import { ArrowLeft, Edit, Plus, Star, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import EditItemModal from "./EditItemModal";
import DeleteModal from "@/components/ui/deleteModal";
import toast from "react-hot-toast";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import type { payloadMenuItem } from "@/app/api/controllers/dashboard/menu";

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
}: SingleItemModalProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(
    selectedItem?.isAvailable ?? true
  );
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteVarietyId, setDeleteVarietyId] = useState<string | null>(null);
  const [isDeleteVarietyModalOpen, setIsDeleteVarietyModalOpen] =
    useState(false);

  useEffect(() => {
    if (selectedItem) {
      setIsAvailable(selectedItem.isAvailable ?? true);
    }
  }, [selectedItem]);

  if (!selectedItem) return null;

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsUpdatingAvailability(true);
    try {
      // Import and call the update API
      const { editMenuItem } = await import(
        "@/app/api/controllers/dashboard/menu"
      );
      const business = getJsonItemFromLocalStorage("business");

      const payload: payloadMenuItem = {
        menuID: selectedItem.menuID,
        itemName: selectedItem.itemName,
        itemDescription: selectedItem.itemDescription || "",
        price: selectedItem.price,
        currency: "NGN",
        isAvailable: value,
        hasVariety: selectedItem.varieties?.length > 0 || false,
        imageReference: selectedItem.imageReference || "",
      };

      const response = await editMenuItem(
        business[0]?.businessId,
        payload,
        selectedItem.id
      );

      if (response && "errors" in response) {
        toast.error("Failed to update availability");
        return;
      }

      if (response?.data?.isSuccessful) {
        setIsAvailable(value);
        toast.success(`Item ${value ? "enabled" : "disabled"} successfully`);
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        toast.error("Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="5xl"
      onOpenChange={onOpenChange}
      hideCloseButton
    >
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
                <div className="grid grid-cols-1 items-center lg:grid-cols-5 gap-8">
                  {/* Main Item */}
                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Image */}
                      <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-xl ">
                          <img
                            src={
                              selectedItem.image &&
                              selectedItem.image.trim() !== ""
                                ? selectedItem.image.startsWith("data:") ||
                                  selectedItem.image.startsWith("http")
                                  ? selectedItem.image
                                  : `data:image/jpeg;base64,${selectedItem.image}`
                                : "/assets/images/no-image.svg"
                            }
                            alt={selectedItem.itemName}
                            className="w-full h-[20rem] object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/images/no-image.svg";
                            }}
                          />
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {selectedItem.itemName}
                          </h2>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#5F35D2]/10 text-[#5F35D2] mb-3">
                            {selectedItem.menuName}
                          </div>
                        </div>

                        <p className="text-gray-600 leading-relaxed">
                          {selectedItem.itemDescription}
                        </p>

                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-3xl font-bold text-[#5F35D2]">
                            ₦
                            {selectedItem.price.toLocaleString("en-NG", {
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
                              wrapper:
                                "group-data-[selected=true]:bg-[#5F35D2]",
                            }}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isAvailable ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {isAvailable ? "Available" : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Varieties */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-xl p-6 h-full">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5F35D2] to-[#7C69D8] rounded-lg flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Varieties
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {selectedItem.varieties &&
                        selectedItem.varieties.length > 0 ? (
                          selectedItem.varieties.map((variety: any) => (
                            <div
                              key={variety.id}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#5F35D2]/20 transition-all duration-200 group"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-800">
                                  {variety.unit || variety.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {variety.isAvailable === false && (
                                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full font-medium">
                                      Out of Stock
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onEditVariety && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditVariety({
                                            ...variety,
                                            item: selectedItem,
                                          });
                                        }}
                                        className="p-1.5 text-[#5F35D2] hover:bg-[#5F35D2]/10 rounded-md transition-colors"
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
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete variety"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {variety.description && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {variety.description}
                                </p>
                              )}

                              <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-[#5F35D2]">
                                  ₦
                                  {variety.price?.toLocaleString("en-NG", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <div className="relative mb-6">
                              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <Star className="w-10 h-10 text-gray-400" />
                              </div>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">
                              No varieties available
                            </h4>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                              Create varieties to offer different options for
                              this item
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>

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

      {/* Delete Item Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        toggleModal={() => setIsDeleteModalOpen(false)}
        handleDelete={async () => {
          setIsDeleting(true);
          try {
            if (onDeleteItem) {
              await onDeleteItem(selectedItem.id);
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

export default SingleItemModal;
