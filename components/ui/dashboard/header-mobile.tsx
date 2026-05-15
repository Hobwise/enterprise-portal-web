'use client';

import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isPOSUser as checkIsPOSUser, isCategoryUser as checkIsCategoryUser } from '@/lib/userTypeUtils';
import { useDisclosure } from '@nextui-org/react';
import { motion, useCycle } from 'framer-motion';
import { FiLock, FiLogOut } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useSubscriptionContext } from '@/hooks/providers/SubscriptionProvider';
import { routePermissions } from '@/lib/routePermissions';
import LogoutModal from '../logoutModal';
import { SIDENAV_ITEMS, SIDENAV_CONFIG } from './constants';
import { SideNavItem, SideNavSection } from './types';

type MenuItemWithSubMenuProps = {
  item: SideNavItem;
  toggleOpen: () => void;
};

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0)`,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(0px at 100% 0)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

const HeaderMobile = () => {
  const { isOpen, onOpenChange } = useDisclosure();
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const pathname = usePathname();
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);
  const [isOpenClass, toggleOpen] = useCycle(false, true);

  // Hide mobile menu for POS users and Category users only
  const isPOSUser = checkIsPOSUser(userInformation);
  const isCategoryUser = checkIsCategoryUser(userInformation);

  // Get user role (0 = Manager, 1 = Staff)
  const userRole = userInformation?.role;

  const { userRolePermissions } = usePermission();
  const { planCapabilities } = useSubscriptionContext();

  const isPlanLockedPath = useCallback(
    (path: string): boolean => {
      let match: { key: string; capability: string } | null = null;
      for (const [route, capability] of Object.entries(routePermissions)) {
        if (path === route || path.startsWith(route + '/')) {
          if (!match || route.length > match.key.length) {
            match = { key: route, capability };
          }
        }
      }
      if (!match) return false;
      return !planCapabilities[match.capability];
    },
    [planCapabilities]
  );

  const decorateItemsForSection = useCallback(
    (items: SideNavItem[], section: SideNavSection): SideNavItem[] => {
      const sectionLockedByRole =
        section.requiredRole !== undefined && userRole !== section.requiredRole;
      const sectionLockedByPlan = Boolean(
        section.requiredCapability && !planCapabilities[section.requiredCapability]
      );
      const sectionLocked = sectionLockedByRole || sectionLockedByPlan;

      const rbacMap: Record<string, boolean | undefined> = {
        Menu: userRolePermissions?.canViewMenu,
        Campaigns: userRolePermissions?.canViewCampaign,
        Reservation: userRolePermissions?.canViewReservation,
        Payments: userRolePermissions?.canViewPayment,
        Orders: userRolePermissions?.canViewOrder,
        Reports: userRolePermissions?.canViewReport,
        Bookings: userRolePermissions?.canViewBooking,
        Dashboard: userRolePermissions?.canViewDashboard,
        'Quick Response': userRolePermissions?.canViewQR,
      };

      return items.map((item) => {
        const rbacLocked = userRole === 1 && rbacMap[item.title] === false;
        const planLocked = isPlanLockedPath(item.path);
        return {
          ...item,
          locked: sectionLocked || rbacLocked || planLocked,
        };
      });
    },
    [userRole, userRolePermissions, planCapabilities, isPlanLockedPath]
  );

  // Show every section, decorate items as locked when restricted
  const filteredSections = useMemo(() => {
    return SIDENAV_CONFIG.map((section) => ({
      ...section,
      items: decorateItemsForSection(section.items, section),
    }));
  }, [decorateItemsForSection]);

  // Accordion state — only one section open at a time
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mobile-sidebar-accordion-expanded');
    }
    return null;
  });

  // Initialize expanded section when filteredSections first loads
  useEffect(() => {
    if (filteredSections.length === 0) return;
    if (expandedSection && filteredSections.some(s => s.sectionTitle === expandedSection)) return;

    const activeSection = filteredSections.find(s =>
      s.items.some(item => pathname === item.path || pathname.startsWith(item.path + '/'))
    );
    const title = activeSection?.sectionTitle ?? filteredSections[0].sectionTitle;
    setExpandedSection(title);
    localStorage.setItem('mobile-sidebar-accordion-expanded', title);
  }, [filteredSections]);


  const handleSectionToggle = useCallback((title: string) => {
    if (title === expandedSection) return;
    setExpandedSection(title);
    localStorage.setItem('mobile-sidebar-accordion-expanded', title);
  }, [expandedSection]);

  if (isPOSUser || isCategoryUser) {
    return null;
  }

  return (
    <motion.nav
      initial={false}
      animate={isOpenClass ? 'open' : 'closed'}
      custom={height}
      className={`fixed inset-0 z-50 w-full md:hidden ${
        isOpenClass ? '' : 'pointer-events-none'
      }`}
      ref={containerRef}
    >
      <motion.div
        className='absolute inset-0 right-0 w-full bg-black'
        variants={sidebar}
      />
      <motion.ul
        variants={variants}
        className='absolute grid w-full gap-3 px-10 py-16 max-h-screen overflow-y-auto'
      >
        {filteredSections.map((section, sectionIdx) => (
          <MobileSectionGroup
            key={section.sectionTitle}
            section={section}
            pathname={pathname}
            toggleOpen={toggleOpen}
            isLastSection={sectionIdx === filteredSections.length - 1}
            isExpanded={expandedSection === section.sectionTitle}
            onToggle={handleSectionToggle}
          />
        ))}
      </motion.ul>
      <MenuToggle toggle={toggleOpen} />
      <div
        onClick={onOpenChange}
        className={`cursor-pointer  gap-3 text-xl font-bold text-danger-500 ${
          isOpenClass ? 'flex ' : 'hidden'
        } items-center absolute bottom-[30px] left-[40px]`}
      >
        <span>Logout</span>
        <FiLogOut />
      </div>
      <LogoutModal onOpenChange={onOpenChange} isOpen={isOpen} />
    </motion.nav>
  );
};

export default HeaderMobile;

const MenuToggle = ({ toggle }: { toggle: any }) => (
  <button
    onClick={toggle}
    className='pointer-events-auto absolute left-4  top-[14px] z-30'
  >
    <svg width='23' height='23' viewBox='0 0 23 23'>
      <Path
        variants={{
          closed: { d: 'M 2 2.5 L 20 2.5' },
          open: { d: 'M 3 16.5 L 17 2.5' },
        }}
      />
      <Path
        d='M 2 9.423 L 20 9.423'
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: 'M 2 16.346 L 20 16.346' },
          open: { d: 'M 3 2.5 L 17 16.346' },
        }}
      />
    </svg>
  </button>
);

const Path = (props: any) => (
  <motion.path
    fill='transparent'
    strokeWidth='2'
    stroke='hsl(0, 0%, 18%)'
    strokeLinecap='round'
    {...props}
  />
);

const MenuItem = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <motion.li variants={MenuItemVariants} className={className}>
      {children}
    </motion.li>
  );
};

const MenuItemWithSubMenu: React.FC<MenuItemWithSubMenuProps> = ({
  item,
  toggleOpen,
}) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  return (
    <>
      <MenuItem>
        <button
          className='flex w-full text-2xl'
          onClick={() => setSubMenuOpen(!subMenuOpen)}
        >
          <div className='flex flex-row justify-between w-full items-center'>
            <span
              className={`${pathname.includes(item.path) ? 'font-bold' : ''}`}
            >
              {item.title}
            </span>
            <div className={`${subMenuOpen && 'rotate-180'}`}>
              {/* <Icon icon='lucide:chevron-down' width='24' height='24' /> */}
            </div>
          </div>
        </button>
      </MenuItem>
      <div className='mt-2 ml-2 flex flex-col space-y-2'>
        {subMenuOpen && (
          <>
            {item.subMenuItems?.map((subItem, subIdx) => {
              return (
                <MenuItem key={subIdx}>
                  <Link
                    prefetch={true}
                    href={subItem.path}
                    onClick={() => toggleOpen()}
                    className={` ${
                      subItem.path === pathname ? 'font-bold' : ''
                    }`}
                  >
                    {subItem.title}
                  </Link>
                </MenuItem>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

// Mobile Section Group Component for collapsible sections (accordion-controlled)
const MobileSectionGroup = ({
  section,
  pathname,
  toggleOpen,
  isLastSection,
  isExpanded,
  onToggle,
}: {
  section: SideNavSection;
  pathname: string;
  toggleOpen: () => void;
  isLastSection: boolean;
  isExpanded: boolean;
  onToggle: (title: string) => void;
}) => {
  return (
    <div className="mb-4">
      {/* Section Header */}
      <MenuItem>
        <button
          onClick={section.collapsible ? () => onToggle(section.sectionTitle) : undefined}
          className={`flex items-center justify-between w-full text-sm font-semibold uppercase tracking-wider text-gray-400 ${
            section.collapsible ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <span>{section.sectionTitle}</span>
          {section.collapsible && (
            <IoIosArrowDown
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>
      </MenuItem>

      {/* Section Items — always visible when non-collapsible */}
      {(isExpanded || !section.collapsible) && (
        <div className="mt-2 space-y-2">
          {section.items.map((item, idx) => {
            const isLastItem = idx === section.items.length - 1;

            return (
              <div key={idx}>
                {item.submenu ? (
                  <MenuItemWithSubMenu item={item} toggleOpen={toggleOpen} />
                ) : (
                  <MenuItem>
                    <Link
                      prefetch={true}
                      href={item.locked ? '/dashboard/unauthorized' : item?.path}
                      onClick={() => toggleOpen()}
                      aria-disabled={item.locked ? true : undefined}
                      className={`flex w-full items-center justify-between text-white text-xl ${
                        item?.path === pathname ? 'font-bold' : ''
                      } ${item.locked ? 'opacity-60' : ''}`}
                    >
                      <span>{item?.title}</span>
                      {item.locked ? (
                        <FiLock
                          aria-label="No access"
                          className="text-[18px] text-gray-400"
                        />
                      ) : null}
                    </Link>
                  </MenuItem>
                )}

                {!isLastItem && (
                  <MenuItem className='my-3 h-px w-full bg-gray-600' />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Divider */}
      {!isLastSection && (
        <MenuItem className='my-4 h-px w-full bg-gray-300' />
      )}
    </div>
  );
};

const MenuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
      duration: 0.02,
    },
  },
};

const variants = {
  open: {
    transition: { staggerChildren: 0.02, delayChildren: 0.15 },
  },
  closed: {
    transition: { staggerChildren: 0.01, staggerDirection: -1 },
  },
};

const useDimensions = (ref: any) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};
