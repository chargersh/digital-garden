import { notFound } from "next/navigation";
import { LessonArticle } from "@/features/mdx/lesson-article";
import { getConvexLesson } from "@/features/mdx/load-lesson-convex";

interface StudioLessonPageProps {
  params: Promise<{
    lessonPath: string[];
    subject: string;
  }>;
}

export default async function StudioLessonPage({
  params,
}: StudioLessonPageProps) {
  const { lessonPath, subject } = await params;
  const compiledLesson = await getConvexLesson({
    includeUnpublished: true,
    lessonPathParts: lessonPath,
    subjectSlug: subject,
  });

  if (!compiledLesson) {
    notFound();
  }

  return <LessonArticle compiledLesson={compiledLesson} />;
}
