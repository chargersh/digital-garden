import type { Id } from "@convex/_generated/dataModel";
import { GripVerticalIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { SortableItemHandle } from "@/components/ui/sortable";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { CreateCollapsibleButton } from "./create-collapsible-button";
import { CreateLessonButton } from "./create-lesson-button";
import { DeleteLessonGroupDialog } from "./delete-lesson-group-dialog";
import { StudioLessonTree } from "./studio-lesson-tree";
import { StudioSlideActionsRail } from "./studio-slide-actions-rail";

interface StudioLessonGroupCustomProps {
  actionsDisabled?: boolean;
  groupId: Id<"lessonGroups">;
  items: LessonNode[];
  subjectId: Id<"subjects">;
  title: string;
}

type StudioLessonGroupElementProps = Omit<ComponentProps<"div">, "title">;

type StudioLessonGroupProps = StudioLessonGroupCustomProps &
  StudioLessonGroupElementProps;

export function StudioLessonGroup({
  groupId,
  title,
  items,
  subjectId,
  actionsDisabled = false,
  className,
  ...groupProps
}: StudioLessonGroupProps) {
  return (
    <SidebarGroup className={cn("mt-4 p-0 lg:mt-5", className)} {...groupProps}>
      <SidebarGroupLabel className="group/lesson-group relative mb-2 w-full overflow-hidden pl-4 font-medium text-foreground text-sm lg:mb-1.5">
        <h5 className="min-w-0 flex-1 truncate" id={`group-${groupId}`}>
          {title}
        </h5>
        <StudioSlideActionsRail disabled={actionsDisabled} scope="lesson-group">
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
          <DeleteLessonGroupDialog
            childItems={items}
            groupId={groupId}
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
