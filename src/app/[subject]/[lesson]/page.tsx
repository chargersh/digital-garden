import { redirect } from "next/navigation";
import {
  getCanonicalLessonRoute,
  getMockLesson,
} from "@/features/mdx/load-lesson-mock";
import { getMDXComponents } from "@/features/mdx/mdx-components";
import { TableOfContents } from "@/features/toc/table-of-contents";

interface LessonPageProps {
  params: Promise<{
    lesson: string;
    subject: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const [{ subject, lesson }, canonicalRoute, compiledLesson] =
    await Promise.all([
      params,
      Promise.resolve(getCanonicalLessonRoute()),
      getMockLesson(),
    ]);

  if (subject !== canonicalRoute.subject || lesson !== canonicalRoute.lesson) {
    redirect(canonicalRoute.url);
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
            <Body components={getMDXComponents()} />
          </div>
        </article>
      </div>
    </div>
  );
}
