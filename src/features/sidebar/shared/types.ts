import type { Id } from "@convex/_generated/dataModel";

export type LessonNodeKind = "lesson" | "collapsible";
export type LessonNodeStatus = "archived" | "draft" | "published" | null;

export interface LessonNode {
  href?: string;
  id: string;
  items?: LessonNode[];
  kind: LessonNodeKind;
  slug: string;
  status: LessonNodeStatus;
  title: string;
  uid: string;
}

export interface LessonGroup {
  className?: string;
  groupId: Id<"lessonGroups">;
  id?: string;
  items: LessonNode[];
  order: number;
  title: string;
}
