import { notFound } from "next/navigation";
import { getConvexLesson } from "@/features/mdx/load-lesson-convex";
import { getMDXComponents } from "@/features/mdx/mdx-components";
import { TableOfContents } from "@/features/toc/table-of-contents";

const mdxComponents = getMDXComponents();

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

  const Body = compiledLesson.body;

  return (
    <div className="relative flex w-full flex-row-reverse gap-x-8 px-4 pt-6 lg:pt-10 lg:pr-10 lg:pl-14">
      <TableOfContents items={compiledLesson.toc} />
      <div className="relative box-border flex w-full grow flex-col xl:w-[calc(100%-28rem)]">
        <article className="mx-auto w-full max-w-4xl pb-14">
          <h1 className="font-semibold text-4xl tracking-tight">
            {compiledLesson.frontmatter.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {compiledLesson.frontmatter.description}
          </p>
          <div className="prose prose-slate prose-compact dark:prose-invert mt-10 max-w-none prose-headings:scroll-mt-24 prose-a:font-medium text-foreground prose-code:before:content-none prose-code:after:content-none">
            <Body components={mdxComponents} />
          </div>
        </article>
      </div>
    </div>
  );
}
