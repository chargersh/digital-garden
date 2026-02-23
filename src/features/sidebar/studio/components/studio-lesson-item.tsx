"use client";

import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import {
  getIndent,
  getMenuItemComponent,
} from "@/features/sidebar/shared/components/lesson-row-utils";
import type { LessonNodeStatus } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { DeleteLessonNodeDialog } from "./delete-lesson-node-dialog";
import { StudioSlideActionsRail } from "./studio-slide-actions-rail";

interface StudioLessonItemProps {
  className?: string;
  depth?: number;
  href: string;
  nodeId: Id<"lessonNodes">;
  nodeKind?: "collapsible" | "lesson";
  status?: LessonNodeStatus;
  title: string;
}

export function StudioLessonItem({
  title,
  href,
  nodeId,
  nodeKind = "lesson",
  status,
  depth = 0,
  className,
}: StudioLessonItemProps) {
  const Item = getMenuItemComponent(depth);
  const pathname = usePathname();
  const isActive = pathname === href;
  let statusBorderClass: string | null = null;
  if (status === "draft") {
    statusBorderClass = "border-yellow-500";
  } else if (status === "archived") {
    statusBorderClass = "border-red-500";
  }

  return (
    <Item
      className="group/lesson-item relative scroll-m-4 overflow-hidden first:scroll-m-20"
      data-title={title}
      id={`node-${nodeId}`}
    >
      <SidebarMenuSubButton
        asChild
        className={cn(
          "h-auto rounded-none px-0 py-0",
          "flex items-center gap-x-3 pr-3 text-left",
          "ml-4 w-[calc(100%-1rem)] border-l py-2 lg:py-1.5",
          statusBorderClass,
          "wrap-break-word hyphens-auto",
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
      <StudioSlideActionsRail scope="lesson-item">
        <DeleteLessonNodeDialog
          nodeId={nodeId}
          nodeKind={nodeKind}
          title={title}
        />
      </StudioSlideActionsRail>
    </Item>
  );
}
