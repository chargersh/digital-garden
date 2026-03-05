import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { closestCorners } from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SidebarMenu, SidebarMenuSub } from "@/components/ui/sidebar";
import {
  Sortable,
  SortableContent,
  SortableItem,
} from "@/components/ui/sortable";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { StudioLessonCollapsible } from "./studio-lesson-collapsible";
import { StudioLessonItem } from "./studio-lesson-item";

interface StudioLessonTreeProps {
  asSubmenu?: boolean;
  className?: string;
  depth?: number;
  groupId: Id<"lessonGroups">;
  items: LessonNode[];
  parentNodeId?: Id<"lessonNodes"> | null;
  subjectId: Id<"subjects">;
}

export function StudioLessonTree({
  items,
  groupId,
  subjectId,
  depth = 0,
  asSubmenu = false,
  className,
  parentNodeId = null,
}: StudioLessonTreeProps) {
  const reorderNodes = useMutation(api.lessonNodes.reorder);
  const [orderedItems, setOrderedItems] = useState(items);
  const [isSorting, setIsSorting] = useState(false);
  const [isAwaitingServerOrderSync, setIsAwaitingServerOrderSync] =
    useState(false);
  const activeReorderRequestIdRef = useRef(0);

  useEffect(() => {
    if (isSorting) {
      return;
    }

    const isServerOrderSameAsLocal =
      items.length === orderedItems.length &&
      items.every((item, index) => {
        return item.nodeId === orderedItems[index]?.nodeId;
      });

    if (isAwaitingServerOrderSync && !isServerOrderSameAsLocal) {
      return;
    }

    if (isAwaitingServerOrderSync && isServerOrderSameAsLocal) {
      setIsAwaitingServerOrderSync(false);
    }

    setOrderedItems(items);
  }, [items, orderedItems, isAwaitingServerOrderSync, isSorting]);

  const handleOrderChange = useCallback(
    (nextItems: LessonNode[]) => {
      const isSameOrder =
        nextItems.length === orderedItems.length &&
        nextItems.every((item, index) => {
          return item.nodeId === orderedItems[index]?.nodeId;
        });
      if (isSameOrder) {
        return;
      }

      const previousItems = orderedItems;
      setOrderedItems(nextItems);
      setIsAwaitingServerOrderSync(true);

      const reorderRequestId = activeReorderRequestIdRef.current + 1;
      activeReorderRequestIdRef.current = reorderRequestId;

      reorderNodes({
        subjectId,
        groupId,
        parentNodeId,
        orderedNodeIds: nextItems.map((item) => item.nodeId),
      }).catch((error) => {
        if (reorderRequestId !== activeReorderRequestIdRef.current) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Could not reorder lessons.";
        toast.error(message);
        setOrderedItems(previousItems);
        setIsAwaitingServerOrderSync(false);
      });
    },
    [groupId, orderedItems, parentNodeId, reorderNodes, subjectId]
  );

  const Container = asSubmenu ? SidebarMenuSub : SidebarMenu;
  const containerClassName = asSubmenu
    ? cn("mx-0 translate-x-0 gap-0 border-0 px-0 py-0", className)
    : cn("gap-0", className);

  return (
    <Sortable
      collisionDetection={closestCorners}
      getItemValue={(item: LessonNode) => item.nodeId}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      onDragCancel={() => setIsSorting(false)}
      onDragEnd={() => setIsSorting(false)}
      onDragStart={() => setIsSorting(true)}
      onValueChange={handleOrderChange}
      value={orderedItems}
    >
      <SortableContent asChild>
        <Container className={containerClassName}>
          {orderedItems.map((item) => {
            const key = item.nodeId;

            if (item.kind === "collapsible") {
              return (
                <SortableItem asChild key={key} value={item.nodeId}>
                  <StudioLessonCollapsible
                    actionsDisabled={isSorting}
                    childItems={item.items ?? []}
                    depth={depth}
                    groupId={groupId}
                    nodeId={item.nodeId}
                    subjectId={subjectId}
                    title={item.title}
                  >
                    <StudioLessonTree
                      asSubmenu
                      depth={depth + 1}
                      groupId={groupId}
                      items={item.items ?? []}
                      parentNodeId={item.nodeId}
                      subjectId={subjectId}
                    />
                  </StudioLessonCollapsible>
                </SortableItem>
              );
            }

            if (!item.href) {
              return null;
            }

            return (
              <SortableItem asChild key={key} value={item.nodeId}>
                <StudioLessonItem
                  actionsDisabled={isSorting}
                  depth={depth}
                  groupId={groupId}
                  href={item.href}
                  nodeId={item.nodeId}
                  status={item.status}
                  title={item.title}
                />
              </SortableItem>
            );
          })}
        </Container>
      </SortableContent>
    </Sortable>
  );
}
