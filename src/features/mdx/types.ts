import type { MDXContent } from "mdx/types";
import type { TocItem } from "@/features/toc/types";

export type LessonDifficulty = "beginner" | "intermediate" | "advanced";
export type LessonStatus = "archived" | "draft" | "published";

export interface LessonFrontmatter {
  description: string;
  difficulty: LessonDifficulty;
  estimatedMinutes?: number;
  lessonSlug: string;
  order: number;
  status: LessonStatus;
  subject: string;
  summary?: string;
  tags: string[];
  title: string;
  updatedAt: string;
}

export interface CompiledLessonContent {
  body: MDXContent;
  canonicalUrl: string;
  frontmatter: LessonFrontmatter;
  sourcePath: string;
  toc: TocItem[];
}
