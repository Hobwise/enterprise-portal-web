"use client";
import { CustomButton } from "@/components/customButton";
import { cn, removeCookie } from "@/lib/utils";
import Hobwise from "@/public/assets/images/hobwise.png";
import { CloseIcon, FlashIcon, HamburgerIcon } from "@/public/assets/svg";
import {
  CONTACT_URL,
  HOME_URL,
  LOGIN_URL,
  PRICING_URL,
  RESERVATIONS_URL,
  SIGN_UP_URL,
} from "@/utilities/routes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { socialMedia } from "./footer";
import { Transition } from "./transition";
import LogoutModal from "../logoutModal";
import { FiLogOut } from "react-icons/fi";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { IoIosArrowDown } from "react-icons/io";
import { Skeleton } from "./skeleton-loading";
import { useQueryClient } from "react-query";
import { MdOutlinePerson } from "react-icons/md";

export const navItem = [
  { title: "Home", href: HOME_URL },
  { title: "Pricing", href: PRICING_URL },
  // { title: 'Businesses', href: BUSINESS_URL },
  { title: "Reservations", href: RESERVATIONS_URL },
  { title: "Contact", href: CONTACT_URL },
];

interface INavbar {
  type?: "colored" | "non-colored" | "default";
  className?: string;
}

