"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Sortable,
  SortableContent,
  SortableItem,
} from "@/components/ui/sortable";
import { SubjectOverviewItem } from "@/features/sidebar/shared/components/subject-overview-item";
import { useSubjectSidebar } from "@/features/sidebar/shared/subject-sidebar-context";
import type { LessonGroup } from "@/features/sidebar/shared/types";
import { StudioLessonGroup } from "./components/studio-lesson-group";
import { StudioSidebarHeader } from "./components/studio-sidebar-header";

export function StudioSidebar(props: ComponentProps<typeof Sidebar>) {
  const {
    lessonGroups,
    status,
    subjectHref,
    subjectId,
    subjectName,
    subjectSlug,
  } = useSubjectSidebar();
  const reorderGroups = useMutation(api.lessonGroups.reorder);
  const [orderedGroups, setOrderedGroups] = useState(lessonGroups);
  const [isSortingGroups, setIsSortingGroups] = useState(false);
  const [isAwaitingServerOrderSync, setIsAwaitingServerOrderSync] =
    useState(false);
  const activeReorderRequestIdRef = useRef(0);

  useEffect(() => {
    if (isSortingGroups) {
      return;
    }

    const isServerOrderSameAsLocal =
      lessonGroups.length === orderedGroups.length &&
      lessonGroups.every((group, index) => {
        return group.groupId === orderedGroups[index]?.groupId;
      });

    if (isAwaitingServerOrderSync && !isServerOrderSameAsLocal) {
      return;
    }

    if (isAwaitingServerOrderSync && isServerOrderSameAsLocal) {
      setIsAwaitingServerOrderSync(false);
    }

    setOrderedGroups(lessonGroups);
  }, [lessonGroups, orderedGroups, isAwaitingServerOrderSync, isSortingGroups]);

  const handleGroupOrderChange = useCallback(
    (nextGroups: LessonGroup[]) => {
      const isSameOrder =
        nextGroups.length === orderedGroups.length &&
        nextGroups.every((group, index) => {
          return group.groupId === orderedGroups[index]?.groupId;
        });
      if (isSameOrder) {
        return;
      }

      const previousGroups = orderedGroups;
      setOrderedGroups(nextGroups);
      setIsAwaitingServerOrderSync(true);

      const reorderRequestId = activeReorderRequestIdRef.current + 1;
      activeReorderRequestIdRef.current = reorderRequestId;

      reorderGroups({
        subjectId,
        orderedGroupIds: nextGroups.map((group) => group.groupId),
      }).catch((error) => {
        if (reorderRequestId !== activeReorderRequestIdRef.current) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Could not reorder groups.";
        toast.error(message);
        setOrderedGroups(previousGroups);
        setIsAwaitingServerOrderSync(false);
      });
    },
    [orderedGroups, reorderGroups, subjectId]
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4">
        <StudioSidebarHeader
          subjectId={subjectId}
          subjectName={subjectName}
          subjectSlug={subjectSlug}
        />
        <div aria-hidden="true" className="mt-2 border-b" />
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar stable-scrollbar-gutter flex-1 overflow-y-auto pt-2 pb-6">
        {status === "loading" && (
          <div className="px-4 py-3 text-muted-foreground text-sm">
            Loading...
          </div>
        )}
        {status === "ready" && (
          <SubjectOverviewItem className="mt-0 lg:mt-0" href={subjectHref} />
        )}
        {status === "ready" && lessonGroups.length === 0 && (
          <div className="px-4 py-3 text-muted-foreground text-sm">
            No lessons yet.
          </div>
        )}
        {status === "ready" && lessonGroups.length > 0 && (
          <Sortable
            getItemValue={(group: LessonGroup) => group.groupId}
            onDragCancel={() => setIsSortingGroups(false)}
            onDragEnd={() => setIsSortingGroups(false)}
            onDragStart={() => setIsSortingGroups(true)}
            onValueChange={handleGroupOrderChange}
            value={orderedGroups}
          >
            <SortableContent withoutSlot>
              {orderedGroups.map((group) => (
                <SortableItem asChild key={group.groupId} value={group.groupId}>
                  <StudioLessonGroup
                    actionsDisabled={isSortingGroups}
                    groupId={group.groupId}
                    items={group.items}
                    subjectId={subjectId}
                    title={group.title}
                  />
                </SortableItem>
              ))}
            </SortableContent>
          </Sortable>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
