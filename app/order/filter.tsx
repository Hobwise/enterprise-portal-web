'use client';
import { useState } from "react";

const Filters = ({ menus, handleTabClick }: any) => {
  const [selectedCategory, setSelectedCategory] = useState(
    menus?.[0]?.name || ""
  );

  const handleCategoryClick = (menuName: string) => {
    setSelectedCategory(menuName);
    handleTabClick(menuName);
  };

  return (
    <div className="w-full">
      {/* Category Pills */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {menus?.map((menu: any) => {
          const isSelected = selectedCategory === menu.name;

          return (
            <button
              key={menu.name}
              onClick={() => handleCategoryClick(menu.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-primaryColor text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {menu.name}
            </button>
          );
        })}
      </div>

      {/* Scroll indicator dots */}
      <div className="flex justify-center mt-2">
        <div className="flex space-x-1">
          {[...Array(Math.ceil((menus?.length || 0) / 4))].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full ${
                i === 0 ? "bg-gray-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
