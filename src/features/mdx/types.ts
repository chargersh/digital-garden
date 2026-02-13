import type { MDXContent } from "mdx/types";
import type { TocItem } from "@/features/toc/types";

export type LessonDifficulty = "beginner" | "intermediate" | "advanced";
export type LessonStatus = "archived" | "draft" | "published";

export interface LessonFrontmatter {
  title: string;
  description: string;
  subject: string;
  lessonSlug: string;
  order: number;
  difficulty: LessonDifficulty;
  tags: string[];
  status: LessonStatus;
  updatedAt: string;
  estimatedMinutes?: number;
  summary?: string;
}

export interface CompiledLessonContent {
  body: MDXContent;
  toc: TocItem[];
  frontmatter: LessonFrontmatter;
  canonicalUrl: string;
  sourcePath: string;
}
