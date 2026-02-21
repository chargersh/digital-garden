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
  id?: string;
  items: LessonNode[];
  order: number;
  title: string;
}
