
import {
  Modal,
  ModalContent,
  ModalBody,
  ScrollShadow,
  Tooltip,
  Spacer,
} from '@nextui-org/react';
import { RiEdit2Line, RiDeleteBin6Line } from 'react-icons/ri';
import EmptyState from '@/components/ui/dashboard/menu/EmptyState';

interface ViewMenuModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  viewMenuMode: 'all' | 'current';
  categories: any[];
  menuSections: any[];
  handleEditSection: (category: any) => void;
  setSelectedMenu: (menu: any) => void;
  setIsOpenDeleteMenu: (isOpen: boolean) => void;
  handleEditMenu: (menu: any) => void;
  onOpen: () => void;
  setIsOpenCreateSection: (isOpen: boolean) => void;
}

const ViewMenuModal = ({
  isOpen,
  onOpenChange,
  viewMenuMode,
  categories,
  menuSections,
  handleEditSection,
  setSelectedMenu,
  setIsOpenDeleteMenu,
  handleEditMenu,
  onOpen,
  setIsOpenCreateSection,
}: ViewMenuModalProps) => {
  return (
    <Modal isOpen={isOpen} size="md" onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <h2 className="text-[24px] leading-3 mt-8 mb-2 text-black font-semibold">
                {viewMenuMode === 'current' ? 'Menu Sections' : 'All menus'}
              </h2>

              <ScrollShadow size={5} className="w-full max-h-[350px]">
                {viewMenuMode === 'current' ? (
                  // Eye button: Show categories list
                  categories && categories.length > 0 ? (
                    categories.map((category: any) => (
                      <div
                        className="text-black flex justify-between text-sm border-b border-primaryGrey py-3"
                        key={category.categoryId}
                      >
                        <div>
                          <p className="font-medium">
                            {category.categoryName || 'Uncategorized'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Tooltip color="secondary" content={'Edit Section'}>
                            <span className="mr-3">
                              <RiEdit2Line
                                onClick={() => handleEditSection(category)}
                                className="text-[18px] text-[#5F35D2] cursor-pointer"
                              />
                            </span>
                          </Tooltip>
                          <Tooltip color="danger" content={'Delete'}>
                            <span>
                              <RiDeleteBin6Line
                                onClick={() => {
                                  setSelectedMenu(category);
                                  onOpenChange(false);
                                  setIsOpenDeleteMenu(true);
                                }}
                                className="text-[18px] text-[#dc2626] cursor-pointer"
                              />
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4">
                      <EmptyState
                        title="No categories available"
                        description="Create a new section to organize your menu items."
                        actionButton={{
                          text: 'Create Section',
                          onClick: () => {
                            onOpenChange(false);
                            setIsOpenCreateSection(true);
                          },
                        }}
                      />
                    </div>
                  )
                ) : // Edit button: Show only current category's menuSections
                menuSections && menuSections.length > 0 ? (
                  menuSections.map((section: any) => (
                    <div
                      className="text-black flex justify-between text-sm border-b border-primaryGrey py-3"
                      key={section.id}
                    >
                      <div>
                        <p className="font-medium">{section.name}</p>
                      </div>
                      <div className="flex items-center">
                        <Tooltip color="secondary" content={'Edit Menu'}>
                          <span className="mr-3">
                            <RiEdit2Line
                              onClick={() => handleEditMenu(section)}
                              className="text-[18px] text-[#5F35D2] cursor-pointer"
                            />
                          </span>
                        </Tooltip>
                        <Tooltip color="danger" content={'Delete Menu'}>
                          <span>
                            <RiDeleteBin6Line
                              onClick={() => {
                                setSelectedMenu(section);
                                onOpenChange(false);
                                setIsOpenDeleteMenu(true);
                              }}
                              className="text-[18px] text-[#dc2626] cursor-pointer"
                            />
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4">
                    <EmptyState
                      title="No menu sections in this category"
                      description="Create a new menu to add items to this category."
                      actionButton={{
                        text: 'Create Menu',
                        onClick: () => {
                          onOpenChange(false);
                          onOpen();
                        },
                      }}
                    />
                  </div>
                )}
              </ScrollShadow>

              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewMenuModal;
