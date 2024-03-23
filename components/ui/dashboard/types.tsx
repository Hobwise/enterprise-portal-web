export type SideNavItem = {
  title: string;
  path: string;
  icon?: any;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};
