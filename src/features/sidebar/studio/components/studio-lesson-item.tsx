"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import {
  getIndent,
  getMenuItemComponent,
} from "@/features/sidebar/shared/components/lesson-row-utils";
import { getStudioStatusBorderClass } from "@/features/sidebar/shared/sidebar-utils";
import { cn } from "@/lib/utils";

interface StudioLessonItemProps {
  title: string;
  href: string;
  status?: "archived" | "draft" | "published";
  id?: string;
  depth?: number;
  className?: string;
}

export function StudioLessonItem({
  title,
  href,
  status,
  id,
  depth = 0,
  className,
}: StudioLessonItemProps) {
  const Item = getMenuItemComponent(depth);
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Item
      className="scroll-m-4 first:scroll-m-20"
      data-title={title}
      id={id ?? href}
    >
      <SidebarMenuSubButton
        asChild
        className={cn(
          "h-auto rounded-none px-0 py-0",
          "flex items-center gap-x-3 pr-3 text-left",
          "ml-4 w-[calc(100%-1rem)] border-l py-2 lg:py-1.5",
          "wrap-break-word hyphens-auto",
          getStudioStatusBorderClass(status),
          "text-muted-foreground",
          "hover:border-foreground hover:text-foreground",
          "data-active:border-sidebar-primary data-active:text-sidebar-primary",
          "data-active:hover:border-sidebar-primary data-active:hover:text-sidebar-primary",
          "data-active:bg-transparent data-active:hover:bg-transparent",
          "hover:bg-transparent active:bg-transparent",
          className
        )}
        isActive={isActive}
        style={
          {
            paddingLeft: getIndent(depth),
          } as CSSProperties
        }
      >
        <Link href={href}>
          <div className="flex flex-1 items-center space-x-2.5">
            <div>{title}</div>
          </div>
        </Link>
      </SidebarMenuSubButton>
    </Item>
  );
}
