"use client";

import type { ComponentProps, ReactNode, Ref, RefObject } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import scrollIntoView from "scroll-into-view-if-needed";
import type { TocItem } from "@/features/toc/types";
import { cn } from "@/lib/utils";

const TocItemsContext = createContext<TocItem[]>([]);
const ActiveAnchorContext = createContext<string[]>([]);
const ScrollContext = createContext<RefObject<HTMLElement | null>>({
  current: null,
});

const isRefObject = <T,>(
  ref: Ref<T> | undefined
): ref is RefObject<T | null> => {
  return typeof ref === "object" && ref !== null && "current" in ref;
};

const mergeRefs = <T,>(...refs: Array<Ref<T> | undefined>) => {
  return (value: T | null) => {
    const cleanups: Array<() => void> = [];

    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === "function") {
        const cleanup = ref(value);
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      } else if (isRefObject(ref)) {
        ref.current = value;
      }
    }

    if (cleanups.length === 0) {
      return;
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  };
};

export function useTOCItems(): TocItem[] {
  return useContext(TocItemsContext);
}

export function useActiveAnchors(): string[] {
  return useContext(ActiveAnchorContext);
}

interface TocProviderProps {
  items: TocItem[];
  single?: boolean;
  children: ReactNode;
}

export function TocProvider({
  items,
  single = true,
  children,
}: TocProviderProps) {
  const activeAnchors = useAnchorObserver(
    useMemo(() => items.map((item) => item.url.slice(1)), [items]),
    single
  );

  return (
    <TocItemsContext.Provider value={items}>
      <ActiveAnchorContext.Provider value={activeAnchors}>
        {children}
      </ActiveAnchorContext.Provider>
    </TocItemsContext.Provider>
  );
}

export function TOCScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const viewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "toc-scrollbar relative min-h-0 overflow-auto text-sm",
        className
      )}
      ref={viewRef}
    >
      <ScrollContext.Provider value={viewRef}>
        {children}
      </ScrollContext.Provider>
    </div>
  );
}

interface TOCItemProps extends Omit<ComponentProps<"a">, "href"> {
  href: string;
}

export function TOCItem({ ref, ...props }: TOCItemProps) {
  const containerRef = useContext(ScrollContext);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const activeOrder = useActiveAnchors().indexOf(props.href.slice(1));
  const isActive = activeOrder !== -1;
  const shouldScroll = activeOrder === 0;

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const container = containerRef.current;

    if (container && anchor && shouldScroll) {
      scrollIntoView(anchor, {
        behavior: "smooth",
        block: "center",
        inline: "center",
        scrollMode: "always",
        boundary: container,
      });
    }
  }, [containerRef, shouldScroll]);

  return (
    <a {...props} data-active={isActive} ref={mergeRefs(anchorRef, ref)}>
      {props.children}
    </a>
  );
}

export function TocThumb({
  containerRef,
  ...props
}: ComponentProps<"div"> & {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const active = useActiveAnchors();

  const onPrint = useEffectEvent(() => {
    updateThumb(thumbRef.current, containerRef.current, active);
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver(onPrint);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  useEffect(() => {
    updateThumb(thumbRef.current, containerRef.current, active);
  }, [active, containerRef]);

  return <div {...props} data-hidden={active.length === 0} ref={thumbRef} />;
}

function updateThumb(
  thumbElement: HTMLDivElement | null,
  container: HTMLElement | null,
  active: string[]
) {
  if (!(thumbElement && container)) {
    return;
  }

  const info = calcThumb(container, active);
  thumbElement.style.setProperty("--toc-top", `${info[0]}px`);
  thumbElement.style.setProperty("--toc-height", `${info[1]}px`);
}

function calcThumb(container: HTMLElement, active: string[]): [number, number] {
  if (active.length === 0 || container.clientHeight === 0) {
    return [0, 0];
  }

  let upper = Number.MAX_VALUE;
  let lower = 0;

  for (const item of active) {
    const escaped = CSS.escape(item);
    const element = container.querySelector<HTMLElement>(
      `a[href="#${escaped}"]`
    );
    if (!element) {
      continue;
    }

    const styles = getComputedStyle(element);
    upper = Math.min(
      upper,
      element.offsetTop + Number.parseFloat(styles.paddingTop)
    );
    lower = Math.max(
      lower,
      element.offsetTop +
        element.clientHeight -
        Number.parseFloat(styles.paddingBottom)
    );
  }

  return [upper, lower - upper];
}

function useAnchorObserver(watch: string[], single: boolean): string[] {
  const observerRef = useRef<IntersectionObserver>(null);
  const [activeAnchor, setActiveAnchor] = useState<string[]>(() => []);
  const stateRef = useRef<{ visible: Set<string> }>(null);

  const onChange = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    stateRef.current ??= {
      visible: new Set(),
    };
    const state = stateRef.current;

    for (const entry of entries) {
      if (entry.isIntersecting) {
        state.visible.add(entry.target.id);
      } else {
        state.visible.delete(entry.target.id);
      }
    }

    if (state.visible.size === 0) {
      const viewTop =
        entries.length > 0 ? (entries[0]?.rootBounds?.top ?? 0) : 0;
      const fallback = findClosestHeading(watch, viewTop);
      setActiveAnchor(fallback ? [fallback.id] : []);
    } else {
      const visibleItems = watch.filter((item) => state.visible.has(item));
      setActiveAnchor(single ? visibleItems.slice(0, 1) : visibleItems);
    }
  });

  useEffect(() => {
    if (observerRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(onChange, {
      rootMargin: "0px",
      threshold: 0.98,
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) {
      return;
    }

    const elements = watch.flatMap(
      (heading) => document.getElementById(heading) ?? []
    );
    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      for (const element of elements) {
        observer.unobserve(element);
      }
    };
  }, [watch]);

  return activeAnchor;
}

function findClosestHeading(
  watch: string[],
  viewTop: number
): Element | undefined {
  let fallback: Element | undefined;
  let min = -1;

  for (const id of watch) {
    const element = document.getElementById(id);
    if (!element) {
      continue;
    }

    const distance = Math.abs(viewTop - element.getBoundingClientRect().top);
    if (min === -1 || distance < min) {
      fallback = element;
      min = distance;
    }
  }

  return fallback;
}
