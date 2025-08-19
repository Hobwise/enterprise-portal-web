"use client"
import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Plus, Eye, Edit, Download, ChevronRight } from 'lucide-react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Spacer,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import DeleteModal from '@/components/ui/deleteModal';
import { formatPrice } from '@/lib/utils';
import { RiDeleteBin6Line, RiEdit2Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

const RestaurantMenu = () => {
  const [activeCategory, setActiveCategory] = useState('Kitchen');
  const [activeSubCategory, setActiveSubCategory] = useState('Pasta');

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);
  const [isOpenEditMenu, setIsOpenEditMenu] = useState(false);
  const [isOpenDeleteMenu, setIsOpenDeleteMenu] = useState(false);

  // Form states for Create Menu
  const [name, setName] = useState('');
  const [packingCost, setPackingCost] = useState<number | undefined>();
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  // Form states for Edit Menu
  const [editingMenu, setEditingMenu] = useState<{
    id: string;
    name: string;
    packingCost?: number;
    waitingTimeMinutes?: number;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editPackingCost, setEditPackingCost] = useState<number | undefined>();
  const [editEstimatedTime, setEditEstimatedTime] = useState<number | undefined>();
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  // Sample data
  const [categories, setCategories] = useState([
    { id: '1', name: 'Kitchen', packingCost: 100, waitingTimeMinutes: 30 },
    { id: '2', name: 'Bar', packingCost: 0, waitingTimeMinutes: 10 },
    { id: '3', name: 'Grills', packingCost: 150, waitingTimeMinutes: 45 },
    { id: '4', name: 'Pasteries', packingCost: 50, waitingTimeMinutes: 20 },
    { id: '5', name: 'Games', packingCost: 0, waitingTimeMinutes: 0 },
  ]);

  const subCategories = ['All menu', 'Pasta', 'Rice', 'Swallow', 'Soups', 'Proteins', 'Extras'];

  const menuItems = [
    {
      id: 1,
      name: 'Stir Fried Spaghetti',
      price: 2500.00,
      image: '/Rectangle 161125908.png'
    },
    {
      id: 2,
      name: 'Spaghetti and Sauce',
      price: 2500.00,
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Spaghetti Bolognese',
      price: 2500.00,
      image: 'https://images.unsplash.com/photo-1626844131082-256783844137?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      name: 'Creamy Pasta',
      price: 2500.00,
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      name: 'Mac and Cheese',
      price: 2500.00,
      image: 'https://images.unsplash.com/photo-1543339494-43e6e7ff7efd?w=300&h=200&fit=crop'
    },
    {
      id: 6,
      name: 'Stir Fried Macaroni',
      price: 2500.00,
      image: 'https://images.unsplash.com/photo-1633337474564-1d9478ca4e2e?w=300&h=200&fit=crop'
    }
  ];

  // Handlers
  const handleCreateMenu = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newMenu = {
        id: String(categories.length + 1),
        name,
        packingCost: packingCost || 0,
        waitingTimeMinutes: estimatedTime || 0,
      };
      setCategories([...categories, newMenu]);
      toast.success('Menu successfully created');
      setLoading(false);
      onOpenChange();
      setName('');
      setPackingCost(undefined);
      setEstimatedTime(undefined);
    }, 1500);
  };

  const handleEditMenu = (menu: any) => {
    setEditingMenu(menu);
    setEditName(menu.name);
    setEditPackingCost(menu.packingCost);
    setEditEstimatedTime(menu.waitingTimeMinutes);
    setIsOpenViewMenu(false);
    setIsOpenEditMenu(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCategories(categories.map(cat => 
        cat.id === editingMenu.id 
          ? { ...cat, name: editName, packingCost: editPackingCost || 0, waitingTimeMinutes: editEstimatedTime || 0 }
          : cat
      ));
      toast.success('Menu updated successfully');
      setLoading(false);
      closeEditModal();
    }, 1500);
  };

  const closeEditModal = () => {
    setIsOpenEditMenu(false);
    setIsOpenViewMenu(true);
  };

  const removeMenu = async () => {
    if (!selectedMenu) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCategories(categories.filter(cat => cat.id !== selectedMenu.id));
      toast.success('Menu deleted successfully');
      setLoading(false);
      setIsOpenDeleteMenu(false);
      setIsOpenViewMenu(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen ">

      {/* Page Title */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Menu</h1>
            <p className="text-gray-500 text-sm mt-1">Showing all menu items</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#EAE5FF] rounded-md">
        <div className="flex items-center px-4 gap-6 py-2">
          <button className="p-2 flex items-center text-[#6C7278]">
            <Plus className="w-5 h-5 text-primaryColor" />
              Restaurant
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              className={` px-2 border-b-2 transition-colors ${
                activeCategory === category.name
                  ? 'border-primaryColor text-primaryColor font-medium'
                  : 'border-transparent text-[#6C7278] hover:text-gray-800'
              }`}
            >
              {category.name}
            </button>
          ))}
          <button onClick={() => setIsOpenViewMenu(true)} className="ml-auto p-2 text-primaryColor">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
        <div className="flex items-center px-6 py-3 gap-6">
          <button onClick={onOpen} className="flex items-center gap-2 px-4 py-2 border border-primaryColor text-primaryColor rounded-lg hover:bg-[#EAE5FF]">
            <span>Create new menu</span>
            <Plus className="w-4 h-4" />
          </button>
          
          {subCategories.map((subCategory) => (
            <button
              key={subCategory}
              onClick={() => setActiveSubCategory(subCategory)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSubCategory === subCategory
                  ? 'bg-primaryColor text-white'
                  : 'text-gray-600 hover:bg-[#EAE5FF]'
              }`}
            >
              {subCategory}
            </button>
          ))}
          
          <button className="ml-auto p-2 text-gray-600 hover:bg-[#EAE5FF] rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-[#EAE5FF] rounded-lg">
            <Edit className="w-5 h-5" />
          </button>
        </div>

      {/* Menu Items Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Add New Item Card */}
          <div className="bg-white border rounded-lg shadow p-6 flex flex-col items-center justify-center hover:border-primaryColor cursor-pointer transition-colors h-[150px]">
              <img src="/assets/icons/menu.svg" alt="add" />
            <span className="text-gray-600 text-sm font-medium">Add new item</span>
          </div>

          {/* Menu Items */}
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg shadow  hover:shadow-md h-[170px] transition-shadow cursor-pointer">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="px-1.5 mt-1">
                <h3 className="text-sm font-medium text-gray-800 mb-1">{item.name}</h3>
                <p className="text-xs font-semibold text-gray-900">
                  ₦{item.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Menu Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Create Menu
                </h2>
                <p className="text-sm  text-grey600  xl:w-[231px]  w-full mb-4">
                  Create a menu to add item
                </p>
                <CustomInput
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  value={name}
                  label="Name of menu"
                  placeholder="E.g Drinks"
                />
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setPackingCost(value || undefined);
                    }
                  }}
                  value={packingCost !== undefined ? String(packingCost) : ''}
                  label="Packing cost (Optional)"
                  placeholder="This is a cost required to pack any item in this menus"
                  min="0"
                />
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setEstimatedTime(value || undefined);
                    }
                  }}
                  value={estimatedTime !== undefined ? String(estimatedTime) : ''}
                  label="Preparation time in minutes (Optional)"
                  placeholder="This is the estimated time required to prepare any item in this menus"
                  min="0"
                />
                <Spacer y={2} />

                <CustomButton
                  loading={loading}
                  onClick={handleCreateMenu}
                  disabled={!name || loading}
                  type="submit"
                >
                  {loading ? "Loading" : "Proceed"}
                </CustomButton>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Menu Modal */}
      <Modal
        isOpen={isOpenEditMenu}
        onOpenChange={(open) => {
          if (!open) {
            closeEditModal();
          }
          setIsOpenEditMenu(open);
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Edit Menu
                </h2>
                <p className="text-sm text-grey600 xl:w-[231px] w-full mb-4">
                  Update menu details
                </p>
                <CustomInput
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditName(e.target.value)
                  }
                  value={editName}
                  label="Name of menu"
                  placeholder="E.g Drinks"
                />
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setEditPackingCost(value || undefined);
                    }
                  }
                  }
               
                  
                  value={
                    editPackingCost !== undefined
                      ? String(editPackingCost)
                      : ""
                  }
                  label="Packing cost (Optional)"
                  placeholder="This is a cost required to pack any item in this menus"
                />
                <CustomInput
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setEditEstimatedTime(value || undefined);
                    }
                  }}
                  value={
                    editEstimatedTime !== undefined
                      ? String(editEstimatedTime)
                      : ""
                  }
                  label="Preparation time in minutes (Optional)"
                  placeholder="This is the estimated time required to prepare any item in this menus"
                  min="0"
                />
                <Spacer y={2} />

                <div className="flex gap-2">
                  <CustomButton
                    onClick={() => closeEditModal()}
                    className="flex-1 text-gray-700"
                    backgroundColor="bg-gray-200"
                  >
                    Cancel
                  </CustomButton>

                  <CustomButton
                    loading={loading}
                    onClick={handleUpdateMenu}
                    disabled={!editName || loading}
                    type="submit"
                    className="flex-1 text-white"
                  >
                    {loading ? "Loading" : "Update Menu"}
                  </CustomButton>
                </div>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View All Menus Modal */}
      <Modal
        isOpen={isOpenViewMenu}
        onOpenChange={(open) => setIsOpenViewMenu(open)}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 mb-2 text-black font-semibold">
                  All menus
                </h2>

                <ScrollShadow size={5} className="w-full max-h-[350px]">
                  {categories && categories.length > 0 ? (
                    categories.map((item: any) => {
                      return (
                        <div
                          className="text-black flex justify-between text-sm border-b border-primaryGrey py-3"
                          key={item.id}
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.packingCost > 0 && (
                              <p className="text-xs text-grey600">
                                Packing cost: {formatPrice(item.packingCost)}
                              </p>
                            )}
                            {item.waitingTimeMinutes > 0 && (
                              <p className="text-xs text-grey600">
                                Preparation time: {item.waitingTimeMinutes}mins
                              </p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Tooltip color="secondary" content={"Edit"}>
                              <span className="mr-3">
                                <RiEdit2Line
                                  onClick={() => handleEditMenu(item)}
                                  className="text-[18px] text-primaryColor cursor-pointer"
                                />
                              </span>
                            </Tooltip>
                            <Tooltip color="danger" content={"Delete"}>
                              <span>
                                <RiDeleteBin6Line
                                  onClick={() => {
                                    setSelectedMenu(item);
                                    setIsOpenViewMenu(false);
                                    setIsOpenDeleteMenu(true);
                                  }}
                                  className="text-[18px] text-[#dc2626] cursor-pointer"
                                />
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-grey600 py-8">
                      No menus found
                    </div>
                  )}
                </ScrollShadow>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Menu Modal */}
      <DeleteModal
        isOpen={isOpenDeleteMenu}
        toggleModal={() => {
          setIsOpenDeleteMenu(false);
          setIsOpenViewMenu(true);
        }}
        handleDelete={removeMenu}
        isLoading={loading}
        text="Are you sure you want to delete this menu?"
      />
    </div>
  );
};

export default RestaurantMenu;