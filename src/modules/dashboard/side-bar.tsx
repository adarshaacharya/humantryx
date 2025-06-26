"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAbility } from "@/providers/ability-context";
import { getMenuItems } from "./consts/sidebar-items";
import { Logo } from "@/components/logo";

export function DashboardSideBar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const ability = useAbility();
  const MENU_ITEMS = getMenuItems(ability);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const isActive = (href: string, isSubmenuItem = false) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    if (isSubmenuItem) {
      return pathname === href;
    }

    if (pathname.startsWith(href)) {
      const parentMenuItem = MENU_ITEMS.find((item) => item.href === href);
      if (parentMenuItem?.submenu) {
        const exactSubmenuMatch = parentMenuItem.submenu.some(
          (subItem) => pathname === subItem.href,
        );
        return !exactSubmenuMatch;
      }
      return true;
    }

    return false;
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-between p-4 border-b">
        <Logo className="h-8 w-8" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {MENU_ITEMS.map((item) => {
              if (!item.enabled) return null;

              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isItemOpen = openItems.includes(item.title);

              if (hasSubmenu) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <Collapsible
                      open={isItemOpen}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between",
                            isActive(item.href) && "bg-primary/10 text-primary",
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isItemOpen && "rotate-180",
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu?.map((subItem) => {
                            if (!subItem.enabled) return null;
                            return (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn(
                                    isActive(subItem.href, true) &&
                                      "bg-primary/10 text-primary font-medium",
                                  )}
                                >
                                  <Link href={subItem.href}>
                                    {subItem.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      isActive(item.href) && "bg-primary/10 text-primary",
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          <div className="from-primary/10 to-secondary/10 rounded-lg bg-gradient-to-r p-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-primary h-5 w-5" />
              <div>
                <p className="text-foreground text-sm font-medium">
                  AI Powered
                </p>
                <p className="text-muted-foreground text-xs">
                  Enhanced HR management
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
