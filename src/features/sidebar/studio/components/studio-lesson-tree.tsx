import { SidebarMenu, SidebarMenuSub } from "@/components/ui/sidebar";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { StudioLessonCollapsible } from "./studio-lesson-collapsible";
import { StudioLessonItem } from "./studio-lesson-item";

interface StudioLessonTreeProps {
  asSubmenu?: boolean;
  className?: string;
  depth?: number;
  items: LessonNode[];
}

export function StudioLessonTree({
  items,
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
        const key = item.id ?? item.href ?? item.title;

        if (item.kind === "collapsible") {
          return (
            <StudioLessonCollapsible
              depth={depth}
              id={item.id}
              key={key}
              title={item.title}
            >
              <StudioLessonTree
                asSubmenu
                depth={depth + 1}
                items={item.items ?? []}
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
            id={item.id}
            key={key}
            status={item.status}
            title={item.title}
          />
        );
      })}
    </Container>
  );
}
