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
import { StudioSlideActionsRail } from "./studio-slide-actions-rail";

interface StudioLessonGroupProps {
  className?: string;
  groupId: Id<"lessonGroups">;
  items: LessonNode[];
  subjectId: Id<"subjects">;
  title: string;
}

export function StudioLessonGroup({
  groupId,
  title,
  items,
  subjectId,
  className,
}: StudioLessonGroupProps) {
  return (
    <SidebarGroup className={cn("mt-4 p-0 lg:mt-5", className)}>
      <SidebarGroupLabel className="group/lesson-group relative mb-2 w-full overflow-hidden pl-4 font-medium text-foreground text-sm lg:mb-1.5">
        <h5 className="min-w-0 flex-1 truncate" id={`group-${groupId}`}>
          {title}
        </h5>
        <StudioSlideActionsRail scope="lesson-group">
          <CreateLessonButton
            ariaLabel={`Create lesson in ${title}`}
            groupId={groupId}
            parentTitle={title}
            subjectId={subjectId}
          />
          <CreateCollapsibleButton
            ariaLabel={`Create collapsible in ${title}`}
            groupId={groupId}
            parentTitle={title}
            subjectId={subjectId}
          />
          <DeleteLessonGroupDialog groupId={groupId} title={title} />
        </StudioSlideActionsRail>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <StudioLessonTree
          groupId={groupId}
          items={items}
          subjectId={subjectId}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
