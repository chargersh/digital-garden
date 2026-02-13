"use client";

import { useEffect, useRef, useState } from "react";
import { TocIcon } from "@/features/toc/toc-icon";
import {
  TOCItem,
  TOCScrollArea,
  TocProvider,
  TocThumb,
  useTOCItems,
} from "@/features/toc/toc-system";
import type { TocItem } from "@/features/toc/types";
import { cn } from "@/lib/utils";

export type { TocItem } from "@/features/toc/types";

interface TableOfContentsProps {
  items: readonly TocItem[];
}

const ITEM_OFFSET_DEPTH_2 = 14;
const ITEM_OFFSET_DEPTH_3 = 26;
const ITEM_OFFSET_DEPTH_DEEP = 36;
const LINE_OFFSET_DEPTH_3 = 10;

export function TableOfContents({ items }: TableOfContentsProps) {
  const onScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <TocProvider items={[...items]} single={false}>
      <nav
        aria-label="Table of contents"
        className="sticky top-[calc(5.5rem+1px)] z-21 hidden h-[calc(100svh-(5.5rem+1px))] max-w-md self-start pb-14 xl:flex xl:flex-col"
        id="content-side-layout"
      >
        <div
          className="z-10 box-border hidden h-full w-76 pl-10 xl:flex"
          id="table-of-contents-layout"
        >
          <div
            className="flex h-full w-66 flex-col space-y-2 text-muted-foreground text-sm leading-6"
            id="table-of-contents"
          >
            <button
              className="flex cursor-pointer items-center gap-2 font-medium text-foreground/80 transition-colors hover:text-foreground"
              onClick={onScrollToTop}
              type="button"
            >
              <TocIcon />
              <span>On this page</span>
            </button>
            <TOCScrollArea className="relative min-h-0 flex-1">
              <TOCItems />
            </TOCScrollArea>
          </div>
        </div>
      </nav>
    </TocProvider>
  );
}

function TOCItems() {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();
  const [svg, setSvg] = useState<{
    path: string;
    width: number;
    height: number;
  }>();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;

    const onResize = () => {
      if (container.clientHeight === 0) {
        return;
      }

      let maxWidth = 0;
      let maxHeight = 0;
      const segments: string[] = [];

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (!item) {
          continue;
        }

        const escaped = CSS.escape(item.url.slice(1));
        const element = container.querySelector<HTMLElement>(
          `a[href="#${escaped}"]`
        );
        if (!element) {
          continue;
        }

        const styles = getComputedStyle(element);
        const lineOffset = getLineOffset(item.depth) + 1;
        const top = element.offsetTop + Number.parseFloat(styles.paddingTop);
        const bottom =
          element.offsetTop +
          element.clientHeight -
          Number.parseFloat(styles.paddingBottom);

        maxWidth = Math.max(maxWidth, lineOffset);
        maxHeight = Math.max(maxHeight, bottom);

        segments.push(`${index === 0 ? "M" : "L"}${lineOffset} ${top}`);
        segments.push(`L${lineOffset} ${bottom}`);
      }

      setSvg({
        path: segments.join(" "),
        width: maxWidth + 1,
        height: maxHeight,
      });
    };

    const observer = new ResizeObserver(onResize);
    onResize();
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-3 text-muted-foreground text-xs">
        No headings in this lesson.
      </div>
    );
  }

  return (
    <>
      {svg ? (
        <div
          className="absolute start-0 top-0 rtl:-scale-x-100"
          style={{
            width: svg.width,
            height: svg.height,
            maskImage: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`
            )}")`,
          }}
        >
          <TocThumb
            className="absolute top-(--toc-top) h-(--toc-height) w-full bg-foreground transition-[top,height] data-[hidden=true]:hidden"
            containerRef={containerRef}
          />
        </div>
      ) : null}
      <div className="flex flex-col" ref={containerRef}>
        {items.map((item, index) => (
          <TOCListItem
            item={item}
            key={item.url}
            lower={items[index + 1]?.depth}
            upper={items[index - 1]?.depth}
          />
        ))}
      </div>
    </>
  );
}

function getItemOffset(depth: number): number {
  if (depth <= 2) {
    return ITEM_OFFSET_DEPTH_2;
  }

  if (depth === 3) {
    return ITEM_OFFSET_DEPTH_3;
  }

  return ITEM_OFFSET_DEPTH_DEEP;
}

function getLineOffset(depth: number): number {
  return depth >= 3 ? LINE_OFFSET_DEPTH_3 : 0;
}

function TOCListItem({
  item,
  upper = item.depth,
  lower = item.depth,
}: {
  item: TocItem;
  upper?: number;
  lower?: number;
}) {
  const offset = getLineOffset(item.depth);
  const upperOffset = getLineOffset(upper);
  const lowerOffset = getLineOffset(lower);

  return (
    <TOCItem
      className={cn(
        "wrap-anywhere relative py-1.5 text-muted-foreground text-sm transition-colors first:pt-0 last:pb-0 data-[active=true]:text-foreground"
      )}
      href={item.url}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
      }}
    >
      {offset !== upperOffset ? (
        <svg
          aria-hidden="true"
          className="absolute start-0 -top-1.5 size-4 rtl:-scale-x-100"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            className="stroke-foreground/10"
            strokeWidth="1"
            x1={upperOffset}
            x2={offset}
            y1="0"
            y2="12"
          />
        </svg>
      ) : null}
      <div
        className={cn(
          "absolute inset-y-0 w-px bg-foreground/10",
          offset !== upperOffset && "top-1.5",
          offset !== lowerOffset && "bottom-1.5"
        )}
        style={{
          insetInlineStart: offset,
        }}
      />
      {item.title}
    </TOCItem>
  );
}
