import type { Id } from "@convex/_generated/dataModel";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { ReaderLessonTree } from "./reader-lesson-tree";

interface ReaderLessonGroupProps {
  className?: string;
  groupId: Id<"lessonGroups">;
  items: LessonNode[];
  title: string;
}

export function ReaderLessonGroup({
  title,
  items,
  groupId,
  className,
}: ReaderLessonGroupProps) {
  return (
    <SidebarGroup className={cn("mt-4 p-0 lg:mt-5", className)}>
      <SidebarGroupLabel
        asChild
        className="mb-2 pl-4 font-medium text-foreground text-sm lg:mb-1.5"
      >
        <h5 id={`group-${groupId}`}>{title}</h5>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <ReaderLessonTree items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
