import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { type LessonNode, LessonTree } from "./lesson-tree";

interface LessonGroupProps {
  title: string;
  items: LessonNode[];
  id?: string;
  className?: string;
}

export function LessonGroup({ title, items, id, className }: LessonGroupProps) {
  return (
    <SidebarGroup className={cn("mt-4 p-0 lg:mt-5", className)}>
      <SidebarGroupLabel
        asChild
        className="mb-2 pl-4 font-medium text-foreground text-sm lg:mb-1.5"
      >
        <h5 id={id}>{title}</h5>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <LessonTree items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
