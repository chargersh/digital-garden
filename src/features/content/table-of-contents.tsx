import { TextAlignStart } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
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
    <div
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

              return (
                <li
                  className="relative"
                  data-depth={item.depth ?? 0}
                  key={item.id}
                >
                  <a
                    className={cn(
                      "wrap-break-word block border-l-2 py-1 transition-colors",
                      isActive
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
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
    </div>
  );
}
