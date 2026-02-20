import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { ReaderLessonTree } from "./reader-lesson-tree";

interface ReaderLessonGroupProps {
  title: string;
  items: LessonNode[];
  id?: string;
  className?: string;
}

export function ReaderLessonGroup({
  title,
  items,
  id,
  className,
}: ReaderLessonGroupProps) {
  return (
    <SidebarGroup className={cn("mt-4 p-0 lg:mt-5", className)}>
      <SidebarGroupLabel
        asChild
        className="mb-2 pl-4 font-medium text-foreground text-sm lg:mb-1.5"
      >
        <h5 id={id}>{title}</h5>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <ReaderLessonTree items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
