import type { Id } from "@convex/_generated/dataModel";
import { SidebarMenu, SidebarMenuSub } from "@/components/ui/sidebar";
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
  subjectId: Id<"subjects">;
}

export function StudioLessonTree({
  items,
  groupId,
  subjectId,
  depth = 0,
  asSubmenu = false,
  className,
}: StudioLessonTreeProps) {
  const Container = asSubmenu ? SidebarMenuSub : SidebarMenu;
  const containerClassName = asSubmenu
    ? cn("mx-0 translate-x-0 gap-0 border-0 px-0 py-0", className)
    : cn("gap-0", className);

  return (
    <Container className={containerClassName}>
      {items.map((item) => {
        const key = item.nodeId ?? item.href ?? item.title;

        if (item.kind === "collapsible") {
          return (
            <StudioLessonCollapsible
              depth={depth}
              groupId={groupId}
              key={key}
              nodeId={item.nodeId}
              subjectId={subjectId}
              title={item.title}
            >
              <StudioLessonTree
                asSubmenu
                depth={depth + 1}
                groupId={groupId}
                items={item.items ?? []}
                subjectId={subjectId}
              />
            </StudioLessonCollapsible>
          );
        }

        if (!item.href) {
          return null;
        }

        return (
          <StudioLessonItem
            depth={depth}
            href={item.href}
            key={key}
            nodeId={item.nodeId}
            nodeKind={item.kind}
            status={item.status}
            title={item.title}
          />
        );
      })}
    </Container>
  );
}
