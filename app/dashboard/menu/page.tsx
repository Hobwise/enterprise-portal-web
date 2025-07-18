'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import CreateMenu from '@/components/ui/dashboard/menu/createMenu';
import MenuList from '@/components/ui/dashboard/menu/menu';
import DeleteModal from '@/components/ui/deleteModal';

import {
  createMenu,
  deleteMenu,
  exportGrid,
  updateMenu,
} from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
import {
  dynamicExportConfig,
  formatPrice,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import {
  Button,
  ButtonGroup,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Spacer,
  Tooltip,
  useDisclosure,
  Skeleton,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import {
  IoAddCircleOutline,
  IoPhonePortraitOutline,
  IoSearchOutline,
} from 'react-icons/io5';

import useAllMenus from '@/hooks/cachedEndpoints/useAllMenus';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useGlobalContext } from '@/hooks/globalProvider';
import toast from 'react-hot-toast';
import { MdOutlineFileDownload } from 'react-icons/md';
import { RiDeleteBin6Line, RiEdit2Line } from 'react-icons/ri';
import { VscLoading } from 'react-icons/vsc';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';


const Menu: React.FC = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const { userRolePermissions, role } = usePermission();
  const router = useRouter();
  const { setPage } = useGlobalContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);
  const [isOpenEditMenu, setIsOpenEditMenu] = useState(false);
  const [isOpenDeleteMenu, setIsOpenDeleteMenu] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [loadingExport, setLoadingExport] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [packingCost, setPackingCost] = useState<number | undefined>();
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const [editingMenu, setEditingMenu] = useState<{
    id: string;
    name: string;
    packingCost?: number;
    estimatedTime?: number;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editPackingCost, setEditPackingCost] = useState<number | undefined>();
  const [editEstimatedTime, setEditEstimatedTime] = useState<
    number | undefined
  >();

  const {
    data: allMenus,
    isLoading: isMenuLoading,
    isError: isMenuError,
    refetch: getMenu,
  } = useAllMenus();
  const { data, isLoading, isError, refetch } = useMenu();

  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleCreateMenu = async () => {
    setLoading(true);
    const data = await createMenu(businessInformation[0]?.businessId, {
      name,
      packingCost,
      waitingTimeMinutes: estimatedTime,
    });
    setLoading(false);
    if (data?.data?.isSuccessful) {
      notify({
        title: 'Success!',
        text: 'Menu successfully created',
        type: 'success',
      });
      await queryClient.invalidateQueries('allMenus');
      await queryClient.invalidateQueries('menu');
      await refetch();
      await getMenu();
      onOpenChange();
      setName('');
      setPackingCost(undefined);
      setEstimatedTime(undefined);
      router.push('/dashboard/menu/add-menu-item');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
 
  useEffect(() => {
    refetch()
  
  
  }, [])
  
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
    const data = await updateMenu(
      businessInformation[0]?.businessId,
      editingMenu.id,
      {
        name: editName,
        packingCost: editPackingCost,
        waitingTimeMinutes: editEstimatedTime,
      }
    );
    setLoading(false);

    if (data?.data?.isSuccessful) {
      await queryClient.invalidateQueries('allMenus');
      await queryClient.invalidateQueries('menu');
      await refetch();
      await getMenu();
      toast.success('Menu updated successfully');

      closeEditModal();
    } else if (data?.data?.error) {
      toast.error(data?.data?.error);
    }
  };

  const closeEditModal = () => {
    setIsOpenEditMenu(false);
    setIsOpenViewMenu(true);
  };

  const filteredItems = useMemo(() => {
    return data?.map((item) => ({
      ...item,
      items: item?.items?.filter(
        (item) =>
          item?.itemName?.toLowerCase().includes(searchQuery) ||
          String(item?.price)?.toLowerCase().includes(searchQuery) ||
          item?.menuName?.toLowerCase().includes(searchQuery) ||
          item?.itemDescription?.toLowerCase().includes(searchQuery)
      ),
    }));
  }, [data, searchQuery]);

  const removeMenu = async () => {
    if (!selectedMenu) return;
    setLoading(true);
    const data = await deleteMenu(
      businessInformation[0]?.businessId,
      selectedMenu.id
    );
    setLoading(false);
    if (data?.data?.isSuccessful) {
      await queryClient.invalidateQueries('allMenus');
      await queryClient.invalidateQueries('menu');
      await refetch();
      await getMenu();
      toast.success('Menu deleted successfully');
      setIsOpenDeleteMenu(false);
      setIsOpenViewMenu(true);
    } else if (data?.data?.error) {
      toast.error(data?.data?.error);
    }
  };

  if (isLoading || isMenuLoading) return <CustomLoading ismenuPage />;
  if (isError || isMenuError) return <Error onClick={() => refetch()} />;

  const exportCSV = async () => {
    setLoadingExport(true);
    const response = await exportGrid(businessInformation[0]?.businessId, 0);
    setLoadingExport(false);

    if (response?.status === 200) {
      dynamicExportConfig(
        response,
        `Menus-${businessInformation[0]?.businessName}`
      );
      toast.success('Menus downloaded successfully');
    } else {
      toast.error('Export failed, please try again');
    }
  };

  return (
    <>
      <div className="flex flex-row flex-wrap items-center  mb-4  xl:mb-8 justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data && data?.length > 0 ? (
              <div className="flex items-center">
                <span>All menu</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data.length}
                </Chip>
              </div>
            ) : (
              <span>Menu</span>
            )}
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px] w-full">
            Show all menu items
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          {data && data.length > 0 && (
            <>
              <div className="md:w-[242px] w-full">
                <CustomInput
                  label=""
                  size="md"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isRequired={false}
                  startContent={<IoSearchOutline />}
                  type="text"
                  placeholder="Search here..."
                />
              </div>
              <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg">
                <Button
                  onClick={() => router.push("/dashboard/menu/preview-menu")}
                  className="flex text-grey600 bg-white"
                >
                  <IoPhonePortraitOutline />
                  <p>Preview menu</p>
                </Button>

                <Button
                  disabled={loadingExport}
                  onClick={exportCSV}
                  className="flex text-grey600 bg-white"
                >
                  {loadingExport ? (
                    <VscLoading className="animate-spin" />
                  ) : (
                    <MdOutlineFileDownload className="text-[22px]" />
                  )}

                  <p>Export csv</p>
                </Button>
              </ButtonGroup>
            </>
          )}

          {data &&
            data.length > 0 &&
            (role === 0 || userRolePermissions?.canCreateMenu === true) && (
              <CustomButton
              onClick={onOpen}
                className="py-2 md:w-auto w-full  px-4 md:mb-0 mb-4 text-white"
                backgroundColor="bg-primaryColor"
              >
                <div className="flex gap-2 items-center justify-center">
                  <IoAddCircleOutline className="text-[22px]" />
                  <p>{"Create new menu "} </p>
                </div>
              </CustomButton>
            )}
        </div>
      </div>
      {data && data.length > 0 ? (
        <MenuList
          menus={filteredItems || []}
          onOpen={onOpen}
          onOpenViewMenu={() => setIsOpenViewMenu(true)}
          searchQuery={searchQuery}
        />
      ) : (
        <CreateMenu onOpen={onOpen} />
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPackingCost(Number(e.target.value))
                  }
                  value={String(packingCost)}
                  label="Packing cost (Optional)"
                  placeholder="This is a cost required to pack any item in this menus"
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
          {(onClose) => (
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

      <Modal
        isOpen={isOpenViewMenu}
        onOpenChange={(open) => setIsOpenViewMenu(open)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 mb-2 text-black font-semibold">
                  All menus
                </h2>

                <ScrollShadow size={5} className="w-full max-h-[350px]">
                  {allMenus?.map((item: any) => {
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
                  })}
                </ScrollShadow>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

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
    </>
  );
};

export default Menu;
