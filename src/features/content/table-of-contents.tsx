import { TextAlignStart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
  depth?: number;
}

interface TableOfContentsProps {
  items: readonly TocItem[];
  activeId?: string;
  label?: string;
}

export function TableOfContents({
  items,
  activeId,
  label = "On this page",
}: TableOfContentsProps) {
  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-[calc(5.5rem+1px)] z-21 hidden h-[calc(100svh-6rem)] max-w-md self-start xl:flex xl:flex-col"
      id="content-side-layout"
    >
      <div
        className="z-10 box-border hidden max-h-full w-76 pl-10 xl:flex"
        id="table-of-contents-layout"
      >
        <div
          className="-mt-10 w-66 space-y-2 overflow-y-auto pt-10 pb-4 text-muted-foreground text-sm leading-6"
          id="table-of-contents"
        >
          <p className="flex items-center gap-2 font-medium text-foreground/80">
            <TextAlignStart className="h-3 w-3" />
            <span>{label}</span>
          </p>
          <ul className="space-y-1" id="table-of-contents-content">
            {items.map((item) => {
              const isActive = item.id === activeId;
              const depth = item.depth ?? 0;

              return (
                <li className="relative" data-depth={depth} key={item.id}>
                  <a
                    className={cn(
                      "wrap-break-word block border-l-2 py-1 transition-colors data-[depth=3]:pl-4 data-[depth=4]:pl-8 data-[depth=5]:pl-12 data-[depth=6]:pl-16",
                      isActive
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    data-depth={depth}
                    href={`#${item.id}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
