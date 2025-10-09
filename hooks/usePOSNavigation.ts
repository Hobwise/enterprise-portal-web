import { useState, useEffect, useMemo } from 'react';
import { POSSection } from '@/app/api/controllers/pos';
import { MenuItem } from '@/app/pos/types';

export const usePOSNavigation = (posData: POSSection[]) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  // Extract main tabs (sections) from API data
  const mainTabs = useMemo(() => {
    return posData.map(section => section.name);
  }, [posData]);

  // Extract categories from API data - filtered by selected section
  const categories = useMemo(() => {
    const allCategories = new Set<string>();

    const sectionsToProcess = selectedSection === "All"
      ? posData
      : posData.filter(section => section.name === selectedSection);

    sectionsToProcess.forEach((section) => {
      section.menus.forEach((menu) => {
        if (menu.name && menu.name.trim()) {
          allCategories.add(menu.name);
        }
      });
    });

    // Add "All Menu" as the first option
    return ["All Menu", ...Array.from(allCategories)];
  }, [posData, selectedSection]);

  // Get menu items based on selected section and category
  const menuItems = useMemo((): MenuItem[] => {
    const items: MenuItem[] = [];
    const seenItemIds = new Set<string>();

    if (!selectedCategory) {
      return items;
    }

    // If "All Menu" is selected, show all items from all categories
    if (selectedCategory === "All Menu") {
      const sectionsToProcess = selectedSection === "All"
        ? posData
        : posData.filter(section => section.name === selectedSection);

      sectionsToProcess.forEach((section) => {
        section.menus.forEach((menu) => {
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
              });
            }
          });
        });
      });

      return items;
    }

    let foundMenu = false;

    for (const section of posData) {
      if (foundMenu) break;

      for (const menu of section.menus) {
        if (menu.name === selectedCategory) {
          if (selectedSection === "All" || section.name === selectedSection) {
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
                });
              }
            });
            foundMenu = true;
            break;
          }
        }
      }
    }

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
