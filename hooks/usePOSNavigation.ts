import { useState, useEffect, useMemo } from 'react';
import { POSSection } from '@/app/api/controllers/pos';
import { MenuItem } from '@/app/pos/types';

export const usePOSNavigation = (posData: POSSection[]) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  // Extract main tabs (sections) from API data
  const mainTabs = useMemo(() => {
    if (!posData || posData.length === 0) return ['All'];

    // Get all section names from the API
    const sections = posData
      .map(section => section.name)
      .filter(name => name && name.trim() !== ''); // Filter out empty names

    // Always include "All" as the first option if not already present
    const hasAll = sections.some(s => s.toLowerCase() === 'all');
    return hasAll ? sections : ['All', ...sections];
  }, [posData]);

  // Extract categories from API data - filtered by selected section
  const categories = useMemo(() => {
    if (!posData || posData.length === 0) return [];

    const allCategories = new Set<string>();

    // Determine which sections to process based on selected section
    const sectionsToProcess = selectedSection === "All"
      ? posData
      : posData.filter(section => section.name === selectedSection);

    // Extract unique menu names from all selected sections
    sectionsToProcess.forEach((section) => {
      if (section.menus && Array.isArray(section.menus)) {
        section.menus.forEach((menu) => {
          if (menu.name && menu.name.trim()) {
            allCategories.add(menu.name);
          }
        });
      }
    });

    // Return sorted categories without "All Menu"
    const categoryList = Array.from(allCategories).sort();
    return categoryList;
  }, [posData, selectedSection]);

  // Get menu items based on selected section and category
  const menuItems = useMemo((): MenuItem[] => {
    const items: MenuItem[] = [];
    const seenItemIds = new Set<string>();

    if (!selectedCategory || !posData || posData.length === 0) {
      return items;
    }

    // Determine which sections to process based on selected section
    const sectionsToProcess = selectedSection === "All"
      ? posData
      : posData.filter(section => section.name === selectedSection);

    // Show items from the selected category across all applicable sections
    sectionsToProcess.forEach((section) => {
      if (section.menus && Array.isArray(section.menus)) {
        section.menus.forEach((menu) => {
          if (menu.name === selectedCategory && menu.items && Array.isArray(menu.items)) {
            menu.items.forEach((item) => {
              const uniqueKey = `${section.id}-${menu.id}-${item.id}`;
              if (!seenItemIds.has(uniqueKey)) {
                seenItemIds.add(uniqueKey);
                items.push({
                  ...item,
                  uniqueKey: uniqueKey,
                  menuName: menu.name,
                  menuId: menu.id,
                  packingCost: menu.packingCost,
                  waitingTimeMinutes: menu.waitingTimeMinutes,
                  sectionName: section.name,
                  sectionId: section.id,
                  isVatEnabled: section.isVatEnabled,
                  vatRate: section.vatRate,
                });
              }
            });
          }
        });
      }
    });

    return items;
  }, [posData, selectedSection, selectedCategory]);

  // Set initial category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedSection,
    setSelectedSection,
    categories,
    mainTabs,
    menuItems,
  };
};
