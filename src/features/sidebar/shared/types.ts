export type LessonNodeKind = "lesson" | "collapsible";
export type LessonNodeStatus = "archived" | "draft" | "published" | null;

export interface LessonNode {
  id: string;
  uid: string;
  kind: LessonNodeKind;
  title: string;
  slug: string;
  status: LessonNodeStatus;
  href?: string;
  items?: LessonNode[];
}

export interface LessonGroup {
  title: string;
  items: LessonNode[];
  order: number;
  id?: string;
  className?: string;
}
