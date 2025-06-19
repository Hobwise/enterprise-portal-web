'use client';

import React, { useEffect, useState } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { GrFormView } from 'react-icons/gr';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import noImage from '../../../../public/assets/images/no-image.svg';
import { columns, statusColorMap, statusDataMap } from './data';
import Filters from './filters';
import { getMenuItems } from '@/app/api/controllers/dashboard/menu';

interface Column {
  name: string;
  uid: string;
}

const INITIAL_VISIBLE_COLUMNS = ['name', 'desc', 'price', 'actions'];

interface MenuItem {
  id: string;
  categoryId?: string;
  menuID: string;
  packingCost: number;
  price: number;
  image: string;
  imageReference: string;
  varieties: null;
  menuName: string;
  itemName: string;
  itemDescription: string;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  name?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  packingCost: number;
  waitingTimeMinutes: number;
  totalCount: number;
  items?: MenuItem[];
}

interface MenuListProps {
  menus: MenuCategory[];
  onOpen: () => void;
  onOpenViewMenu: () => void;
  searchQuery: string;
}

interface ChipProps {
  children: React.ReactNode;
  color?: 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bordered' | 'flat';
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ children, color, size, variant, className }) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  const colorClasses = {
    danger: variant === 'bordered' 
      ? 'border border-red-300 text-red-700 bg-transparent' 
      : 'bg-red-100 text-red-800',
    success: variant === 'bordered' 
      ? 'border border-green-300 text-green-700 bg-transparent' 
      : 'bg-green-100 text-green-800',
    warning: variant === 'bordered' 
      ? 'border border-yellow-300 text-yellow-700 bg-transparent' 
      : 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <div className={`chip ${color} ${size} ${variant} ${className}`}>
      {children}
    </div>
  );
};

// Custom Dropdown components
interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ children, className }) => {
  return <div className={`relative inline-block ${className || ''}`}>{children}</div>;
}

interface DropdownTriggerProps {
  children: React.ReactElement;
  [key: string]: any;
}

