import { SidebarMenu, SidebarMenuSub } from "@/components/ui/sidebar";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { cn } from "@/lib/utils";
import { ReaderLessonCollapsible } from "./reader-lesson-collapsible";
import { ReaderLessonItem } from "./reader-lesson-item";

interface ReaderLessonTreeProps {
  items: LessonNode[];
  depth?: number;
  asSubmenu?: boolean;
  className?: string;
}

export function ReaderLessonTree({
  items,
  depth = 0,
  asSubmenu = false,
  className,
}: ReaderLessonTreeProps) {
  const Container = asSubmenu ? SidebarMenuSub : SidebarMenu;
  const containerClassName = asSubmenu
    ? cn("mx-0 translate-x-0 gap-0 border-0 px-0 py-0", className)
    : cn("gap-0", className);

  return (
    <Container className={containerClassName}>
      {items.map((item) => {
        const key = item.id ?? item.href ?? item.title;
        const hasChildren = Boolean(item.items?.length);

        if (hasChildren && item.items) {
          return (
            <ReaderLessonCollapsible
              depth={depth}
              id={item.id}
              key={key}
              title={item.title}
            >
              <ReaderLessonTree
                asSubmenu
                depth={depth + 1}
                items={item.items}
              />
            </ReaderLessonCollapsible>
          );
        }

        if (!item.href) {
          return null;
        }

        return (
          <ReaderLessonItem
            depth={depth}
            href={item.href}
            id={item.id}
            key={key}
            title={item.title}
          />
        );
      })}
    </Container>
  );
}
