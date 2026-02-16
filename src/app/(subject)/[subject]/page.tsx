import { notFound, redirect } from "next/navigation";
import {
  getSubjectBySlug,
  getSubjectSidebarTree,
} from "@/features/convex/server-queries";
import type { LessonNode } from "@/features/sidebar/types";

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

const findFirstLessonHref = (items: LessonNode[]): string | null => {
  for (const item of items) {
    if (item.href) {
      return item.href;
    }

    if (item.items) {
      const nested = findFirstLessonHref(item.items);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject: subjectSlug } = await params;
  const subject = await getSubjectBySlug(subjectSlug);

  if (!subject) {
    notFound();
  }

  const sidebarTree = await getSubjectSidebarTree(subject._id);

  let firstLessonHref: string | null = null;
  for (const group of sidebarTree.groups) {
    firstLessonHref = findFirstLessonHref(group.items);
    if (firstLessonHref) {
      break;
    }
  }

  if (firstLessonHref) {
    redirect(firstLessonHref);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 lg:px-14">
      <div className="rounded-xl border bg-card p-6">
        <h1 className="font-semibold text-2xl tracking-tight">
          {subject.name} has no published lessons yet
        </h1>
        <p className="mt-2 text-muted-foreground">
          Publish at least one lesson in Convex to enable this subject route.
        </p>
      </div>
    </div>
  );
}
