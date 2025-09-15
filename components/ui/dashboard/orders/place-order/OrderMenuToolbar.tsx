import { ChevronRight, ChevronLeft } from "lucide-react";
import { Tooltip } from "@nextui-org/react";
import { useRef, useState, useEffect } from "react";

interface OrderMenuToolbarProps {
  menuSections: any[];
  activeSubCategory: string;
  handleMenuSectionSelect: (sectionId: string) => void;
}

const OrderMenuToolbar = ({
  menuSections,
  activeSubCategory,
  handleMenuSectionSelect,
}: OrderMenuToolbarProps) => {
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
    window.addEventListener("resize", checkScrollButtons);
    return () => {
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [menuSections]);

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: -150,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: 150,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleTabsScroll = () => {
    checkScrollButtons();
  };

  return (
    <div className="flex items-center my-3 py-3 gap-6">
      {/* Fixed left scroll button */}
      {showLeft && (
        <div className="flex-shrink-0">
          <button
            onClick={scrollLeft}
            className={`text-gray-700 p-2 hover:bg-[#EAE5FF] rounded-lg transition-all duration-200 ${
              showLeft
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Scrollable menu sections container */}
      <div
        ref={tabsRef}
        className="flex-1 overflow-x-auto w-80 scrollbar-hide scroll-smooth"
        onScroll={handleTabsScroll}
      >
        <div className="flex gap-6 w-full">
          {menuSections.map((section) => (
            <Tooltip
              className="text-gray-500"
              key={section.id}
              content={section.name}
              delay={500}
              closeDelay={0}
            >
              <button
                onClick={() => handleMenuSectionSelect(section.id)}
                className={`flex-shrink-0 px-4 py-2 bg-[#EAE5FF] w-28 rounded-lg transition-colors whitespace-nowrap font-satoshi text-base ${
                  activeSubCategory === section.id
                    ? "bg-primaryColor text-white"
                    : "text-[#596375] hover:bg-[#EAE5FF]"
                }`}
              >
                {section.name.length > 5
                  ? `${section.name.slice(0, 5)}...`
                  : section.name}{" "}
                {section.totalCount > 0 && `(${section.totalCount})`}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Fixed right scroll button */}

      <div className="flex-shrink-0">
        <button
          onClick={scrollRight}
          className={`text-gray-700 p-2 hover:bg-[#EAE5FF] rounded-lg transition-all duration-200 ${
            showRight
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OrderMenuToolbar;
