import type { Id } from "@convex/_generated/dataModel";
import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import {
  getIndent,
  getMenuItemComponent,
} from "@/features/sidebar/shared/components/lesson-row-utils";
import { cn } from "@/lib/utils";
import { CreateCollapsibleButton } from "./create-collapsible-button";
import { CreateLessonButton } from "./create-lesson-button";
import { DeleteLessonNodeDialog } from "./delete-lesson-node-dialog";
import { StudioSlideActionsRail } from "./studio-slide-actions-rail";

interface StudioLessonCollapsibleProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  groupId: Id<"lessonGroups">;
  nodeId: Id<"lessonNodes">;
  subjectId: Id<"subjects">;
  title: string;
}

export function StudioLessonCollapsible({
  title,
  children,
  groupId,
  nodeId,
  subjectId,
  depth = 0,
  className,
}: StudioLessonCollapsibleProps) {
  const Item = getMenuItemComponent(depth);

  return (
    <Collapsible defaultOpen>
      <Item
        className="scroll-m-4 first:scroll-m-20"
        data-title={title}
        id={`node-${nodeId}`}
      >
        <div className="group/lesson-collapsible relative overflow-hidden">
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton
              asChild
              className={cn(
                "group/lesson-toggle h-auto rounded-none px-0 py-0",
                "flex items-center gap-x-3 pr-3 text-left",
                "ml-4 w-[calc(100%-1rem)] border-l py-2 lg:py-1.5",
                "wrap-break-word hyphens-auto",
                "text-muted-foreground",
                "hover:border-foreground hover:text-foreground",
                "hover:bg-transparent active:bg-transparent",
                className
              )}
              style={
                {
                  paddingLeft: getIndent(depth),
                } as CSSProperties
              }
            >
              <button
                aria-label={`Toggle ${title} section`}
                onPointerUp={(event) => {
                  event.currentTarget.blur();
                }}
                type="button"
              >
                <div>{title}</div>
                <ChevronRight className="-mr-0.5 h-3! w-3! text-muted-foreground! transition-transform duration-75 group-hover/lesson-toggle:text-foreground! group-data-[state=open]/lesson-toggle:rotate-90" />
              </button>
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <StudioSlideActionsRail scope="lesson-collapsible">
            <CreateLessonButton
              ariaLabel={`Create lesson in ${title}`}
              groupId={groupId}
              parentNodeId={nodeId}
              subjectId={subjectId}
            />
            <CreateCollapsibleButton
              ariaLabel={`Create collapsible in ${title}`}
              groupId={groupId}
              parentNodeId={nodeId}
              subjectId={subjectId}
            />
            <DeleteLessonNodeDialog
              nodeId={nodeId}
              nodeKind="collapsible"
              title={title}
            />
          </StudioSlideActionsRail>
        </div>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Item>
    </Collapsible>
  );
}
