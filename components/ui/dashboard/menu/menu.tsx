'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/navigation';

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
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';

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
  
  const colorClass = color ? colorClasses[color] : '';
  
  return (
    <div className={`${baseClasses} ${sizeClasses} ${colorClass} ${className || ''}`}>
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
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
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
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  const variantClasses = {
    faded: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    flat: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  };
  
  const finalClasses = `
    ${baseClasses}
    ${isIconOnly ? 'p-2' : ''}
    ${size ? sizeClasses[size] : sizeClasses.md}
    ${variant ? variantClasses[variant] : 'bg-blue-500 text-white hover:bg-blue-600'}
    ${className || ''}
  `.trim();

  return (
    <button
      onClick={onClick}
      className={finalClasses}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

const MenuList: React.FC<MenuListProps> = ({ menus, onOpen, onOpenViewMenu, searchQuery }) => {
  const [filteredMenu, setFilteredMenu] = React.useState<MenuItem[]>([]);
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
  
  const queryClient = useQueryClient();
  const router = useRouter();

  // Initialize with first menu
  useEffect(() => {
    if (menus && menus.length > 0 && !menuIdTable) {
      const firstMenu = menus[0];
      setMenuIdTable(firstMenu.id);
    }
  }, [menus, menuIdTable, setMenuIdTable]);

  // Get current category data
  const currentCategory = menus?.find(category => category.id === menuIdTable) || menus?.[0];
  const currentMenuItems = currentCategory?.items || [];
    
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
  } = usePagination(currentCategory, columns, INITIAL_VISIBLE_COLUMNS);

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
    setMenuIdTable(categoryId);
    setValue(categoryName);
    
    // Invalidate queries to trigger fresh data fetch for tab switching
    queryClient.invalidateQueries(['menuItems', categoryId]);
  };

  // Function to refresh current category data
  const refreshCurrentCategory = () => {
    if (menuIdTable) {
      queryClient.invalidateQueries(['menuItems', menuIdTable]);
    }
  };

  const renderCell = React.useCallback((menu: MenuItem, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className='flex'>
            <div className='h-[60px] w-[60px] flex-shrink-0'>
              <Image
                className='bg-cover h-[60px] w-[60px] rounded-lg object-cover'
                width={60}
                height={60}
                alt={`${menu.itemName || 'menu'} image`}
                src={menu.image ? `data:image/jpeg;base64,${menu.image}` : noImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = noImage;
                }}
              />
            </div>

            <div className='ml-5 gap-1 grid place-content-center'>
              <p className='text-sm capitalize text-gray-600'>{menu.menuName}</p>
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
          <div className='text-sm flex font-medium'>
            <p>{formatPrice(menu.price)}</p>
          </div>
        );
      case 'desc':
        return (
          <div className='text-sm m-0 max-w-[360px] line-clamp-3'>
            {menu.itemDescription || 'No description available'}
          </div>
        );
      case 'actions':
        return (
          <div className='relative flex justify-center items-center gap-2'>
            {/* <EnhancedDropdown
              trigger={
                <div className='cursor-pointer flex justify-center items-center text-black p-2 hover:bg-gray-100 rounded-full transition-colors' aria-label='actions'>
                  <HiOutlineDotsVertical className='text-[22px]' />
                </div>
              }
            >
            </EnhancedDropdown> */}
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" aria-label='view'>
                <Link
                  className='flex w-full'
                  href={{
                    pathname: `/dashboard/menu/${encodeURIComponent(menu.itemName)}`,
                    query: {
                      itemId: menu.id,
                    },
                  }}
                >
                  <div className='flex gap-2 items-center text-gray-600'>
                    <GrFormView className='text-[20px]' />
                    <p>View more</p>
                  </div>
                </Link>
              </div>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="space-y-4">
        <Filters
          onOpen={onOpen}
          onOpenViewMenu={onOpenViewMenu}
          menus={menus}
          handleTabChange={handleTabChange}
          value={value}
          handleTabClick={handleTabClick}
        />
      </div>
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
    menus,
    onOpen,
    onOpenViewMenu,
  ]);

  // Show loading only when there are no items available yet
  const shouldShowLoading = !currentMenuItems || currentMenuItems.length === 0;

  // Helper to check if click is inside actions column
  const isClickInsideActions = (event: React.MouseEvent) => {
    let node = event.target as HTMLElement | null;
    while (node) {
      if (node.getAttribute && node.getAttribute('aria-label') === 'actions') {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  };

  return (
    <section>
      <div className="w-full">
        {/* Top Content */}
        <div className="mb-6">
          {topContent}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
       
            <tbody className="divide-y divide-gray-200">
              {shouldShowLoading ? (
                <tr>
                  <td colSpan={headerColumns.length} className="px-4 py-12">
                    <SpinnerLoader size="md" />
                  </td>
                </tr>
              ) : currentMenuItems.length === 0 ? (
                <tr>
                  <td colSpan={headerColumns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3 text-gray-500">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div className="text-sm">
                        {searchQuery ? 'No items match your search' : menuIdTable ? 'No items found in this category' : 'Select a category to view items'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentMenuItems.map((item, index) => (
                  <tr
                    key={`${item?.id}-${index}` || index}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={e => {
                      if (!isClickInsideActions(e)) {
                        router.push(`/dashboard/menu/${encodeURIComponent(item.itemName)}?itemId=${item.id}`);
                      }
                    }}
                  >
                    {headerColumns.map((column) => (
                      <td 
                        key={column?.uid} 
                        className={`px-6 py-4 whitespace-nowrap ${column?.uid === 'actions' ? 'text-center' : 'text-left'} ${
                          column?.uid === 'desc' ? 'whitespace-normal' : ''
                        }`}
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
        {bottomContent && !shouldShowLoading && currentMenuItems.length > 0 && (
          <div className="mt-6">
            {bottomContent}
          </div>
        )}
      </div>

      {/* CSS for line clamping */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default MenuList;