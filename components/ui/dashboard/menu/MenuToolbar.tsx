import { Plus, ChevronRight, ChevronLeft, Edit } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';
import { useRef, useState, useEffect } from 'react';

interface MenuToolbarProps {
  onOpen: () => void;
  menuSections: any[];
  activeSubCategory: string;
  handleMenuSectionSelect: (sectionId: string) => void;
  setViewMenuMode: (mode: 'all' | 'current') => void;
  setIsOpenViewMenu: (isOpen: boolean) => void;
}

const MenuToolbar = ({
  onOpen,
  menuSections,
  activeSubCategory,
  handleMenuSectionSelect,
  setViewMenuMode,
  setIsOpenViewMenu,
}: MenuToolbarProps) => {
  const tabsRef = useRef<HTMLDivElement>(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScrollButtons = () => {
    const el = tabsRef.current;
    if (el) {
      setShowLeft(el.scrollLeft > 0);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    // Listen for resize in case of responsive layout
    window.addEventListener('resize', checkScrollButtons);
    return () => {
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [menuSections]);

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: -150,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: 150,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleTabsScroll = () => {
    checkScrollButtons();
  };

  return (
    <div className="flex items-center my-3 py-3 gap-6">
      {/* Fixed left button */}
      <div className="flex-shrink-0 flex gap-2">

      <button
        onClick={onOpen}
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-[#5F35D2] text-[#5F35D2] rounded-lg hover:bg-[#EAE5FF] font-satoshi text-base transition-all duration-200"
      >
        <span>Create new menu</span>
        <Plus className="w-4 h-4" />
      </button>

           <button 
          onClick={scrollLeft}
          className={`text-gray-700 p-2 hover:bg-[#EAE5FF] rounded-lg transition-all duration-200 ${
            showLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable menu sections container */}
      <div 
        ref={tabsRef}
        className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
        onScroll={handleTabsScroll}
      >
        <div className="flex gap-6 w-full">
          {menuSections.map((section) => (
            <Tooltip
            className='text-gray-500'
              key={section.id}
              content={section.name}
              delay={500}
              closeDelay={0}
            >
              <button
                onClick={() => handleMenuSectionSelect(section.id)}
                className={`flex-shrink-0 px-4 py-2 bg-[#EAE5FF] w-28 rounded-lg transition-colors whitespace-nowrap font-satoshi text-base ${
                  activeSubCategory === section.id
                    ? 'bg-primaryColor text-white'
                    : 'text-[#596375] hover:bg-[#EAE5FF]'
                }`}
              >
                {section.name.length > 5 ? `${section.name.slice(0, 5)}...` : section.name} {section.totalCount > 0 && `(${section.totalCount})`}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Fixed right buttons */}
      <div className="flex-shrink-0 flex gap-2">
        {/* Left scroll arrow - only shows when can scroll left */}
    
        
        {/* Right scroll arrow - only shows when can scroll right */}
        <button 
          onClick={scrollRight}
          className={`text-gray-700 p-2 hover:bg-[#EAE5FF] rounded-lg transition-all duration-200 ${
            showRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => {
            setViewMenuMode('all');
            setIsOpenViewMenu(true);
          }}
          className="p-2 text-gray-600 hover:bg-[#EAE5FF] rounded-lg transition-all duration-200"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MenuToolbar;