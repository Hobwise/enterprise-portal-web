export type SideNavItem = {
  title: string;
  path: string;
  icon?: any;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type SideNavSection = {
  sectionTitle: string;
  collapsible: boolean;
  defaultExpanded?: boolean;
  requiredRole?: number; // 0 = Manager only, undefined = all roles
  items: SideNavItem[];
};
