import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getIndent, getMenuItemComponent } from "./lesson-row-utils";

interface LessonCollapsibleProps {
  title: string;
  children: ReactNode;
  depth?: number;
  id?: string;
  dataTitle?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function LessonCollapsible({
  title,
  children,
  depth = 0,
  id,
  dataTitle,
  defaultOpen = true,
  className,
}: LessonCollapsibleProps) {
  const Item = getMenuItemComponent(depth);

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Item
        className="scroll-m-4 first:scroll-m-20"
        data-title={dataTitle ?? title}
        id={id}
      >
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
            <button aria-label={`Toggle ${title} section`} type="button">
              <div>{title}</div>
              <ChevronRight className="-mr-0.5 h-3! w-3! text-muted-foreground! transition-transform duration-75 group-hover/lesson-toggle:text-foreground! group-data-[state=open]/lesson-toggle:rotate-90" />
            </button>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Item>
    </Collapsible>
  );
}
