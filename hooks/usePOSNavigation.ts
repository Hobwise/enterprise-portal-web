import { useState, useEffect, useMemo } from 'react';
import { POSSection } from '@/app/api/controllers/pos';
import { MenuItem } from '@/app/pos/types';

export const usePOSNavigation = (posData: POSSection[]) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("All Menu");

  // Extract categories (sections) from API data for SIDEBAR
  const mainTabs = useMemo(() => {
    if (!posData || posData.length === 0) return [];

    // Get all section names (Canteen, Bar, Kitchen)
    const categories = posData
      .map(section => section.name)
      .filter(name => name && name.trim() !== '');

    return Array.from(new Set(categories)).sort();
  }, [posData]);

  // Extract menus from the selected category for TOP TABS
  const categories = useMemo(() => {
    if (!posData || posData.length === 0) return ['All Menu'];
    if (!selectedCategory) return ['All Menu'];

    const allMenus = new Set<string>();

    // Find the selected category (section) and get its menus
    const selectedSection = posData.find(section => section.name === selectedCategory);

    if (selectedSection && selectedSection.menus && Array.isArray(selectedSection.menus)) {
      selectedSection.menus.forEach((menu) => {
        if (menu.name && menu.name.trim()) {
          allMenus.add(menu.name);
        }
      });
    }

    // Return "All Menu" first, then sorted menu names
    return ['All Menu', ...Array.from(allMenus).sort()];
  }, [posData, selectedCategory]);

  // Get menu items based on selected category and menu
  const menuItems = useMemo((): MenuItem[] => {
    const items: MenuItem[] = [];
    const seenItemIds = new Set<string>();

    if (!selectedCategory || !posData || posData.length === 0) {
      return items;
    }

    // Find the selected category (section)
    const selectedSection = posData.find(section => section.name === selectedCategory);

    if (!selectedSection) {
      return items;
    }

    // Determine which menus to process based on selected menu
    const menusToProcess = selectedMenu === "All Menu"
      ? selectedSection.menus || []
      : (selectedSection.menus || []).filter(menu => menu.name === selectedMenu);

    // Show items from the selected menus
    menusToProcess.forEach((menu) => {
      if (menu.items && Array.isArray(menu.items)) {
        menu.items.forEach((item) => {
          const uniqueKey = `${selectedSection.id}-${menu.id}-${item.id}`;
          if (!seenItemIds.has(uniqueKey)) {
            seenItemIds.add(uniqueKey);
            items.push({
              ...item,
              uniqueKey: uniqueKey,
              menuName: menu.name,
              menuId: menu.id,
              packingCost: menu.packingCost,
              waitingTimeMinutes: menu.waitingTimeMinutes,
              sectionName: selectedSection.name,
              sectionId: selectedSection.id,
              isVatEnabled: selectedSection.isVatEnabled,
              vatRate: selectedSection.vatRate,
            });
          }
        });
      }
    });

    return items;
  }, [posData, selectedCategory, selectedMenu]);

  // Set initial category when mainTabs (categories) are loaded
  useEffect(() => {
    if (mainTabs.length > 0 && !selectedCategory) {
      setSelectedCategory(mainTabs[0]);
    }
  }, [mainTabs, selectedCategory]);

  // Reset to "All Menu" when category changes
  useEffect(() => {
    if (selectedCategory) {
      setSelectedMenu("All Menu");
    }
  }, [selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedMenu,
    setSelectedMenu,
    categories,
    mainTabs,
    menuItems,
  };
};
