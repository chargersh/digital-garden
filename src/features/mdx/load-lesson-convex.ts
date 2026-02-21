import { getLessonByPath } from "@/features/convex/server-queries";
import { compileMdxFile } from "@/features/mdx/compile";
import type { CompiledLessonContent } from "@/features/mdx/types";

interface LoadLessonConvexInput {
  includeUnpublished?: boolean;
  lessonPathParts: string[];
  subjectSlug: string;
}

export const getConvexLesson = async ({
  includeUnpublished,
  lessonPathParts,
  subjectSlug,
}: LoadLessonConvexInput): Promise<CompiledLessonContent | null> => {
  const result = await getLessonByPath(subjectSlug, lessonPathParts, {
    includeUnpublished,
  });
  if (!result) {
    return null;
  }

  if (result.node.status === null) {
    return null;
  }

  const lessonPath = lessonPathParts.join("/");
  const sourcePath = `convex:${result.subject.slug}/${lessonPath}`;
  const compiled = await compileMdxFile({
    filePath: sourcePath,
    source: result.content.bodyMdx,
    cacheKey: `${sourcePath}:${result.content.updatedAt}:${result.content.bodyMdx.length}`,
  });

  return {
    body: compiled.body,
    toc: compiled.toc,
    frontmatter: {
      title: result.node.title,
      description: result.content.description,
      subject: result.subject.slug,
      lessonSlug: result.node.slug,
      order: result.node.order,
      difficulty: result.content.difficulty,
      tags: [],
      status: result.node.status,
      updatedAt: new Date(result.content.updatedAt).toISOString(),
      summary: result.content.summary ?? undefined,
    },
    canonicalUrl: `/${result.subject.slug}/${lessonPath}`,
    sourcePath,
  };
};
