"use client";

import type { Id } from "@convex/_generated/dataModel";
import { GripVerticalIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import { SortableItemHandle } from "@/components/ui/sortable";
import {
  getIndent,
  getMenuItemComponent,
} from "@/features/sidebar/shared/components/lesson-row-utils";
import type { LessonNodeStatus } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { DeleteLessonNodeDialog } from "./delete-lesson-node-dialog";
import { StudioSlideActionsRail } from "./studio-slide-actions-rail";

interface StudioLessonItemCustomProps {
  actionsDisabled?: boolean;
  depth?: number;
  href: string;
  nodeId: Id<"lessonNodes">;
  nodeKind?: "collapsible" | "lesson";
  status?: LessonNodeStatus;
  title: string;
}

type StudioLessonItemElementProps = Omit<ComponentProps<"li">, "title">;

type StudioLessonItemProps = StudioLessonItemCustomProps &
  StudioLessonItemElementProps;

export function StudioLessonItem({
  title,
  href,
  nodeId,
  nodeKind = "lesson",
  status,
  actionsDisabled = false,
  depth = 0,
  className,
  id,
  ...itemProps
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
      className={cn(
        "group/lesson-item relative scroll-m-4 overflow-hidden first:scroll-m-20",
        className
      )}
      data-title={title}
      id={id ?? `node-${nodeId}`}
      {...itemProps}
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
          "hover:bg-transparent active:bg-transparent"
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
      <StudioSlideActionsRail disabled={actionsDisabled} scope="lesson-item">
        <DeleteLessonNodeDialog
          nodeId={nodeId}
          nodeKind={nodeKind}
          title={title}
        />
        <SortableItemHandle asChild>
          <Button
            aria-label={`Reorder ${title}`}
            onPointerUp={(event) => {
              event.currentTarget.blur();
            }}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <GripVerticalIcon aria-hidden="true" />
          </Button>
        </SortableItemHandle>
      </StudioSlideActionsRail>
    </Item>
  );
}
