import { notFound } from "next/navigation";
import { LessonArticle } from "@/features/mdx/lesson-article";
import { getConvexLesson } from "@/features/mdx/load-lesson-convex";

interface LessonPageProps {
  params: Promise<{
    lessonPath: string[];
    subject: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonPath, subject } = await params;
  const compiledLesson = await getConvexLesson({
    lessonPathParts: lessonPath,
    subjectSlug: subject,
  });

  if (!compiledLesson) {
    notFound();
  }

  return <LessonArticle compiledLesson={compiledLesson} />;
}
