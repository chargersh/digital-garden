import { SidebarMenu, SidebarMenuSub } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LessonCollapsible } from "./lesson-collapsible";
import { LessonItem } from "./lesson-item";

export interface LessonNode {
  title: string;
  href?: string;
  items?: LessonNode[];
  id?: string;
  dataTitle?: string;
  defaultOpen?: boolean;
  isActive?: boolean;
}

interface LessonTreeProps {
  items: LessonNode[];
  depth?: number;
  asSubmenu?: boolean;
  className?: string;
}

export function LessonTree({
  items,
  depth = 0,
  asSubmenu = false,
  className,
}: LessonTreeProps) {
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
            <LessonCollapsible
              dataTitle={item.dataTitle}
              defaultOpen={item.defaultOpen}
              depth={depth}
              id={item.id}
              key={key}
              title={item.title}
            >
              <LessonTree asSubmenu depth={depth + 1} items={item.items} />
            </LessonCollapsible>
          );
        }

        if (!item.href) {
          return null;
        }

        return (
          <LessonItem
            dataTitle={item.dataTitle}
            depth={depth}
            href={item.href}
            id={item.id}
            isActive={item.isActive}
            key={key}
            title={item.title}
          />
        );
      })}
    </Container>
  );
}
