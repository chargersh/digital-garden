export interface LessonNode {
  title: string;
  href?: string;
  items?: LessonNode[];
  id?: string;
  status?: "archived" | "draft" | "published";
}

export interface LessonGroup {
  title: string;
  items: LessonNode[];
  order: number;
  id?: string;
  className?: string;
}