export default function Navbar({ type = "non-colored", className }: INavbar) {
  const queryClient = useQueryClient();
  const [userInfo, setUserInfo] = useState<{
    firstName: string;
    lastName: string;
    image: string;
    role: number;
  } | null>(null);
  const [openNav, setOpenNav] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const userInformation =
    typeof window !== "undefined" && localStorage.getItem("userInformation");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (userInformation) {
      const user = JSON.parse(userInformation);
      if (user) {
        setUserInfo(user);
      }
    }
    setLoading(false);
  }, [userInformation]);

  const externalLogout = () => {
    queryClient.clear();
    localStorage.clear();
    setUserInfo(null);
    removeCookie("token");
    removeCookie("planCapabilities");
    removeCookie("username");
    removeCookie("jwt");
    setOpenModal(false);
  };

  const btnClassName = `before:ease relative h-[40px] overflow-hidden ${
    type === "default" || (type === "colored" && "border border-[#FFFFFF26]")
  } px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40`;

  return (
    <div className={cn(openNav && "w-full bg-white h-screen relative")}>
      <div
        className={cn(
          "flex items-center font-satoshi w-full z-[999] justify-between px-6 lg:px-12 py-2.5",
          className
        )}
      >
        <Link href={HOME_URL}>
          <Image
            src={Hobwise}
            alt="Hobwise logo"
            width={type === "default" ? 150 : 240}
          />
        </Link>
        <nav
          className={cn(
            "lg:flex py-4 space-x-6 text-sm text-white hidden",
            type === "colored" && "text-[#C0AFF7]",
            type === "default" && "text-[#616B7C]"
          )}
        >
          {navItem.map((each) => {
            const linkStyle = `px-4 ${
              pathname.slice(1).startsWith(each.href) ||
              (each.href === "/" && pathname === each.href)
                ? `border-b-1 font-semibold pb-1.5 ${
                    type === "colored"
                      ? "border-b-[#9A7DFA] text-white"
                      : "border-b-primaryColor text-primaryColor"
                  }`
                : type === "colored"
                ? "nav_link_colored"
                : "nav_link"
            }`;

            return (
              <Link
                href={`/${each.href}`}
                key={each.title}
                className={cn("px-4 cursor-pointer", linkStyle)}
              >
                {each.title}
              </Link>
            );
          })}
        </nav>

        {loading ? (
          <div></div>
        ) : (
          <React.Fragment>
            {!userInfo ? (
              <div className="flex space-x-4 items-center">
                <Link
                  href={LOGIN_URL}
                  className="hidden lg:flex"
                  target="_blank"
                >
                  <CustomButton
                    className={cn(
                      "bg-white text-primaryColor h-[38px] lg:px-8",
                      type === "default" && "border border-primaryColor"
                    )}
                  >
                    Login
                  </CustomButton>
                </Link>
                <Link href={SIGN_UP_URL} target="_blank">
                  <CustomButton className={btnClassName}>
                    Get Started
                  </CustomButton>
                </Link>

                <div
                  className="flex lg:hidden z-50"
                  onClick={() => setOpenNav((prev) => !prev)}
                >
                  {openNav ? (
                    <CloseIcon />
                  ) : (
                    <HamburgerIcon
                      className={cn(
                        type === "default" ? "text-[#1A198C]" : "text-white"
                      )}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  {userInfo ? (
                    <div className="flex items-center py-2 px-4 rounded-full border border-gray-300 gap-2 cursor-pointer">
                      <div className="flex flex-col leading-4 text-[#000]">
                        <span className="text-xs font-bold">
                          {userInfo?.firstName} {userInfo?.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {userInfo?.role === 0 ? "Manager" : "Staff"}
                        </span>
                      </div>
                      <Avatar
                        size="sm"
                        src={
                          userInfo?.image &&
                          `data:image/jpeg;base64,${userInfo?.image}`
                        }
                      />
                      <IoIosArrowDown className="text-[#000]" />
                    </div>
                  ) : (
                    <div className=" flex items-center gap-2 border border-gray-200 rounded-full py-1 px-2">
                      <div className="w-full flex flex-col gap-1">
                        <Skeleton className="h-2 w-16 rounded-lg" />
                        <Skeleton className="h-2 w-16 rounded-lg" />
                      </div>
                      <div>
                        <Skeleton className="flex rounded-full w-8 h-8" />
                      </div>
                    </div>
                  )}
                </DropdownTrigger>
                <DropdownMenu aria-label="settings Actions" variant="flat">
                  <DropdownItem key="Profile Management">
                    <Link
                      prefetch={true}
                      href={"/dashboard/settings/personal-information"}
                      className="flex cursor-pointer text-[#475367] transition-all hover:rounded-md px-2 py-2 items-center gap-2"
                    >
                      <MdOutlinePerson className="text-[22px]" />
                      <span className="  text-sm font-md">
                        Profile Management
                      </span>
                    </Link>
                  </DropdownItem>
                  <DropdownItem key="logout">
                    <div
                      onClick={() => setOpenModal(true)}
                      className="flex cursor-pointer text-danger-500 transition-all hover:rounded-md px-2 py-2 items-center gap-2"
                    >
                      <FiLogOut className="text-[20px]" />
                      <span className="  text-sm font-md"> Log out</span>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </React.Fragment>
        )}
      </div>

      {openNav && (
        <div className="my-6 px-6 space-y-6 lg:hidden nav-bar-bg">
          <Transition>
            <div className="flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-2.5 py-1.5 rounded-full text-xs shadow_custom-inset">
              <FlashIcon />
              <p className="font-normal">Menu</p>
            </div>
          </Transition>

          <nav
            className={cn(
              "block text-left text-[32px] space-y-4 text-[#616B7C] font-bricolage_grotesque z-[999]"
            )}
          >
            <ul className="space-y-4">
              {navItem.map((each) => {
                const isActive =
                  pathname.slice(1).startsWith(each.href) ||
                  (each.href === "/" && pathname === each.href);

                return (
                  <Transition key={each.title}>
                    <Link
                      href={`/${each.href}`}
                      className={cn(
                        "cursor-pointer w-full",
                        isActive && "text-primaryColor"
                      )}
                    >
                      <li>
                        {each.title}
                        {isActive && (
                          <div className="border border-primaryColor w-full" />
                        )}
                      </li>
                    </Link>
                  </Transition>
                );
              })}
            </ul>
          </nav>

          <Transition>
            <div className="text-left px-2 space-y-4">
              <div className="">
                <p className="text-[#16161866] font-light">Get in touch</p>
                <a
                  href="mailto: hello@hobwise.com"
                  target="_blank"
                  className="text-primaryColor underline"
                >
                  hello@hobwise.com
                </a>
              </div>

              <div className="flex space-x-4">
                {socialMedia.map((each) => (
                  <Link href={each.url} target="_blank">
                    <div key={each.url}>{each.icon}</div>
                  </Link>
                ))}
              </div>
            </div>
          </Transition>
        </div>
      )}

      <LogoutModal
        onOpenChange={setOpenModal}
        isOpen={openModal}
        externalLogout={externalLogout}
      />
    </div>
  );
}