const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div onClick={() => setIsOpen(!isOpen)} {...props}>
      {React.cloneElement(children, { isOpen, setIsOpen })}
    </div>
  );
};

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className }) => {
  return (
    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 ${className || ''}`}>
      <div className="py-1">{children}</div>
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  [key: string]: any;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ children, ...props }) => {
  return (
    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" {...props}>
      {children}
    </div>
  );
};

interface EnhancedDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const EnhancedDropdown: React.FC<EnhancedDropdownProps> = ({ trigger, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.dropdown-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  return (
    <div className={`relative inline-block dropdown-container ${className || ''}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  isIconOnly?: boolean;
  radius?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'faded' | 'flat';
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className, 
  isIconOnly, 
  radius, 
  size, 
  variant,
  'aria-label': ariaLabel 
}) => {
  return (
    <button
      onClick={onClick}
      className={`button ${className || ''} ${isIconOnly ? 'icon-only' : ''} ${radius || ''} ${size || ''} ${variant || ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

const MenuList: React.FC<MenuListProps> = ({ menus, onOpen, onOpenViewMenu, searchQuery }) => {
  const [filteredMenu, setFilteredMenu] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
    page,
    rowsPerPage,
    menuIdTable,
    setMenuIdTable,
    setPage,
  } = useGlobalContext();
  
  const [loadedCategories, setLoadedCategories] = useState<{ [id: string]: MenuItem[] }>({});
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');

  // Initialize with first menu but don't load data automatically
  useEffect(() => {
    if (menus && menus.length > 0 && !currentCategoryId) {
      const firstMenu = menus[0];
      setCurrentCategoryId(firstMenu.id);
      setMenuIdTable(firstMenu.id);
    }
  }, [menus, currentCategoryId]);

  // Load category data when currentCategoryId changes
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!currentCategoryId) return;
      
      // If already loaded, use cached data
      if (loadedCategories[currentCategoryId]) {
        setFilteredMenu(loadedCategories[currentCategoryId]);
        return;
      }

      // Load new data
      setLoading(true);
      try {
        const itemsResponse = await getMenuItems(currentCategoryId, page, rowsPerPage);
        const items = itemsResponse?.data?.data?.items || [];
        
        setLoadedCategories((prev) => ({
          ...prev,
          [currentCategoryId]: items,
        }));
        setFilteredMenu(items);
      } catch (error) {
        console.error('Error loading menu items:', error);
        setFilteredMenu([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [currentCategoryId, page, rowsPerPage]);

  // Handle search filtering
  useEffect(() => {
    if (!currentCategoryId || !loadedCategories[currentCategoryId]) {
      return;
    }

    const currentItems = loadedCategories[currentCategoryId];
    
    if (searchQuery && searchQuery.trim()) {
      const filteredItems = currentItems.filter((item) =>
        item?.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item?.price)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.menuName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMenu(filteredItems);
    } else {
      setFilteredMenu(currentItems);
    }
  }, [searchQuery, currentCategoryId, loadedCategories]);

  const matchingObject = menus?.find(
    (category) => category?.id === currentCategoryId
  );

  const currentMenuItems = filteredMenu || [];
    
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    selectedKeys,
    sortDescriptor,
    setSortDescriptor,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    classNames,
    hasSearchFilter,
  } = usePagination(matchingObject, columns, INITIAL_VISIBLE_COLUMNS);

  const [value, setValue] = useState('');

  const handleTabChange = (index: string) => {
    setValue(index);
  };

  const handleTabClick = async (categoryName: string) => {
    setPage(1);
    const selectedCategory = menus.find((item) => item.name === categoryName);
    
    if (!selectedCategory) return;
    
    const categoryId = selectedCategory.id;
    
    // Update current category
    setCurrentCategoryId(categoryId);
    setMenuIdTable(categoryId);
    setValue(categoryName);
  };

  const renderCell = React.useCallback((menu: MenuItem, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className='flex'>
            <div className='h-[60px] w-[60px]'>
              <Image
                className='bg-cover h-[60px] rounded-lg object-cover'
                width={60}
                height={60}
                alt='menu'
                aria-label='menu'
                src={menu.image ? `data:image/jpeg;base64,${menu.image}` : noImage}
              />
            </div>

            <div className='ml-5 gap-1 grid place-content-center'>
              <p className='text-sm capitalize'>{menu.menuName}</p>
              <p className='font-medium text-black text-sm'>{menu.itemName}</p>
              {!menu.isAvailable && (
                <Chip
                  className='capitalize'
                  color={statusColorMap[String(menu.isAvailable)]}
                  size='sm'
                  variant='bordered'
                >
                  {statusDataMap[String(menu.isAvailable)]}
                </Chip>
              )}
            </div>
          </div>
        );
      case 'price':
        return (
          <div className='text-sm flex'>
            <p>{formatPrice(menu.price)}</p>
          </div>
        );
      case 'desc':
        return (
          <div className='text-sm m-0 w-[360px]'>
            {menu.itemDescription}
          </div>
        );
      case 'actions':
        return (
          <div className='relative flex justify-center items-center gap-2'>
            <EnhancedDropdown
              trigger={
                <div className='cursor-pointer flex justify-center items-center text-black' aria-label='actions'>
                  <HiOutlineDotsVertical className='text-[22px]' />
                </div>
              }
            >
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" aria-label='view'>
                <Link
                  className='flex w-full'
                  href={{
                    pathname: `/dashboard/menu/${menu.itemName}`,
                    query: {
                      itemId: menu.id,
                    },
                  }}
                >
                  <div className='flex gap-2 items-center text-grey500'>
                    <GrFormView className='text-[20px]' />
                    <p>View more</p>
                  </div>
                </Link>
              </div>
            </EnhancedDropdown>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <Filters
        onOpen={onOpen}
        onOpenViewMenu={onOpenViewMenu}
        menus={menus}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    currentMenuItems.length,
    hasSearchFilter,
    value,
  ]);

  return (
    <section>
      <div className="w-full">
        {/* Top Content */}
        <div className="mb-4">
          {topContent}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={headerColumns.length} className="px-4 py-8 text-center text-gray-500">
                    Loading menu items...
                  </td>
                </tr>
              ) : currentMenuItems.length === 0 ? (
                <tr>
                  <td colSpan={headerColumns.length} className="px-4 py-8 text-center text-gray-500">
                    {currentCategoryId ? 'No items found in this category' : 'Select a category to view items'}
                  </td>
                </tr>
              ) : (
                currentMenuItems.map((item, index) => (
                  <tr key={`${item?.id}-${index}` || index} className="border-b border-gray-200 hover:bg-gray-50">
                    {headerColumns.map((column) => (
                      <td 
                        key={column?.uid} 
                        className={`px-4 py-4 ${column?.uid === 'actions' ? 'text-center' : 'text-left'}`}
                      >
                        {renderCell(item, column?.uid as string)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Content */}
        {bottomContent && (
          <div className="mt-4">
            {bottomContent}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuList;