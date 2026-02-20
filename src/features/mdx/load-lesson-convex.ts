import { getLessonByRoute } from "@/features/convex/server-queries";
import { compileMdxFile } from "@/features/mdx/compile";
import type { CompiledLessonContent } from "@/features/mdx/types";

interface LoadLessonConvexInput {
  includeUnpublished?: boolean;
  subjectSlug: string;
  lessonSlug: string;
}

export const getConvexLesson = async ({
  includeUnpublished,
  subjectSlug,
  lessonSlug,
}: LoadLessonConvexInput): Promise<CompiledLessonContent | null> => {
  const result = await getLessonByRoute(subjectSlug, lessonSlug, {
    includeUnpublished,
  });
  if (!result) {
    return null;
  }

  const sourcePath = `convex:${result.subject.slug}/${result.lesson.lessonSlug}`;
  const compiled = await compileMdxFile({
    filePath: sourcePath,
    source: result.lesson.bodyMdx,
    cacheKey: `${sourcePath}:${result.lesson.updatedAt}:${result.lesson.bodyMdx.length}`,
  });

  return {
    body: compiled.body,
    toc: compiled.toc,
    frontmatter: {
      title: result.lesson.title,
      description: result.lesson.description,
      subject: result.subject.slug,
      lessonSlug: result.lesson.lessonSlug,
      order: result.lesson.order,
      difficulty: result.lesson.difficulty,
      tags: [],
      status: result.lesson.status,
      updatedAt: new Date(result.lesson.updatedAt).toISOString(),
      summary: result.lesson.summary ?? undefined,
    },
    canonicalUrl: `/${result.subject.slug}/${result.lesson.lessonSlug}`,
    sourcePath,
  };
};
