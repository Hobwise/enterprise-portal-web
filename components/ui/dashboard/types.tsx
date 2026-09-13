export type SideNavItem = {
  title: string;
  path: string;
  icon?: any;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
  locked?: boolean;
};

export type SideNavSection = {
  sectionTitle: string;
  collapsible: boolean;
  defaultExpanded?: boolean;
  requiredRole?: number; // 0 = Manager only, undefined = all roles
  requiredCapability?: string; // planCapabilities key, undefined = no capability gate
  items: SideNavItem[];
};
