import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StudioSlideActionsScope =
  | "lesson-collapsible"
  | "lesson-group"
  | "lesson-item";

const railVisibilityClasses: Record<StudioSlideActionsScope, string> = {
  "lesson-group":
    "group-focus-within/lesson-group:pointer-events-auto group-focus-within/lesson-group:translate-x-0 group-hover/lesson-group:pointer-events-auto group-hover/lesson-group:translate-x-0",
  "lesson-item":
    "group-focus-within/lesson-item:pointer-events-auto group-focus-within/lesson-item:translate-x-0 group-hover/lesson-item:pointer-events-auto group-hover/lesson-item:translate-x-0",
  "lesson-collapsible":
    "group-focus-within/lesson-collapsible:pointer-events-auto group-focus-within/lesson-collapsible:translate-x-0 group-hover/lesson-collapsible:pointer-events-auto group-hover/lesson-collapsible:translate-x-0",
};

const fadeVisibilityClasses: Record<StudioSlideActionsScope, string> = {
  "lesson-group":
    "group-focus-within/lesson-group:opacity-100 group-hover/lesson-group:opacity-100",
  "lesson-item":
    "group-focus-within/lesson-item:opacity-100 group-hover/lesson-item:opacity-100",
  "lesson-collapsible":
    "group-focus-within/lesson-collapsible:opacity-100 group-hover/lesson-collapsible:opacity-100",
};

interface StudioSlideActionsRailProps {
  actionsClassName?: string;
  children: ReactNode;
  className?: string;
  scope: StudioSlideActionsScope;
}

export function StudioSlideActionsRail({
  children,
  scope,
  className,
  actionsClassName,
}: StudioSlideActionsRailProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 -right-1 z-10 flex translate-x-full items-center justify-end bg-sidebar transition-transform duration-150",
        railVisibilityClasses[scope],
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-full w-8 bg-linear-to-l from-sidebar to-transparent opacity-0 transition-opacity duration-150",
          fadeVisibilityClasses[scope]
        )}
      />
      <div className={cn("flex items-center gap-0.5 pr-1", actionsClassName)}>
        {children}
      </div>
    </div>
  );
}
