import type { Id } from "@convex/_generated/dataModel";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { CreateCollapsibleButton } from "./create-collapsible-button";
import { CreateLessonButton } from "./create-lesson-button";
import { DeleteLessonGroupDialog } from "./delete-lesson-group-dialog";
import { StudioLessonTree } from "./studio-lesson-tree";

interface StudioLessonGroupProps {
  className?: string;
  groupId: Id<"lessonGroups">;
  id?: string;
  items: LessonNode[];
  subjectId: Id<"subjects">;
  title: string;
}

export function StudioLessonGroup({
  groupId,
  title,
  items,
  subjectId,
  id,
  className,
}: StudioLessonGroupProps) {
  return (
    <SidebarGroup className={cn("mt-4 p-0 lg:mt-5", className)}>
      <SidebarGroupLabel className="group/lesson-group relative mb-2 w-full overflow-hidden pl-4 font-medium text-foreground text-sm lg:mb-1.5">
        <h5 className="min-w-0 flex-1 truncate" id={id}>
          {title}
        </h5>
        <div className="pointer-events-none absolute inset-y-0 -right-1 z-10 flex translate-x-full items-center justify-end bg-sidebar transition-transform duration-150 group-focus-within/lesson-group:pointer-events-auto group-focus-within/lesson-group:translate-x-0 group-hover/lesson-group:pointer-events-auto group-hover/lesson-group:translate-x-0">
          <div className="pointer-events-none absolute inset-y-0 right-full w-8 bg-linear-to-l from-sidebar to-transparent opacity-0 transition-opacity duration-150 group-focus-within/lesson-group:opacity-100 group-hover/lesson-group:opacity-100" />
          <div className="flex items-center gap-0.5 pr-1">
            <CreateLessonButton
              ariaLabel={`Create lesson in ${title}`}
              groupId={groupId}
              subjectId={subjectId}
            />
            <CreateCollapsibleButton
              ariaLabel={`Create collapsible in ${title}`}
              groupId={groupId}
              subjectId={subjectId}
            />
            <DeleteLessonGroupDialog groupId={groupId} title={title} />
          </div>
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <StudioLessonTree items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
