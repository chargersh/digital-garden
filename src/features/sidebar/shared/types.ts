import type { Id } from "@convex/_generated/dataModel";

export type LessonNodeKind = "lesson" | "collapsible";
export type LessonNodeStatus = "archived" | "draft" | "published" | null;

export interface LessonNode {
  href?: string;
  items?: LessonNode[];
  kind: LessonNodeKind;
  nodeId: Id<"lessonNodes">;
  slug: string;
  status: LessonNodeStatus;
  title: string;
}

export interface LessonGroup {
  className?: string;
  groupId: Id<"lessonGroups">;
  items: LessonNode[];
  order: number;
  title: string;
}
