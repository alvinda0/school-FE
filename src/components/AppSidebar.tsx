"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getFilteredMenuItems } from "@/constants/menuItems";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/hooks/useTheme";

interface AppSidebarProps {
  activeItem?: string;
}

const AppSidebar = ({ activeItem = "" }: AppSidebarProps) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { data: user } = useAuthMe();
  const { state } = useSidebar();
  const {
    sidebarPrimary,
    sidebarForeground,
    sidebarPrimaryForeground,
    sidebarHeaderPrimary,
    sidebarHeaderForeground,
  } = useTheme();

  const userRole = user?.role_name || "";
  const isInternalUser = user
    ? ["super_admin", "admin", "teacher"].includes(
        user.role_name.toLowerCase()
      )
    : false;

  const filteredMenuItems = isInternalUser
    ? getFilteredMenuItems(userRole, true)
    : getFilteredMenuItems(userRole);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isSubmenuActive = (submenuHref: string) => {
    return pathname.startsWith(submenuHref);
  };

  const shouldMenuBeOpen = (
    menuName: string,
    submenu?: Array<{ href: string }>
  ) => {
    if (openMenus.includes(menuName)) return true;
    if (submenu) {
      return submenu.some((sub) => isSubmenuActive(sub.href));
    }
    return false;
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r"
      collapsible="icon"
      style={
        {
          // Override shadcn CSS variables dengan warna dari theme
          "--sidebar": "#f8f9fa",
          "--sidebar-foreground": sidebarForeground,
          "--sidebar-primary": sidebarPrimary,
          "--sidebar-primary-foreground": sidebarPrimaryForeground,
          // accent = warna active/hover item
          "--sidebar-accent": sidebarPrimary,
          "--sidebar-accent-foreground": sidebarPrimaryForeground,
          "--sidebar-border": "#e2e8f0",
        } as React.CSSProperties
      }
    >
      {/* ── Header (unchanged) ── */}
      <SidebarHeader
        className="border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 px-4 py-4"
        style={{ backgroundColor: sidebarHeaderPrimary }}
      >
        {/* Expanded state */}
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: sidebarHeaderForeground }}
          >
            <span
              className="font-bold text-base"
              style={{ color: sidebarHeaderPrimary }}
            >
              SI
            </span>
          </div>
          <h2
            className="text-lg font-bold"
            style={{ color: sidebarHeaderForeground }}
          >
            SIAKAD
          </h2>
          <div className="ml-auto">
            <SidebarTrigger />
          </div>
        </div>

        {/* Collapsed state */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: sidebarHeaderForeground }}
          >
            <span
              className="font-bold text-sm"
              style={{ color: sidebarHeaderPrimary }}
            >
              SI
            </span>
          </div>
          <SidebarTrigger className="h-6 w-6" />
        </div>
      </SidebarHeader>

      {/* ── Menu ── */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="gap-1">
          {filteredMenuItems.map((item) => {
            const isActive = activeItem === item.name;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isMenuOpen = shouldMenuBeOpen(item.name, item.submenu);
            const isHighlighted = isActive || isMenuOpen;

            return (
              <SidebarMenuItem key={item.name}>
                {hasSubmenu ? (
                  <>
                    <SidebarMenuButton
                      isActive={isHighlighted}
                      onClick={() => toggleMenu(item.name)}
                      className="h-auto px-4 py-3 rounded-2xl text-[15px] font-bold gap-3 [&>svg]:size-5"
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <item.icon />
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        className={`!size-4 transition-transform duration-200 ${
                          isMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </SidebarMenuButton>

                    {isMenuOpen && (
                      <SidebarMenuSub
                        className="mt-0.5 ml-4 pl-3 border-l-2 space-y-0.5"
                        style={{ borderColor: `${sidebarPrimary}40` }}
                      >
                        {item.submenu?.map((subItem) => {
                          const isSubActive = isSubmenuActive(subItem.href);

                          return (
                            <SidebarMenuSubItem key={subItem.name}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className="h-auto px-3 py-2.5 rounded-xl text-[14px] font-semibold gap-3 [&>svg]:size-4"
                              >
                                <Link href={subItem.href}>
                                  <subItem.icon />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="h-auto px-4 py-3 rounded-2xl text-[15px] font-bold gap-3 [&>svg]:size-5"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
